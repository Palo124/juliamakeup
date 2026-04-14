import { t } from "../i18n.js";

export function initHeroCarousel() {
  const viewport = document.getElementById("hero-carousel-viewport");
  const track = document.getElementById("hero-carousel-track");
  const dotsRoot = document.getElementById("hero-carousel-dots");
  const prevButton = document.getElementById("hero-carousel-prev");
  const nextButton = document.getElementById("hero-carousel-next");

  if (!viewport || !track || !dotsRoot) {
    return;
  }

  const slides = track.querySelectorAll(".hero-carousel-slide");
  const count = slides.length;

  if (count === 0) {
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  dotsRoot.innerHTML = "";

  let index = 0;
  let autoTimer = null;
  let scrollRaf = null;
  const heroRoot = viewport.closest(".hero-carousel");

  function slideWidth() {
    const w = slides[0]?.offsetWidth;
    if (w && w > 0) {
      return w;
    }
    return viewport.clientWidth || 1;
  }

  function allSlidesFitInView() {
    const w = slideWidth();
    return count * w <= viewport.clientWidth + 2;
  }

  function updateAllSlidesVisibleClass() {
    heroRoot?.classList.toggle("hero-carousel--all-slides-visible", allSlidesFitInView());
  }

  function readIndexFromScroll() {
    const w = slideWidth();
    return Math.min(count - 1, Math.max(0, Math.round(viewport.scrollLeft / w)));
  }

  function syncDots() {
    dotsRoot.querySelectorAll(".hero-carousel-dot").forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
      dot.setAttribute("aria-selected", String(dotIndex === index));
    });
  }

  function go(targetIndex) {
    index = ((targetIndex % count) + count) % count;
    viewport.scrollTo({
      left: index * slideWidth(),
      top: 0,
      behavior: reduceMotion.matches ? "auto" : "smooth",
    });
    syncDots();
  }

  for (let slideIndex = 0; slideIndex < count; slideIndex += 1) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = `hero-carousel-dot${slideIndex === 0 ? " is-active" : ""}`;
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", t("carousel.slideOf", { n: slideIndex + 1, total: count }));
    dot.setAttribute("aria-selected", slideIndex === 0 ? "true" : "false");
    dot.addEventListener("click", () => {
      go(slideIndex);
      restartAuto();
    });
    dotsRoot.append(dot);
  }

  function onScroll() {
    if (scrollRaf !== null) {
      cancelAnimationFrame(scrollRaf);
    }

    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = null;
      const next = readIndexFromScroll();

      if (next !== index) {
        index = next;
        syncDots();
      }
    });
  }

  viewport.addEventListener("scroll", onScroll, { passive: true });

  if ("onscrollend" in window) {
    viewport.addEventListener(
      "scrollend",
      () => {
        index = readIndexFromScroll();
        syncDots();
      },
      { passive: true }
    );
  }

  window.addEventListener("resize", () => {
    if (allSlidesFitInView()) {
      index = 0;
      viewport.scrollTo({ left: 0, top: 0, behavior: "auto" });
      syncDots();
    } else {
      viewport.scrollTo({ left: index * slideWidth(), top: 0, behavior: "auto" });
    }
    updateAllSlidesVisibleClass();
    restartAuto();
  });

  function restartAuto() {
    clearInterval(autoTimer);

    if (reduceMotion.matches || allSlidesFitInView()) {
      return;
    }

    autoTimer = window.setInterval(() => {
      go(index + 1);
    }, 6500);
  }

  prevButton?.addEventListener("click", () => {
    go(index - 1);
    restartAuto();
  });

  nextButton?.addEventListener("click", () => {
    go(index + 1);
    restartAuto();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(autoTimer);
    } else {
      restartAuto();
    }
  });

  viewport.scrollLeft = 0;
  updateAllSlidesVisibleClass();
  restartAuto();
}

export function updateCarouselDotsI18n() {
  const dotsRoot = document.getElementById("hero-carousel-dots");
  if (!dotsRoot) {
    return;
  }

  const dots = dotsRoot.querySelectorAll(".hero-carousel-dot");
  const count = dots.length;

  dots.forEach((dot, slideIndex) => {
    dot.setAttribute("aria-label", t("carousel.slideOf", { n: slideIndex + 1, total: count }));
  });
}
