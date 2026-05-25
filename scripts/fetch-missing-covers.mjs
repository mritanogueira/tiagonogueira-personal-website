import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COVERS_DIR = path.join(__dirname, "../assets/covers");

const MISSING = [
  { id: "a-saudade-aperta", url: "https://genius.com/Quinta-do-bill-a-saudade-aperta-lyrics" },
  { id: "se-eu-pudesse-voltar", url: "https://genius.com/Os-quatro-e-meia-and-tatanka-se-eu-pudesse-voltar-lyrics" },
  { id: "so-mais-um-instante", url: "https://genius.com/Os-quatro-e-meia-so-mais-um-instante-lyrics" },
  { id: "orgulho-ou-cobardia", url: "https://genius.com/Marco-rodrigues-orgulho-ou-cobardia-lyrics" },
  { id: "sorri-e-amei", url: "https://genius.com/Joao-farinha-sorri-e-amei-lyrics" },
  { id: "nao-vas-embora-rapaz", url: "https://genius.com/Ana-bacalhau-nao-vas-embora-rapaz-lyrics" },
  { id: "este-meu-jeito", url: "https://genius.com/Elisa-prt-and-tiago-nogueira-este-meu-jeito-lyrics" },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      const f = fs.createWriteStream(dest);
      res.pipe(f);
      f.on("finish", () => f.close(() => resolve()));
    }).on("error", reject);
  });
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  const genius = JSON.parse(fs.readFileSync(path.join(__dirname, "genius-songs.json"), "utf8"));

  for (const item of MISSING) {
    await page.goto(item.url, { waitUntil: "networkidle2", timeout: 60000 });
    const coverUrl = await page.evaluate(() => {
      const img = document.querySelector(
        'img[src*="images.genius.com"], meta[property="og:image"]'
      );
      if (img?.tagName === "META") return img.content;
      return img?.src || null;
    });
    if (coverUrl) {
      const ext = coverUrl.includes(".png") ? "png" : "jpg";
      const dest = path.join(COVERS_DIR, `${item.id}.${ext}`);
      await download(coverUrl, dest);
      const g = genius.find((s) => s.id === item.id);
      if (g) g.cover = `assets/covers/${item.id}.${ext}`;
      console.log(`OK: ${item.id}`);
    }
  }

  fs.writeFileSync(path.join(__dirname, "genius-songs.json"), JSON.stringify(genius, null, 2));
  await browser.close();
})();
