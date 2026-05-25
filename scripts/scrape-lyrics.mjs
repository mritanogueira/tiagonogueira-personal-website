import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SONGS = [
  { slug: "a-manta-do-teu-coracao", title: "A Manta do Teu Coração", year: 2020, favorite: false },
  { slug: "a-terra-gira", title: "A Terra Gira", year: 2020, favorite: true },
  { slug: "adeus-menino-do-barco-negro", title: "Adeus, Menino do Barco Negro", year: 2023, favorite: false },
  { slug: "amanha", title: "Amanhã", year: 2022, favorite: false },
  { slug: "baile-de-sao-simao", title: "Baile de São Simão", year: 2017, favorite: true },
  { slug: "bom-rapaz", title: "Bom Rapaz", year: 2020, favorite: true },
  { slug: "cancao-do-metro", title: "Canção do Metro", year: 2020, favorite: false },
  { slug: "chorinho", title: "Chorinho", year: 2017, favorite: false },
  { slug: "coisas-tao-bonitas", title: "Coisas Tão Bonitas", year: 2020, favorite: false },
  { slug: "eu-juro", title: "Eu Juro", year: 2023, favorite: false },
  { slug: "guarda-a-tua-alma", title: "Guarda a Tua Alma", year: 2022, favorite: false },
  { slug: "ja-estou-de-regresso-amor", title: "Já Estou de Regresso, Amor", year: 2017, favorite: false },
  { slug: "meu-amigo-que-saudades-de-te-ver", title: "Meu Amigo, Que Saudades de Te Ver", year: 2017, favorite: false },
  { slug: "minha-mae-esta-sempre-certa", title: "Minha Mãe Está Sempre Certa", year: 2017, favorite: true },
  { slug: "miradouro", title: "Miradouro", year: 2023, favorite: false },
  { slug: "na-escola", title: "Na Escola", year: 2023, favorite: true },
  { slug: "nao-respondo-por-mim", title: "Não Respondo Por Mim", year: 2017, favorite: false },
  { slug: "o-tempo-vai-esperar", title: "O Tempo Vai Esperar", year: 2020, favorite: true },
  { slug: "ola-solidao", title: "Olá, Solidão", year: 2021, favorite: true },
  { slug: "pra-frente-e-que-e-lisboa", title: "P'ra Frente É Que É Lisboa", year: 2017, favorite: false },
  { slug: "perdidamente", title: "Perdidamente", year: 2023, favorite: false },
  { slug: "pontos-nos-is", title: "Pontos Nos Is", year: 2017, favorite: false },
  { slug: "sabes-bem", title: "Sabes Bem", year: 2020, favorite: false },
  { slug: "se-eu-pudesse-voltar", title: "Se Eu Pudesse Voltar", year: 2017, favorite: false },
  { slug: "segue-o-coracao", title: "Segue o Coração", year: 2023, favorite: false },
  { slug: "sentir-o-sol", title: "Sentir o Sol", year: 2017, favorite: false },
  { slug: "so-mais-um-instante", title: "Só Mais Um Instante", year: 2020, favorite: false },
  { slug: "terraplanismo", title: "Terraplanismo", year: 2023, favorite: false },
  { slug: "tiques-de-rico-part-miguel-araujo", title: "Tiques de Rico (part. Miguel Araújo)", year: 2023, favorite: false },
  { slug: "um-sim-pra-regressar", title: "Um Sim P'ra Regressar", year: 2017, favorite: false },
  { slug: "vai-sem-medo", title: "Vai Sem Medo", year: 2023, favorite: false },
];

function slugToId(slug) {
  return slug.replace(/-part-miguel-araujo$/, "").replace(/-part-.*$/, "");
}

async function scrapeLyrics(page, slug) {
  const url = `https://www.letras.mus.br/os-quatro-e-meia/${slug}/`;
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  await page.waitForSelector(".lyric-original, .cnt-letra", { timeout: 15000 }).catch(() => {});

  const lyrics = await page.evaluate(() => {
    const container =
      document.querySelector(".lyric-original") ||
      document.querySelector(".cnt-letra .lyric-original") ||
      document.querySelector(".cnt-letra");
    if (!container) return null;
    return container.innerText.trim();
  });

  return lyrics;
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  const results = [];
  let success = 0;

  for (const song of SONGS) {
    try {
      const lyrics = await scrapeLyrics(page, song.slug);
      if (lyrics && lyrics.length > 20) {
        success++;
        results.push({
          id: slugToId(song.slug),
          title: song.title,
          year: song.year,
          artist: "Os Quatro e Meia",
          favorite: song.favorite,
          lyrics,
        });
        console.log(`OK: ${song.title}`);
      } else {
        console.log(`FAIL (empty): ${song.title}`);
        results.push({
          id: slugToId(song.slug),
          title: song.title,
          year: song.year,
          artist: "Os Quatro e Meia",
          favorite: song.favorite,
          lyrics: `[Letra indisponível — consultar em https://www.letras.mus.br/os-quatro-e-meia/${song.slug}/]`,
        });
      }
    } catch (err) {
      console.log(`FAIL: ${song.title} — ${err.message}`);
      results.push({
        id: slugToId(song.slug),
        title: song.title,
        year: song.year,
        artist: "Os Quatro e Meia",
        favorite: song.favorite,
        lyrics: `[Letra indisponível — consultar em https://www.letras.mus.br/os-quatro-e-meia/${song.slug}/]`,
      });
    }
  }

  await browser.close();

  const outPath = path.join(__dirname, "songs-data.json");
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nScraped ${success}/${SONGS.length} songs → ${outPath}`);
})();
