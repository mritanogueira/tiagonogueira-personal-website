import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const streamingPath = path.join(__dirname, "streaming-links.json");

const songsJsPath = path.join(__dirname, "../js/songs.js");
const songsRaw = fs.readFileSync(songsJsPath, "utf8");
const data = JSON.parse(
  songsRaw.replace(/^const SONGS = /, "").replace(/;\s*function[\s\S]*/, "")
);

const streaming = fs.existsSync(streamingPath)
  ? JSON.parse(fs.readFileSync(streamingPath, "utf8"))
  : {};

const merged = data.map((song) => {
  const links = streaming[song.id];
  if (!links) return song;
  return {
    ...song,
    ...(links.spotifyTrackId && { spotifyTrackId: links.spotifyTrackId }),
    ...(links.youtubeVideoId && { youtubeVideoId: links.youtubeVideoId }),
  };
});

function escapeLyrics(str) {
  return str.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
}

const songsJs = `const SONGS = ${JSON.stringify(merged, null, 2)};

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

fs.writeFileSync(path.join(__dirname, "../js/songs.js"), songsJs);
const withStreaming = merged.filter(
  (s) => s.spotifyTrackId || s.youtubeVideoId
).length;
console.log(
  `Generated js/songs.js with ${merged.length} songs (${withStreaming} with streaming links)`
);
