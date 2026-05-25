const INSTAGRAM_PROFILE = "https://www.instagram.com/tiagoamaralnogueira/";
const INSTAGRAM_POSTS = [
  "https://www.instagram.com/tiagoamaralnogueira/p/DYmQ2c3DODq/",
  "https://www.instagram.com/tiagoamaralnogueira/p/DYPOPWLsif3/",
  "https://www.instagram.com/tiagoamaralnogueira/p/DXzVEtwjAPj/",
  "https://www.instagram.com/tiagoamaralnogueira/p/DW3hwlQDGbU/",
  "https://www.instagram.com/tiagoamaralnogueira/p/DWn9xAGAK0E/",
  "https://www.instagram.com/tiagoamaralnogueira/p/DViieDcCPM6/",
];

function renderInstagramPostEmbed(url) {
  return `
    <blockquote
      class="instagram-media instagram-feed__post"
      data-instgrm-captioned
      data-instgrm-permalink="${url}"
      data-instgrm-version="14"
    ></blockquote>
  `;
}

function processInstagramEmbeds() {
  if (window.instgrm?.Embeds?.process) {
    window.instgrm.Embeds.process();
  }
}

function initInstagramFeed(containerId = "instagram-feed-grid") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = INSTAGRAM_POSTS.map(renderInstagramPostEmbed).join("");
  processInstagramEmbeds();
}
