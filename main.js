(() => {
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function formatNumber(n) {
    return String(Math.round(n));
  }

  function animateCount(el, { to, suffix = "", durationMs = 1100, from = 1 }) {
    if (prefersReducedMotion) {
      el.textContent = `${formatNumber(to)}${suffix}`;
      return;
    }

    const start = performance.now();
    const delta = to - from;

    const tick = (now) => {
      const t = clamp((now - start) / durationMs, 0, 1);
      const eased = easeOutCubic(t);
      const current = from + delta * eased;
      el.textContent = `${formatNumber(current)}${suffix}`;
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  function initExperienceCounters() {
    const section = document.getElementById("experiencia");
    if (!section) return;

    const numbers = Array.from(section.querySelectorAll(".metric-number[data-count-to]"));
    if (numbers.length === 0) return;

    // Set initial values (avoid 0 so it feels "casino/contador" desde 1)
    for (const el of numbers) {
      el.textContent = "1";
    }

    const runOnce = () => {
      if (section.dataset.animated === "true") return;
      section.dataset.animated = "true";

      for (const el of numbers) {
        const to = Number(el.dataset.countTo || "0");
        const suffix = el.dataset.suffix || "";
        const safeTo = Number.isFinite(to) ? to : 0;
        // Más lento para que el conteo sea perceptible (10/15/20)
        const duration =
          safeTo <= 20 ? 2200 :
          safeTo <= 50 ? 2400 :
          safeTo <= 100 ? 2800 :
          3000;
        animateCount(el, { to: safeTo, suffix, durationMs: duration, from: 1 });
      }
    };

    if (!("IntersectionObserver" in window)) {
      runOnce();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            runOnce();
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.35 }
    );

    io.observe(section);
  }

  function initCarousel() {
    const carousel = document.getElementById("carousel");
    const wrap = carousel?.closest(".carousel-container");
    const nextBtn = wrap?.querySelector(".carousel-btn.next");
    const prevBtn = wrap?.querySelector(".carousel-btn.prev");

    if (!carousel || !nextBtn || !prevBtn) return;

    function scrollStep() {
      const slide = carousel.querySelector(".slide");
      const track = carousel.querySelector(".carousel-track");
      if (!slide || !track) return Math.min(320, carousel.clientWidth * 0.92);
      const gapRaw = getComputedStyle(track).gap || getComputedStyle(track).columnGap || "0";
      const gap = Number.parseFloat(gapRaw) || 0;
      return slide.getBoundingClientRect().width + gap;
    }

    nextBtn.addEventListener("click", () => {
      carousel.scrollBy({ left: scrollStep(), behavior: prefersReducedMotion ? "auto" : "smooth" });
    });

    prevBtn.addEventListener("click", () => {
      carousel.scrollBy({ left: -scrollStep(), behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  function init() {
    initExperienceCounters();
    initCarousel();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

