/**
 * biografia.html — single-figure scroll parallax + typographic morph
 * One asset (assets/parallax.JPG) · rAF · translate3d + scale + opacity
 */
(function () {
  const stage = document.getElementById("parallax-stage");
  const figure = document.getElementById("parallax-figure");
  const figureInner = document.getElementById("parallax-figure-inner");
  const veil = document.getElementById("parallax-veil");
  const typeHero = document.getElementById("parallax-type-hero");
  const typeInner = document.getElementById("parallax-type-inner");

  if (!stage || !figureInner || !typeHero || !typeInner) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reducedMotion) return;

  const MORPH_START = 0.42;
  const MORPH_END = 0.9;
  const TYPE_Y_FROM = 40;
  const TYPE_Y_TO = 0;
  const TYPE_SCALE_FROM = 0.88;
  const TYPE_SCALE_TO = 1;

  /* Figure motion (vh) — reduced on mobile */
  const FIGURE_Y_START = -5;
  const FIGURE_Y_END = 48;
  const FIGURE_SCALE_START = 1;
  const FIGURE_SCALE_PEAK = 1.07;
  const FIGURE_SCALE_END = 0.84;
  const FIGURE_SCALE_PEAK_AT = 0.38;

  let running = true;
  let motionIntensity = 1;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function rangeProgress(value, start, end) {
    if (value <= start) return 0;
    if (value >= end) return 1;
    return (value - start) / (end - start);
  }

  function updateMotionIntensity() {
    motionIntensity = window.matchMedia("(max-width: 640px)").matches ? 0.62 : 1;
  }

  function getScrollProgress() {
    const rect = stage.getBoundingClientRect();
    const scrollable = stage.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    return clamp(-rect.top / scrollable, 0, 1);
  }

  function setFigureTransform(yPx, scale) {
    figureInner.style.transform = `translate3d(0, ${yPx}px, 0) scale(${scale})`;
  }

  function setTypeTransform(yPx, scale) {
    typeInner.style.transform = `translate3d(0, ${yPx}px, 0) scale(${scale})`;
  }

  function figureScaleAt(progress) {
    const peak = FIGURE_SCALE_PEAK_AT;
    if (progress <= peak) {
      const t = easeOutCubic(progress / peak);
      return lerp(FIGURE_SCALE_START, FIGURE_SCALE_PEAK, t);
    }
    const t = easeOutCubic((progress - peak) / (1 - peak));
    return lerp(FIGURE_SCALE_PEAK, FIGURE_SCALE_END, t);
  }

  function applyParallax(rawProgress) {
    const p = easeOutCubic(rawProgress);
    const vhPx = (window.innerHeight / 100) * motionIntensity;

    const morphRaw = rangeProgress(rawProgress, MORPH_START, MORPH_END);
    const morph = easeInOutCubic(morphRaw);
    const typeReveal = easeOutQuart(morphRaw);

    const figureY =
      lerp(FIGURE_Y_START, FIGURE_Y_END, p) * vhPx * (motionIntensity > 0.7 ? 1 : 0.85);
    const figureScale = figureScaleAt(p);
    const figureOpacity = clamp(1 - morph, 0, 1);

    setFigureTransform(figureY, figureScale);
    figureInner.style.opacity = String(figureOpacity);
    if (figure) figure.style.opacity = String(figureOpacity);

    const typeY = TYPE_Y_FROM + (TYPE_Y_TO - TYPE_Y_FROM) * typeReveal;
    const typeScale =
      TYPE_SCALE_FROM + (TYPE_SCALE_TO - TYPE_SCALE_FROM) * typeReveal;

    typeHero.style.opacity = String(clamp(typeReveal, 0, 1));
    setTypeTransform(typeY, typeScale);

    if (veil) {
      const veilOpacity = Math.max(
        rangeProgress(rawProgress, 0.72, 0.98) * 0.35,
        morph * 0.5
      );
      veil.style.opacity = String(clamp(veilOpacity, 0, 1));
    }

    stage.dataset.scrollProgress = rawProgress.toFixed(3);
    stage.dataset.morphProgress = morph.toFixed(3);
  }

  function tick() {
    if (!running) return;
    applyParallax(getScrollProgress());
    requestAnimationFrame(tick);
  }

  updateMotionIntensity();
  window.addEventListener("resize", () => {
    updateMotionIntensity();
    applyParallax(getScrollProgress());
  }, { passive: true });

  window.addEventListener(
    "pagehide",
    () => {
      running = false;
    },
    { once: true }
  );

  applyParallax(getScrollProgress());
  requestAnimationFrame(tick);
})();
