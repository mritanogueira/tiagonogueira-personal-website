const INSTAGRAM_PROFILE = "https://www.instagram.com/tiagoamaralnogueira/";
const INSTAGRAM_FEED_MAX = 9;

const INSTAGRAM_POST_FALLBACK = [
  "DYt1b1TCvlN",
  "DYmQ2c3DODq",
  "DYhMxQ4se7d",
  "DYPOPWLsif3",
  "DXzVEtwjAPj",
  "DXv_7XoMGuX",
  "DW3hwlQDGbU",
  "DWn9xAGAK0E",
  "DWn56THjGCS",
].map((id) => ({
  id,
  permalink: `${INSTAGRAM_PROFILE}p/${id}/`,
}));

function getEmbedUrl(permalink) {
  const match = permalink.match(/\/p\/([^/]+)/);
  const shortcode = match?.[1];
  if (!shortcode) return null;
  return `https://www.instagram.com/p/${shortcode}/embed`;
}

function truncateCaption(text, max = 140) {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInstagramPost(post) {
  const embedUrl = getEmbedUrl(post.permalink);
  if (!embedUrl) return "";

  const caption = truncateCaption(post.title);
  const captionHtml = caption
    ? `<p class="instagram-feed__caption">${escapeHtml(caption)}</p>`
    : "";

  return `
    <article class="instagram-feed__item">
      <div class="instagram-feed__embed-wrap">
        <iframe
          class="instagram-feed__iframe"
          src="${embedUrl}"
          title="${escapeHtml(caption || "Publicação no Instagram")}"
          loading="lazy"
          allowfullscreen
          scrolling="no"
          referrerpolicy="strict-origin-when-cross-origin"
        ></iframe>
      </div>
      ${captionHtml}
      <a
        href="${post.permalink}"
        class="instagram-feed__permalink"
        target="_blank"
        rel="noopener noreferrer"
      >
        Ver no Instagram
      </a>
    </article>
  `;
}

function renderInstagramFeedSkeleton(count = 9) {
  return Array.from(
    { length: count },
    () => '<div class="instagram-feed__item instagram-feed__item--skeleton" aria-hidden="true"></div>'
  ).join("");
}

function normalizePosts(posts) {
  return posts
    .filter((post) => post?.permalink)
    .slice(0, INSTAGRAM_FEED_MAX)
    .map((post) => ({
      id: post.id || post.permalink,
      permalink: post.permalink,
      title: post.title || "",
    }));
}

function loadInstagramFeedData() {
  if (window.INSTAGRAM_FEED_DATA?.posts?.length) {
    return normalizePosts(window.INSTAGRAM_FEED_DATA.posts);
  }
  return normalizePosts(INSTAGRAM_POST_FALLBACK);
}

function initInstagramFeed(containerId = "instagram-feed-grid") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = renderInstagramFeedSkeleton(INSTAGRAM_FEED_MAX);
  container.setAttribute("aria-busy", "true");

  const posts = loadInstagramFeedData();
  container.innerHTML = posts.map(renderInstagramPost).join("");
  container.removeAttribute("aria-busy");
}
