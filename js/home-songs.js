const HOME_SONG_CARDS = [
  {
    id: "a-saudade-aperta",
    title: "A Saudade Aperta",
    image: "assets/a-saudade-aperta.gif",
    artist: "Quinta do Bill",
  },
  {
    id: "amanha",
    title: "Amanhã",
    image: "assets/amanha.png",
    artist: "Os Quatro e Meia",
  },
  {
    id: "meu-amor-dorme-bem",
    title: "Meu Amor Dorme Bem",
    image: "assets/meu-amor-dorme-bem.jpg",
    artist: "Os Quatro e Meia",
  },
  {
    id: "ola-solidao",
    title: "Olá Solidão",
    image: "assets/ola-solidao.gif",
    artist: "Os Quatro e Meia",
  },
  {
    id: "quem-me-ve",
    title: "Quem Me Vê",
    image: "assets/quem-me-ve.gif",
    artist: "Luís Trigacheiro",
  },
  {
    id: "a-terra-gira",
    title: "A Terra Gira",
    image: "assets/a-terra-gira.jpeg",
    artist: "Os Quatro e Meia",
  },
  {
    id: "na-escola",
    title: "Na Escola",
    image: "assets/na-escola.jpeg",
    artist: "Os Quatro e Meia",
  },
  {
    id: "lenco",
    title: "Lenço",
    image: "assets/lenco.gif",
    artist: "João Só & Tiago Nogueira",
  },
];

const HOME_SONGS_INITIAL = 4;
const HOME_SONGS_BATCH = 2;

const HOME_SONG_ARROW = `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 10L10 2M10 2H4M10 2V8"/></svg>`;

function getHomeSongMeta(card) {
  const song = typeof getSongById === "function" ? getSongById(card.id) : null;
  const performer = song?.artist || card.artist;
  const artist = song?.composer ? `${performer} · Música · ${song.composer}` : performer;

  return {
    artist,
    href: song ? `musica.html?song=${card.id}` : "musica.html",
  };
}

function renderHomeSongCard(card, isHidden) {
  const { artist, href } = getHomeSongMeta(card);
  const hiddenClass = isHidden ? " song-card--hidden" : "";
  const a11y = isHidden ? ' aria-hidden="true" tabindex="-1"' : "";

  return `
    <a href="${href}" class="card-media song-card${hiddenClass}"${a11y}>
      <img src="${card.image}" alt="${card.title}" class="card-media__image" loading="lazy" decoding="async" />
      <div class="card-media__caption">
        <span class="link-arrow__circle">
          ${HOME_SONG_ARROW}
        </span>
        ${card.title} · ${artist}
      </div>
    </a>
  `;
}

function revealHomeSongCards(grid, count) {
  const hidden = [...grid.querySelectorAll(".song-card--hidden")].slice(0, count);

  hidden.forEach((card) => {
    card.classList.remove("song-card--hidden");
    card.removeAttribute("aria-hidden");
    card.removeAttribute("tabindex");
    requestAnimationFrame(() => {
      card.classList.add("song-card--revealed");
    });
  });

  return hidden.length;
}

function initHomeSongCards() {
  const grid = document.getElementById("home-songs-grid");
  const btn = document.getElementById("home-songs-more");
  if (!grid || !btn) return;

  grid.innerHTML = HOME_SONG_CARDS.map((card, index) =>
    renderHomeSongCard(card, index >= HOME_SONGS_INITIAL)
  ).join("");

  btn.addEventListener("click", () => {
    revealHomeSongCards(grid, HOME_SONGS_BATCH);
    const remaining = grid.querySelectorAll(".song-card--hidden").length;

    if (remaining === 0) {
      const link = document.createElement("a");
      link.href = "musica.html";
      link.className = "home-cta-outline";
      link.textContent = "Explorar Mais";
      btn.replaceWith(link);
    }
  });
}
