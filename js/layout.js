const ARROW_ICON = `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 10L10 2M10 2H4M10 2V8"/></svg>`;
const SEARCH_ICON = `<svg class="search-bar__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="7" r="5"/><path d="M11 11L14 14"/></svg>`;
const INSTAGRAM_ICON = `<svg class="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg>`;

const SOCIAL_ACCOUNTS = [
  {
    name: "Tiago Nogueira",
    url: "https://www.instagram.com/tiagoamaralnogueira/",
  },
  {
    name: "Os Quatro e Meia",
    url: "https://www.instagram.com/osquatroemeia/",
  },
];

function renderSocialIconLink(account, linkClass = "social-link") {
  return `<a href="${account.url}" class="${linkClass}" target="_blank" rel="noopener noreferrer" aria-label="Instagram — ${account.name}">${INSTAGRAM_ICON}</a>`;
}

function renderSocialIconLinks(linkClass = "social-link") {
  return SOCIAL_ACCOUNTS.map((account) => renderSocialIconLink(account, linkClass)).join("");
}

function renderInstagramProfileLink(account, linkClass, nameClass = "") {
  const nameMarkup = nameClass
    ? `<span class="${nameClass}">${account.name}</span>`
    : account.name;
  return `<a href="${account.url}" class="${linkClass}" target="_blank" rel="noopener noreferrer">${INSTAGRAM_ICON}${nameMarkup}</a>`;
}

function renderFooterSocialBlock(account, index) {
  const label =
    index === 0 ? `<p class="site-footer__info-label">Instagram</p>` : "";
  const blockClass =
    index === 0
      ? "site-footer__info-block"
      : "site-footer__info-block site-footer__info-block--social-tail";

  return `
    <div class="${blockClass}">
      ${label}
      <p class="site-footer__info-value">
        ${renderInstagramProfileLink(
          account,
          "site-footer__social-item site-footer__social-link",
          "site-footer__social-name"
        )}
      </p>
    </div>`;
}

function renderSocialAccountsList(
  linkClass = "site-footer__social-link",
  nameClass = "site-footer__social-name"
) {
  return SOCIAL_ACCOUNTS.map((account) =>
    renderInstagramProfileLink(account, `site-footer__social-item ${linkClass}`, nameClass)
  ).join("");
}

function initConcertInstagramAccounts() {
  const container = document.querySelector(".concert-instagram__accounts");
  if (!container) return;

  container.innerHTML = SOCIAL_ACCOUNTS.map((account) =>
    renderInstagramProfileLink(account, "concert-instagram__profile")
  ).join("");
}

function getCurrentPage() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  return path.replace(".html", "");
}

function isHomePage() {
  const page = getCurrentPage();
  return page === "" || page === "index";
}

function renderSiteLogo() {
  return `
    <a href="index.html" class="site-logo" aria-label="Tiago Nogueira — página inicial">
      <img src="logotipo.png" alt="Tiago Nogueira" class="site-logo__img" width="200" height="200" />
    </a>
  `;
}

function renderSearchBar(options = {}) {
  const {
    placeholder = "Pesquisar Canções",
    formId = "global-search-form",
    inputId = "global-search-input",
    resultsId = "global-search-results",
    extraClass = "",
  } = options;
  const formClass = ["search-bar", extraClass].filter(Boolean).join(" ");

  return `
    <div class="search-bar-wrap">
      <form class="${formClass}" id="${formId}" data-global-search role="search">
        ${SEARCH_ICON}
        <input
          type="search"
          class="search-bar__input"
          id="${inputId}"
          placeholder="${placeholder}"
          aria-label="${placeholder}"
          aria-controls="${resultsId}"
          aria-expanded="false"
          aria-autocomplete="list"
          autocomplete="off"
          enterkeyhint="search"
        />
      </form>
      <div
        class="search-dropdown"
        id="${resultsId}"
        role="listbox"
        aria-label="Resultados da pesquisa"
        hidden
      ></div>
    </div>
  `;
}

function renderSiteNav(linkClass = "site-nav__link") {
  const page = getCurrentPage();
  const active = (name) => (page === name ? ` ${linkClass}--active` : "");

  return `
    <nav class="site-nav" aria-label="Navegação principal">
      <a href="biografia.html" class="${linkClass}${active("biografia")}">Biografia</a>
      <a href="musica.html" class="${linkClass}${active("musica")}">Música</a>
      <a href="concertos.html" class="${linkClass}${active("concertos")}">Concertos</a>
    </nav>
  `;
}

const THEME_TOGGLE_BRIGHT = `<svg class="theme-toggle__svg" viewBox="0 0 61 61" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="1" y="1" width="59" height="59" rx="29.5" fill="white" fill-opacity="0.5" stroke="black" stroke-width="2"/><path d="M30.9998 36.4286C33.7636 36.4286 35.262 35.959 36.1169 35.0985C36.9733 34.2364 37.4285 32.7366 37.4285 29.9999C37.4285 27.263 36.9734 25.7633 36.1169 24.9012C35.262 24.0407 33.7636 23.5712 30.9998 23.5712C28.2365 23.5712 26.7551 24.041 25.908 24.8993C25.0548 25.7639 24.6008 27.2673 24.571 30.0106C24.5415 32.7408 24.9986 34.2369 25.8582 35.0965C26.7209 35.9593 28.2358 36.4285 30.9998 36.4286Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M31 17.9286V19.7857" stroke="black" stroke-width="2" stroke-linecap="round"/><path d="M31 40.2143V42.0714" stroke="black" stroke-width="2" stroke-linecap="round"/><path d="M43.0714 30L41.2143 30" stroke="black" stroke-width="2" stroke-linecap="round"/><path d="M20.7858 30L18.9286 30" stroke="black" stroke-width="2" stroke-linecap="round"/><path d="M21.7142 20.7143L23.0274 22.0275" stroke="black" stroke-width="2" stroke-linecap="round"/><path d="M21.7142 39.6702L23.0274 38.357" stroke="black" stroke-width="2" stroke-linecap="round"/><path d="M40.6702 20.7143L39.357 22.0275" stroke="black" stroke-width="2" stroke-linecap="round"/><path d="M40.6702 39.6702L39.357 38.357" stroke="black" stroke-width="2" stroke-linecap="round"/></svg>`;
const THEME_TOGGLE_DARK = `<svg class="theme-toggle__svg" viewBox="0 0 61 61" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="1" y="1" width="59" height="59" rx="29.5" stroke="white" stroke-width="2"/><path d="M41.92 34.5224L42.8449 34.9026C43.0035 34.5169 42.9061 34.0733 42.6004 33.7896C42.2948 33.5058 41.8452 33.4415 41.4723 33.6283L41.92 34.5224ZM30.9386 41.958L30.9386 42.958L30.9386 42.958L30.9386 41.958ZM19.0402 29.8623L18.0402 29.8622L18.0402 29.8623L19.0402 29.8623ZM28.4152 18.0429L29.2223 18.6333C29.4678 18.2977 29.48 17.8452 29.2529 17.4968C29.0258 17.1485 28.6069 16.977 28.2007 17.0662L28.4152 18.0429ZM26.2765 24.6201L25.2765 24.6201L25.2765 24.6201L26.2765 24.6201ZM37.131 35.6543L37.131 36.6543L37.131 36.6543L37.131 35.6543ZM41.92 34.5224L40.9951 34.1422C39.3459 38.154 35.4576 40.9578 30.9386 40.958L30.9386 41.958L30.9386 42.958C36.3119 42.9578 40.9043 39.6234 42.8449 34.9026L41.92 34.5224ZM30.9386 41.958L30.9386 40.958C24.9353 40.958 20.0402 36.0054 20.0402 29.8623L19.0402 29.8623L18.0402 29.8623C18.0402 37.0788 23.7998 42.958 30.9386 42.958L30.9386 41.958ZM19.0402 29.8623L20.0402 29.8623C20.0403 24.5319 23.7302 20.0953 28.6296 19.0197L28.4152 18.0429L28.2007 17.0662C22.3825 18.3435 18.0404 23.5939 18.0402 29.8622L19.0402 29.8623ZM28.4152 18.0429L27.608 17.4526C26.1429 19.4558 25.2765 21.9372 25.2765 24.6201L26.2765 24.6201L27.2765 24.6201C27.2765 22.3736 28.0007 20.3035 29.2223 18.6333L28.4152 18.0429ZM26.2765 24.6201L25.2765 24.6201C25.2767 31.2507 30.5685 36.6543 37.131 36.6543L37.131 35.6543L37.131 34.6543C31.7039 34.6543 27.2767 30.1773 27.2765 24.62L26.2765 24.6201ZM37.131 35.6543L37.131 36.6543C39.0106 36.6542 40.7885 36.2074 42.3678 35.4166L41.92 34.5224L41.4723 33.6283C40.1622 34.2843 38.69 34.6542 37.131 34.6543L37.131 35.6543Z" fill="white"/></svg>`;

function renderThemeToggle() {
  return `
    <button
      type="button"
      class="theme-toggle"
      id="theme-toggle"
      aria-pressed="false"
      aria-label="Ativar modo escuro"
    >
      <span class="theme-toggle__art theme-toggle__art--bright" aria-hidden="true">${THEME_TOGGLE_BRIGHT}</span>
      <span class="theme-toggle__art theme-toggle__art--dark" aria-hidden="true">${THEME_TOGGLE_DARK}</span>
    </button>
  `;
}

function renderMenuToggle() {
  return `
    <button
      type="button"
      class="menu-toggle"
      id="menu-toggle"
      aria-expanded="false"
      aria-controls="mobile-menu"
      aria-label="Abrir menu"
    >
      <span class="menu-toggle__lines" aria-hidden="true">
        <span class="menu-toggle__bar"></span>
        <span class="menu-toggle__bar"></span>
        <span class="menu-toggle__bar"></span>
      </span>
    </button>
  `;
}

function renderMobileMenu() {
  const page = getCurrentPage();
  const active = (name) => (page === name ? " mobile-menu__link--active" : "");

  return `
    <div class="mobile-menu" id="mobile-menu" aria-hidden="true">
      <div class="mobile-menu__panel">
        <div class="mobile-menu__top">
          <a href="index.html" class="mobile-menu__mark" aria-label="Tiago Nogueira — página inicial">TN</a>
          <button type="button" class="mobile-menu__close" id="mobile-menu-close" aria-label="Fechar menu">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <path d="M4 4L16 16M16 4L4 16"/>
            </svg>
          </button>
        </div>
        <nav class="mobile-menu__nav" aria-label="Navegação principal">
          <a href="biografia.html" class="mobile-menu__link${active("biografia")}">Biografia</a>
          <a href="musica.html" class="mobile-menu__link${active("musica")}">Música</a>
          <a href="concertos.html" class="mobile-menu__link${active("concertos")}">Concertos</a>
        </nav>
        <div class="mobile-menu__footer">
          <div class="mobile-menu__divider" aria-hidden="true"></div>
          <div class="mobile-menu__social">
            ${SOCIAL_ACCOUNTS.map(
              (account) =>
                `<a href="${account.url}" target="_blank" rel="noopener noreferrer">Instagram — ${account.name}</a>`
            ).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderHeader(variant = "light") {
  const isLight = variant === "light";
  const headerClass = [
    "site-header",
    isLight ? "site-header--light" : "site-header--solid",
    "site-header--with-logo",
  ].join(" ");

  return `
    <header class="${headerClass}">
      <div class="site-header__inner">
        <div class="site-header__start">${renderSiteLogo()}</div>
        <div class="site-header__center">
          ${renderSearchBar()}
        </div>
        <div class="site-header__end">
          <div class="site-header__nav-desktop">
            ${renderSiteNav()}
          </div>
          <div class="site-header__controls">
            ${renderThemeToggle()}
            ${renderMenuToggle()}
          </div>
        </div>
      </div>
      ${renderMobileMenu()}
    </header>
  `;
}

function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="container">
        <p class="site-footer__eyebrow">Música, Letra, Composição, Produção</p>
        <div class="site-footer__hero">
          <div class="site-footer__cta-copy">
            <p class="site-footer__cta-line">Algum projecto em mente?</p>
            <p class="site-footer__cta-line">
              <a href="mailto:tiago@nogueira.pt" class="site-footer__cta-link">Deixa mensagem...</a>
            </p>
          </div>
          <div class="site-footer__cta-action">
            <a href="mailto:tiago@nogueira.pt" class="btn-circle btn-circle--footer">Mensagem</a>
          </div>
        </div>
        <div class="site-footer__info">
          <div class="site-footer__info-block">
            <p class="site-footer__info-label">Management &amp; Booking:</p>
            <p class="site-footer__info-value">
              <a href="mailto:pedro.barbosa@primeiralinha.pt">pedro.barbosa@primeiralinha.pt</a>
            </p>
          </div>
          ${SOCIAL_ACCOUNTS.map((account, index) => renderFooterSocialBlock(account, index)).join("")}
        </div>
      </div>
      <div class="site-footer__copyright">
        Copyright © 2026, Tiago Amaral Nogueira
      </div>
    </footer>
  `;
}

function renderSongModal() {
  return `
    <div class="modal-overlay" id="song-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal">
        <button class="modal__close" id="modal-close" aria-label="Close">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M2 2L10 10M10 2L2 10"/>
          </svg>
        </button>
        <img class="modal__cover" id="modal-cover" alt="" width="120" height="120" hidden />
        <p class="modal__meta" id="modal-meta"></p>
        <h2 class="modal__title" id="modal-title"></h2>
        <div class="modal__body" id="modal-body">
          <div class="modal__lyrics" id="modal-lyrics"></div>
          <aside class="modal__media" id="modal-media" aria-label="Ouvir canção" hidden></aside>
        </div>
      </div>
    </div>
  `;
}

function renderSongStreaming(song) {
  const spotifyId = song.spotifyTrackId;
  const youtubeId = song.youtubeVideoId;
  if (!spotifyId && !youtubeId) return "";

  const spotifyEmbed = spotifyId
    ? `
      <div class="modal__embed">
        <h3 class="modal__embed-label">Spotify</h3>
        <iframe
          class="modal__embed-frame modal__embed-frame--spotify"
          src="https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator"
          title="Spotify — ${song.title}"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          referrerpolicy="strict-origin-when-cross-origin"
        ></iframe>
      </div>`
    : "";

  const youtubeEmbed = youtubeId
    ? `
      <div class="modal__embed">
        <h3 class="modal__embed-label">Vídeo oficial</h3>
        <div class="modal__embed-video">
          <iframe
            class="modal__embed-frame modal__embed-frame--youtube"
            src="https://www.youtube.com/embed/${youtubeId}?rel=0"
            title="YouTube — ${song.title}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"
          ></iframe>
        </div>
      </div>`
    : "";

  return `${spotifyEmbed}${youtubeEmbed}`;
}

function renderSongListItem(song) {
  const coverSrc = song.cover || "assets/covers/o-tempo-vai-esperar.jpg";
  const coverHtml = `<img src="${coverSrc}" alt="" class="song-list__cover" width="56" height="56" loading="lazy" />`;

  return `
    <li class="song-list__item" data-song-id="${song.id}" tabindex="0" role="button" aria-label="Ver ${song.title}">
      ${coverHtml}
      <span class="song-list__title">${song.title}</span>
      <span class="song-list__year">${song.year}</span>
      <span class="song-list__artist">${song.artist}</span>
    </li>
  `;
}

function initLayout(headerVariant) {
  document.body.classList.toggle("page-home", isHomePage());

  const headerEl = document.getElementById("site-header");
  const footerEl = document.getElementById("site-footer");
  if (headerEl) headerEl.innerHTML = renderHeader(headerVariant);
  if (footerEl) footerEl.innerHTML = renderFooter();
  initGlobalSearch();
  initMobileMenu();
  initConcertInstagramAccounts();
  initTheme();
}

function openSongModal(song) {
  const modal = document.getElementById("song-modal");
  if (!modal || !song) return;

  const modalInner = modal.querySelector(".modal");
  const bodyEl = document.getElementById("modal-body");
  const mediaEl = document.getElementById("modal-media");
  const streamingHtml = renderSongStreaming(song);
  const hasStreaming = Boolean(streamingHtml);

  document.getElementById("modal-meta").textContent = `${song.year} · ${song.artist}`;
  document.getElementById("modal-title").textContent = song.title;
  document.getElementById("modal-lyrics").textContent = song.lyrics;

  if (bodyEl) {
    bodyEl.classList.toggle("modal__body--with-media", hasStreaming);
  }
  if (mediaEl) {
    if (hasStreaming) {
      mediaEl.innerHTML = streamingHtml;
      mediaEl.hidden = false;
    } else {
      mediaEl.innerHTML = "";
      mediaEl.hidden = true;
    }
  }
  if (modalInner) {
    modalInner.classList.toggle("modal--with-media", hasStreaming);
  }

  const coverEl = document.getElementById("modal-cover");
  if (coverEl) {
    if (song.cover) {
      coverEl.src = song.cover;
      coverEl.alt = song.title;
      coverEl.hidden = false;
    } else {
      coverEl.hidden = true;
    }
  }
  modal.classList.add("modal-overlay--open");
  document.body.style.overflow = "hidden";
}

function closeSongModal() {
  const modal = document.getElementById("song-modal");
  if (!modal) return;

  const mediaEl = document.getElementById("modal-media");
  if (mediaEl) {
    mediaEl.innerHTML = "";
    mediaEl.hidden = true;
  }

  const modalInner = modal.querySelector(".modal");
  if (modalInner) modalInner.classList.remove("modal--with-media");

  const bodyEl = document.getElementById("modal-body");
  if (bodyEl) bodyEl.classList.remove("modal__body--with-media");

  modal.classList.remove("modal-overlay--open");
  document.body.style.overflow = "";
}

function initSongModal() {
  const modal = document.getElementById("song-modal");
  if (!modal) return;

  document.getElementById("modal-close").addEventListener("click", closeSongModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeSongModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSongModal();
  });
}

function initSongListClick(container) {
  if (!container) return;
  container.addEventListener("click", (e) => {
    const item = e.target.closest(".song-list__item");
    if (!item) return;
    const song = getSongById(item.dataset.songId);
    openSongModal(song);
  });
  container.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const item = e.target.closest(".song-list__item");
    if (!item) return;
    e.preventDefault();
    const song = getSongById(item.dataset.songId);
    openSongModal(song);
  });
}

function navigateSearchQuery(query) {
  const trimmed = query.trim();
  if (!trimmed) return;

  const results = searchSongs(trimmed);
  if (results.length === 1) {
    window.location.href = `musica.html?song=${results[0].id}`;
  } else {
    window.location.href = `musica.html?q=${encodeURIComponent(trimmed)}`;
  }
}

function handleSearchSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const input = form.querySelector('input[type="search"]');
  navigateSearchQuery(input ? input.value : "");
}

function renderSearchDropdown(results) {
  if (!results.length) {
    return `<p class="search-dropdown__empty">Nenhuma canção encontrada.</p>`;
  }

  return `
    <ul class="search-dropdown__list">
      ${results
        .slice(0, 8)
        .map(
          (song) => `
        <li>
          <a
            href="musica.html?song=${song.id}"
            class="search-dropdown__item"
            role="option"
          >
            <span class="search-dropdown__title">${song.title}</span>
            <span class="search-dropdown__meta">${song.artist}</span>
          </a>
        </li>
      `
        )
        .join("")}
    </ul>
  `;
}

function initGlobalSearch() {
  const form = document.querySelector("[data-global-search]");
  if (!form) return;

  const input = form.querySelector('input[type="search"]');
  const dropdown = document.getElementById("global-search-results");
  const wrap = form.closest(".search-bar-wrap");
  if (!input || !dropdown) return;

  let activeIndex = -1;

  const closeDropdown = () => {
    dropdown.hidden = true;
    input.setAttribute("aria-expanded", "false");
    activeIndex = -1;
  };

  const openDropdown = (results) => {
    dropdown.innerHTML = renderSearchDropdown(results);
    dropdown.hidden = false;
    input.setAttribute("aria-expanded", "true");
    activeIndex = -1;
  };

  const updateResults = () => {
    const query = input.value.trim();
    if (!query) {
      closeDropdown();
      return;
    }
    openDropdown(searchSongs(query));
  };

  form.addEventListener("submit", handleSearchSubmit);

  input.addEventListener("input", updateResults);
  input.addEventListener("focus", () => {
    if (input.value.trim()) updateResults();
  });

  dropdown.addEventListener("click", (e) => {
    const link = e.target.closest(".search-dropdown__item");
    if (link) closeDropdown();
  });

  input.addEventListener("keydown", (e) => {
    const items = dropdown.querySelectorAll(".search-dropdown__item");
    if (!items.length || dropdown.hidden) {
      if (e.key === "Escape") closeDropdown();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      items[activeIndex].focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      items[activeIndex].focus();
    } else if (e.key === "Escape") {
      closeDropdown();
    }
  });

  document.addEventListener("click", (e) => {
    if (!wrap?.contains(e.target)) closeDropdown();
  });
}

function initMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("mobile-menu");
  const closeBtn = document.getElementById("mobile-menu-close");
  if (!toggle || !menu) return;

  const openMenu = () => {
    menu.classList.add("mobile-menu--open");
    menu.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
  };

  const closeMenu = () => {
    menu.classList.remove("mobile-menu--open");
    menu.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };

  toggle.addEventListener("click", () => {
    if (menu.classList.contains("mobile-menu--open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  closeBtn?.addEventListener("click", closeMenu);
  menu.querySelectorAll(".mobile-menu__link").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

function checkSongFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const songId = params.get("song");
  if (songId) {
    const song = getSongById(songId);
    if (song) {
      setTimeout(() => openSongModal(song), 100);
    }
  }
}

