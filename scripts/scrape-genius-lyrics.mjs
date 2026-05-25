import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function scrapeLyrics(page, url) {
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  await page.waitForSelector("[data-lyrics-container], .Lyrics__Container", {
    timeout: 15000,
  }).catch(() => {});

  return page.evaluate(() => {
    const containers = document.querySelectorAll(
      "[data-lyrics-container='true'], .Lyrics__Container-sc-1ynbvkt-1"
    );
    if (containers.length === 0) {
      const fallback = document.querySelector(".lyrics");
      if (fallback) return fallback.innerText.trim();
      return null;
    }
    const parts = [];
    containers.forEach((el) => {
      const text = el.innerText.trim();
      if (text) parts.push(text);
    });
    return parts.join("\n\n");
  });
}

(async () => {
  const genius = JSON.parse(
    fs.readFileSync(path.join(__dirname, "genius-songs.json"), "utf8")
  );
  const needLyrics = genius.filter((s) => !s.lyrics);
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36");

  for (const song of genius) {
    if (song.lyrics) continue;
    try {
      const lyrics = await scrapeLyrics(page, song.url);
      if (lyrics && lyrics.length > 30) {
        song.lyrics = lyrics;
        console.log(`OK lyrics: ${song.title}`);
      } else {
        song.lyrics = `[Letra disponível em ${song.url}]`;
        console.log(`SKIP: ${song.title}`);
      }
    } catch (e) {
      song.lyrics = `[Letra disponível em ${song.url}]`;
      console.log(`FAIL: ${song.title}`);
    }
  }

  fs.writeFileSync(
    path.join(__dirname, "genius-songs.json"),
    JSON.stringify(genius, null, 2)
  );
  await browser.close();
})();
