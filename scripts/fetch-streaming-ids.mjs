/**
 * Fetches Spotify track IDs and YouTube video IDs for songs in songs-data.json.
 * Run: node scripts/fetch-streaming-ids.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const songsJsPath = path.join(__dirname, "../js/songs.js");
const outPath = path.join(__dirname, "streaming-links.json");

function loadSongs() {
  const raw = fs.readFileSync(songsJsPath, "utf8");
  return JSON.parse(
    raw.replace(/^const SONGS = /, "").replace(/;\s*function[\s\S]*/, "")
  );
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function normalizeArtist(artist) {
  return artist.split("&")[0].split(",")[0].trim();
}

function titleMatches(candidate, expected) {
  const a = candidate
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  const b = expected
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  return a.includes(b) || b.includes(a);
}

async function verifySpotifyTrack(title, trackId) {
  try {
    const res = await fetch(
      `https://open.spotify.com/oembed?url=https://open.spotify.com/track/${trackId}`
    );
    if (!res.ok) return false;
    const data = await res.json();
    return titleMatches(data.title || "", title);
  } catch {
    return false;
  }
}

async function openSpotifySearch(page) {
  await page.goto("https://open.spotify.com/", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  await delay(2000);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button, a")].find((el) =>
      /search|procurar|pesquisar/i.test(
        el.getAttribute("aria-label") || el.textContent || ""
      )
    );
    if (btn) btn.click();
  });
  await delay(800);
}

async function fetchSpotifyTrackId(page, title, artist) {
  const query = `${title} ${normalizeArtist(artist)}`;
  await openSpotifySearch(page);
  await page.keyboard.down("Meta");
  await page.keyboard.press("a");
  await page.keyboard.up("Meta");
  await page.keyboard.press("Backspace");
  await page.keyboard.type(query, { delay: 30 });
  await page.keyboard.press("Enter");
  await delay(3500);

  const trackIds = await page.evaluate(() => {
    const ids = new Set();
    for (const a of document.querySelectorAll("a")) {
      const m = (a.href || "").match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/);
      if (m) ids.add(m[1]);
    }
    return [...ids];
  });

  for (const id of trackIds.slice(0, 5)) {
    if (await verifySpotifyTrack(title, id)) return id;
  }
  return trackIds[0] || null;
}

function scoreYoutubeResult(row, song) {
  const t = row.title.toLowerCase();
  let score = 0;
  const titleNorm = song.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");

  if (t.includes(titleNorm) || titleNorm.split(" ")[0].length > 3 && t.includes(titleNorm.split(" ")[0])) {
    score += 4;
  }
  if (/official|videoclip|vídeo oficial|video oficial/i.test(t)) score += 3;
  if (normalizeArtist(song.artist).toLowerCase().split(" ")[0].length > 2) {
    const artistBit = normalizeArtist(song.artist).toLowerCase().split(" ")[0];
    if (t.includes(artistBit)) score += 2;
  }
  if (/lyric|letra|legendado|karaoke/i.test(t)) score -= 4;
  if (/ao vivo|live at|festival da canção/i.test(t)) score -= 1;
  return score;
}

async function fetchYoutubeVideoId(page, title, artist) {
  const query = encodeURIComponent(`${title} ${artist} official`);
  await page.goto(`https://www.youtube.com/results?search_query=${query}`, {
    waitUntil: "domcontentloaded",
    timeout: 45000,
  });
  await delay(2500);

  const rows = await page.evaluate(() =>
    [...document.querySelectorAll("ytd-video-renderer")]
      .slice(0, 10)
      .map((row) => {
        const a = row.querySelector("a#video-title");
        const href = a?.href || "";
        const m = href.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        return m
          ? { id: m[1], title: (a.textContent || "").trim() }
          : null;
      })
      .filter(Boolean)
  );

  if (!rows.length) return null;
  const sorted = [...rows].sort(
    (a, b) => scoreYoutubeResult(b, { title, artist }) - scoreYoutubeResult(a, { title, artist })
  );
  return sorted[0]?.id || null;
}

async function main() {
  const songs = loadSongs();
  const existing = fs.existsSync(outPath)
    ? JSON.parse(fs.readFileSync(outPath, "utf8"))
    : {};

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  const results = { ...existing };

  for (const song of songs) {
    const entry = { ...(results[song.id] || {}) };
    console.log(`\n${song.id}: ${song.title}`);

    if (!entry.spotifyTrackId) {
      try {
        entry.spotifyTrackId = await fetchSpotifyTrackId(
          page,
          song.title,
          song.artist
        );
        console.log(`  spotify: ${entry.spotifyTrackId || "—"}`);
      } catch (e) {
        console.warn(`  spotify error: ${e.message}`);
      }
    } else {
      console.log(`  spotify: ${entry.spotifyTrackId} (cached)`);
    }

    if (!entry.youtubeVideoId) {
      try {
        entry.youtubeVideoId = await fetchYoutubeVideoId(
          page,
          song.title,
          song.artist
        );
        console.log(`  youtube: ${entry.youtubeVideoId || "—"}`);
      } catch (e) {
        console.warn(`  youtube error: ${e.message}`);
      }
    } else {
      console.log(`  youtube: ${entry.youtubeVideoId} (cached)`);
    }

    results[song.id] = entry;
    fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
    await delay(600);
  }

  await browser.close();
  console.log(`\nWrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
