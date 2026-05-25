import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function normalizeTitle(t) {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function parseArtist(raw, url) {
  if (!raw || raw.includes("<img")) {
    if (/bom-rapaz/i.test(url)) return "Os Quatro e Meia & Carlão";
    if (/os-quatro-e-meia/i.test(url)) return "Os Quatro e Meia";
    if (/joao-so/i.test(url)) return "João Só & Tiago Nogueira";
    if (/elisa-prt/i.test(url)) return "Elisa (PRT) & Tiago Nogueira";
    if (/carolina-de-deus/i.test(url)) return "Carolina de Deus";
    if (/luis-trigacheiro/i.test(url)) return "Luís Trigacheiro";
    if (/monica-teotonio/i.test(url)) return "Mónica Teotónio & Tiago Nogueira";
    if (/quinta-do-bill/i.test(url)) return "Quinta do Bill & Tiago Nogueira";
    if (/marco-rodrigues/i.test(url)) return "Marco Rodrigues";
    if (/joao-farinha/i.test(url)) return "João Farinha";
    if (/ana-bacalhau/i.test(url)) return "Ana Bacalhau";
    if (/buba-espinho/i.test(url)) return "Buba Espinho, Tatanka & Tiago Nogueira";
    if (/tatanka/i.test(url)) return "Os Quatro e Meia & Tatanka";
    return "Tiago Nogueira";
  }
  return raw.replace(/<[^>]+>/g, "").trim();
}

const existingPath = path.join(__dirname, "../js/songs.js");
const existingSrc = fs.readFileSync(existingPath, "utf8");
const existingMatch = existingSrc.match(/const SONGS = (\[[\s\S]*?\]);/);
const existing = existingMatch ? JSON.parse(existingMatch[1]) : [];

const genius = JSON.parse(
  fs.readFileSync(path.join(__dirname, "genius-songs.json"), "utf8")
);

const byId = new Map(existing.map((s) => [s.id, { ...s }]));
const byNormTitle = new Map(existing.map((s) => [normalizeTitle(s.title), s.id]));

const FAVORITE_IDS = new Set([
  "na-escola",
  "ola-solidao",
  "o-tempo-vai-esperar",
  "bom-rapaz",
  "a-terra-gira",
  "baile-de-sao-simao",
  "minha-mae-esta-sempre-certa",
]);

const YEAR_MAP = {
  "na-escola": 2023,
  "amanha": 2022,
  "guarda-a-tua-alma": 2022,
  "ola-solidao": 2021,
  "estou-tao-bem-assim": 2020,
  "traicoeira-e-a-sorte": 2020,
};

for (const g of genius) {
  const artist = parseArtist(g.artist, g.url);
  let id = g.id;
  const norm = normalizeTitle(g.title);

  if (byNormTitle.has(norm)) {
    id = byNormTitle.get(norm);
  } else if (id === "so-mais-um-instante" && byId.has("so-mais-um-instante")) {
    id = "so-mais-um-instante";
  } else if (id === "tiques-de-rico" && byId.has("tiques-de-rico-part-miguel-araujo")) {
    id = "tiques-de-rico-part-miguel-araujo";
  }

  const prev = byId.get(id);
  const entry = {
    id,
    title: g.title,
    year: prev?.year ?? YEAR_MAP[id] ?? 2020,
    artist: prev?.artist ?? artist,
    favorite: prev?.favorite ?? FAVORITE_IDS.has(id),
    cover: g.cover || prev?.cover || null,
    geniusUrl: g.url,
    lyrics: prev?.lyrics || g.lyrics || `[Letra disponível em ${g.url}]`,
  };

  if (g.title === "Só Mais um Instante" && byId.has("so-mais-um-instante")) {
    entry.title = "Só Mais Um Instante";
    entry.id = "so-mais-um-instante";
  }

  byId.set(entry.id, entry);
  byNormTitle.set(normalizeTitle(entry.title), entry.id);
}

const geniusByTitle = new Map(
  genius.map((g) => [normalizeTitle(g.title), g.cover])
);

const DEFAULT_COVER = "assets/covers/o-tempo-vai-esperar.jpg";

for (const song of byId.values()) {
  if (!song.cover) {
    const c = geniusByTitle.get(normalizeTitle(song.title));
    if (c) song.cover = c;
    else if (/Os Quatro e Meia/i.test(song.artist)) song.cover = DEFAULT_COVER;
  }
}

const merged = [...byId.values()].sort((a, b) =>
  a.title.localeCompare(b.title, "pt")
);

const out = `const SONGS = ${JSON.stringify(merged, null, 2)};

function getSongById(id) {
  return SONGS.find((s) => s.id === id);
}

function getFavorites() {
  return SONGS.filter((s) => s.favorite);
}

function getSongsSorted() {
  return [...SONGS].sort((a, b) =>
    a.title.localeCompare(b.title, "pt")
  );
}

function searchSongs(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SONGS.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q)
  );
}
`;

fs.writeFileSync(path.join(__dirname, "../js/songs.js"), out);
console.log(`Merged ${merged.length} songs (${genius.length} from Genius)`);
console.log(`With covers: ${merged.filter((s) => s.cover).length}`);
