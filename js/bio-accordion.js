/**
 * biografia.html — timeline accordion (horizontal desktop / vertical mobile)
 */
(function () {
  const timeline = document.querySelector("[data-bio-accordion]");
  if (!timeline) return;

  const stackRoot = timeline.closest(".bio-accordion") || timeline;
  const cards = Array.from(timeline.querySelectorAll(".bio-timeline__card"));
  const intro = timeline.querySelector(".bio-timeline__intro");
  const MOBILE_STACK_MAX = 640;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function stackMeasureWidth() {
    return stackRoot.getBoundingClientRect().width;
  }

  function isMobileTimeline() {
    return (
      stackMeasureWidth() <= MOBILE_STACK_MAX ||
      window.matchMedia(`(max-width: ${MOBILE_STACK_MAX}px)`).matches
    );
  }

  function parts(card) {
    return {
      tab: card.querySelector(".bio-timeline__tab"),
      panel: card.querySelector(".bio-timeline__panel"),
      close: card.querySelector(".bio-timeline__close"),
    };
  }

  function measurePanelHeight(panel) {
    if (!panel) return 0;

    const previousMaxHeight = panel.style.maxHeight;
    panel.style.maxHeight = "none";
    const height = panel.scrollHeight;
    panel.style.maxHeight = previousMaxHeight;

    return height;
  }

  function setPanelHeight(panel, height) {
    if (!panel) return;

    if (height <= 0) {
      panel.style.removeProperty("--bio-panel-height");
      panel.style.maxHeight = "0px";
      return;
    }

    const px = `${height}px`;
    panel.style.setProperty("--bio-panel-height", px);
    panel.style.maxHeight = px;
  }

  function syncMobilePanelHeights() {
    if (!isMobileTimeline()) {
      cards.forEach((card) => {
        const { panel } = parts(card);
        if (!panel) return;
        panel.style.removeProperty("--bio-panel-height");
        panel.style.removeProperty("max-height");
      });
      return;
    }

    cards.forEach((card) => {
      const { panel } = parts(card);
      if (!panel) return;

      if (card.classList.contains("is-open")) {
        setPanelHeight(panel, measurePanelHeight(panel));
      } else {
        setPanelHeight(panel, 0);
      }
    });
  }

  function bindPanelTransitionEnd(panel) {
    if (!panel || panel.dataset.bioPanelBound === "true") return;
    panel.dataset.bioPanelBound = "true";

    panel.addEventListener("transitionend", (event) => {
      if (event.propertyName !== "max-height") return;
      if (!isMobileTimeline()) return;

      const card = panel.closest(".bio-timeline__card");
      if (card?.classList.contains("is-open")) {
        panel.style.maxHeight = "none";
      }
    });
  }

  cards.forEach((card) => {
    bindPanelTransitionEnd(parts(card).panel);
  });

  function setPanelVisible(panel, visible) {
    if (isMobileTimeline()) {
      panel.hidden = false;
    } else {
      panel.hidden = !visible;
      panel.style.removeProperty("--bio-panel-height");
      panel.style.removeProperty("max-height");
    }

    panel.setAttribute("aria-hidden", visible ? "false" : "true");
  }

  function scrollCardIntoView(card) {
    if (!isMobileTimeline() || !card) return;
    card.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "nearest",
    });
  }

  function youtubeEmbedSrc(videoId) {
    const params = new URLSearchParams({
      autoplay: "1",
      mute: "1",
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
    });
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }

  function stopCardVideo(card) {
    const iframe = card.querySelector(".bio-timeline__figure-video");
    if (iframe) iframe.removeAttribute("src");
  }

  function playCardVideo(card) {
    if (reducedMotion) return;
    const iframe = card.querySelector(".bio-timeline__figure-video");
    const videoId = iframe?.dataset.youtubeId;
    if (!iframe || !videoId) return;
    iframe.src = youtubeEmbedSrc(videoId);
  }

  function closeCard(card, options = {}) {
    const { tab, panel } = parts(card);
    if (!tab || !panel) return;

    stopCardVideo(card);

    const wasOpen = card.classList.contains("is-open");

    if (isMobileTimeline() && wasOpen && !reducedMotion) {
      setPanelHeight(panel, measurePanelHeight(panel));
    }

    card.classList.remove("is-open");
    tab.setAttribute("aria-expanded", "false");
    setPanelVisible(panel, false);

    if (isMobileTimeline()) {
      if (reducedMotion) {
        setPanelHeight(panel, 0);
      } else if (wasOpen) {
        requestAnimationFrame(() => setPanelHeight(panel, 0));
      } else {
        setPanelHeight(panel, 0);
      }
    }

    if (options.skipTimelineState) return;

    const hasOpenCard = cards.some((other) => other.classList.contains("is-open"));
    if (!hasOpenCard) {
      timeline.classList.remove("is-expanded");
      if (intro) intro.setAttribute("aria-hidden", "false");
    }
  }

  function closeAll() {
    cards.forEach((card) => closeCard(card));
  }

  function openCard(card) {
    const { tab, panel } = parts(card);
    if (!tab || !panel) return;

    cards.forEach((other) => {
      if (other !== card) closeCard(other, { skipTimelineState: true });
    });

    setPanelVisible(panel, true);
    card.classList.add("is-open");
    tab.setAttribute("aria-expanded", "true");
    timeline.classList.add("is-expanded");
    if (intro) intro.setAttribute("aria-hidden", "true");
    playCardVideo(card);

    if (isMobileTimeline()) {
      if (reducedMotion) {
        setPanelHeight(panel, measurePanelHeight(panel));
      } else {
        setPanelHeight(panel, 0);
        requestAnimationFrame(() => {
          setPanelHeight(panel, measurePanelHeight(panel));
        });
      }

      requestAnimationFrame(() => scrollCardIntoView(card));
    }
  }

  function syncLayoutMode() {
    const mobile = isMobileTimeline();

    cards.forEach((card) => {
      const { panel } = parts(card);
      if (!panel) return;

      const open = card.classList.contains("is-open");
      setPanelVisible(panel, open);

      if (!mobile) {
        panel.style.removeProperty("--bio-panel-height");
        panel.style.removeProperty("max-height");
      }
    });

    if (mobile) {
      syncMobilePanelHeights();
    }
  }

  cards.forEach((card) => {
    const { tab, panel, close } = parts(card);
    if (!tab || !panel) return;

    tab.addEventListener("click", () => {
      if (card.classList.contains("is-open")) return;
      openCard(card);
    });

    if (close) {
      close.addEventListener("click", (event) => {
        event.stopPropagation();
        closeAll();
        tab.focus();
      });
    }
  });

  if (typeof ResizeObserver !== "undefined") {
    const layoutObserver = new ResizeObserver(() => {
      syncLayoutMode();
    });
    layoutObserver.observe(stackRoot);
  }

  window.addEventListener("resize", syncLayoutMode, { passive: true });

  cards.forEach((card) => {
    const img = card.querySelector(".bio-timeline__figure-img");
    if (!img) return;
    img.addEventListener("load", syncMobilePanelHeights, { passive: true });
  });

  if (reducedMotion) {
    timeline.style.setProperty("--bio-timeline-duration", "0ms");
  }

  syncLayoutMode();
})();
