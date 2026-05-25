import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COVERS_DIR = path.join(__dirname, "../assets/covers");

function slugify(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractCoverUrl(hint) {
  if (!hint) return null;
  const match = hint.match(/https:\/\/images\.genius\.com\/[^"'\s]+/);
  return match ? match[0] : null;
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          if (fs.existsSync(dest)) fs.unlinkSync(dest);
          return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve(dest)));
      })
      .on("error", reject);
  });
}

(async () => {
  fs.mkdirSync(COVERS_DIR, { recursive: true });

  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
  );

  await page.goto("https://genius.com/artists/Tiago-nogueira/songs", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise((r) => setTimeout(r, 2500));

  const songs = await page.evaluate(() => {
    const items = [];
    const seen = new Set();

    document.querySelectorAll("li").forEach((li) => {
      const h3 = li.querySelector("h3");
      const link = li.querySelector("a[href*='-lyrics']");
      if (!h3 || !link) return;

      const title = h3.textContent.trim();
      const href = link.href;
      if (!title || seen.has(href)) return;
      seen.add(href);

      const img = li.querySelector("img");
      const cover = img?.src || img?.getAttribute("data-src") || null;
      const fullText = li.textContent.replace(title, "").trim();

      items.push({ title, url: href, cover, artistHint: fullText.slice(0, 120) });
    });

    return items;
  });

  console.log(`Found ${songs.length} songs`);

  const enriched = [];
  for (const song of songs) {
    const coverUrl = song.cover || extractCoverUrl(song.artistHint);
    let coverPath = null;

    if (coverUrl && coverUrl.includes("images.genius.com")) {
      const ext = coverUrl.includes(".png") ? "png" : "jpg";
      const filename = `${slugify(song.title)}.${ext}`;
      const dest = path.join(COVERS_DIR, filename);
      try {
        await downloadFile(coverUrl, dest);
        coverPath = `assets/covers/${filename}`;
        console.log(`OK cover: ${song.title}`);
      } catch (e) {
        console.log(`FAIL cover: ${song.title} - ${e.message}`);
      }
    }

    let artist = song.artistHint;
    if (artist.includes("<img")) artist = artist.split("Os Quatro")[1] ? "Os Quatro e Meia" : artist;
    if (/Os Quatro e Meia/i.test(song.url) || /os-quatro-e-meia/i.test(song.url)) {
      artist = "Os Quatro e Meia";
    } else if (/Joao-so|João/i.test(song.url)) {
      artist = artist || "João Só";
    } else if (/Elisa-prt/i.test(song.url)) {
      artist = "Elisa (PRT)";
    } else if (/Carolina-de-deus/i.test(song.url)) {
      artist = "Carolina de Deus";
    } else if (/Luis-trigacheiro/i.test(song.url)) {
      artist = "Luís Trigacheiro";
    } else if (/Monica-teotonio/i.test(song.url)) {
      artist = "Mónica Teotónio";
    } else if (/Quinta-do-bill/i.test(song.url)) {
      artist = "Quinta do Bill";
    } else if (/Marco-rodrigues/i.test(song.url)) {
      artist = "Marco Rodrigues";
    } else if (/Joao-farinha/i.test(song.url)) {
      artist = "João Farinha";
    } else if (/Ana-bacalhau/i.test(song.url)) {
      artist = "Ana Bacalhau";
    } else if (/Buba-espinho/i.test(song.url)) {
      artist = "Buba Espinho, Tatanka & Tiago Nogueira";
    } else if (/Tatanka/i.test(song.url) && /se-eu-pudesse/i.test(song.url)) {
      artist = "Os Quatro e Meia & Tatanka";
    }

    enriched.push({
      id: slugify(song.title),
      title: song.title,
      url: song.url,
      artist: artist.replace(/<[^>]+>/g, "").trim() || "Tiago Nogueira",
      cover: coverPath,
      coverUrl,
    });
  }

  fs.writeFileSync(
    path.join(__dirname, "genius-songs.json"),
    JSON.stringify(enriched, null, 2)
  );

  await browser.close();
  console.log(`Done: ${enriched.filter((s) => s.cover).length}/${enriched.length} covers`);
})();
