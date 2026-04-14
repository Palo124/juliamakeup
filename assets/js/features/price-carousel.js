import { t } from "../i18n.js";

export function initPriceCarousel() {
  const viewport = document.getElementById("price-carousel-viewport");
  const track = document.getElementById("price-carousel-track");
  const dotsRoot = document.getElementById("price-carousel-dots");
  const prevButton = document.getElementById("price-carousel-prev");
  const nextButton = document.getElementById("price-carousel-next");

  if (!viewport || !track || !dotsRoot) {
    return;
  }

  const slides = track.querySelectorAll(".portfolio-carousel-slide");
  const count = slides.length;

  if (count === 0) {
    return;
  }

  const startIndex =
    count <= 1 ? 0 : Math.min(count - 1, Math.floor((count - 1) / 2));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  dotsRoot.innerHTML = "";

  let index = startIndex;
  let scrollRaf = null;
  const root = viewport.closest(".portfolio-carousel");

  function slideWidth() {
    const w = slides[0]?.offsetWidth;
    if (w && w > 0) {
      return w;
    }
    return viewport.clientWidth || 1;
  }

  function allSlidesFitInView() {
    return track.scrollWidth <= viewport.clientWidth + 2;
  }

  function updateAllSlidesVisibleClass() {
    root?.classList.toggle("portfolio-carousel--all-slides-visible", allSlidesFitInView());
  }

  function applyTrackPadding() {
    if (allSlidesFitInView()) {
      track.style.paddingLeft = "";
      track.style.paddingRight = "";
      return;
    }
    const w = slideWidth();
    const pad = Math.max(0, (viewport.clientWidth - w) / 2);
    track.style.paddingLeft = `${pad}px`;
    track.style.paddingRight = `${pad}px`;
  }

  function clampScroll(left) {
    const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    return Math.max(0, Math.min(left, max));
  }

  function scrollLeftToCenterSlide(i) {
    const slide = slides[i];
    return slide.offsetLeft - (viewport.clientWidth - slide.offsetWidth) / 2;
  }

  function readIndexFromScroll() {
    const centerX = viewport.scrollLeft + viewport.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    slides.forEach((slide, i) => {
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const d = Math.abs(slideCenter - centerX);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  }

  function syncDots() {
    dotsRoot.querySelectorAll(".portfolio-carousel-dot").forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
      dot.setAttribute("aria-selected", String(dotIndex === index));
    });
  }

  function go(targetIndex) {
    index = ((targetIndex % count) + count) % count;
    applyTrackPadding();
    viewport.scrollTo({
      left: clampScroll(scrollLeftToCenterSlide(index)),
      top: 0,
      behavior: reduceMotion.matches ? "auto" : "smooth",
    });
    syncDots();
  }

  for (let slideIndex = 0; slideIndex < count; slideIndex += 1) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = `portfolio-carousel-dot${slideIndex === startIndex ? " is-active" : ""}`;
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", t("carousel.slideOf", { n: slideIndex + 1, total: count }));
    dot.setAttribute("aria-selected", slideIndex === startIndex ? "true" : "false");
    dot.addEventListener("click", () => {
      go(slideIndex);
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
      track.style.paddingLeft = "";
      track.style.paddingRight = "";
      viewport.scrollTo({ left: 0, top: 0, behavior: "auto" });
      syncDots();
    } else {
      applyTrackPadding();
      viewport.scrollTo({
        left: clampScroll(scrollLeftToCenterSlide(index)),
        top: 0,
        behavior: "auto",
      });
      syncDots();
    }
    updateAllSlidesVisibleClass();
  });

  prevButton?.addEventListener("click", () => {
    go(index - 1);
  });

  nextButton?.addEventListener("click", () => {
    go(index + 1);
  });

  function applyInitialScroll() {
    applyTrackPadding();
    if (allSlidesFitInView()) {
      index = 0;
      viewport.scrollTo({ left: 0, top: 0, behavior: "auto" });
    } else {
      index = startIndex;
      viewport.scrollTo({
        left: clampScroll(scrollLeftToCenterSlide(startIndex)),
        top: 0,
        behavior: "auto",
      });
    }
    syncDots();
    updateAllSlidesVisibleClass();
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(applyInitialScroll);
  });
}

export function updatePriceCarouselDotsI18n() {
  const dotsRoot = document.getElementById("price-carousel-dots");
  if (!dotsRoot) {
    return;
  }

  const dots = dotsRoot.querySelectorAll(".portfolio-carousel-dot");
  const count = dots.length;

  dots.forEach((dot, slideIndex) => {
    dot.setAttribute("aria-label", t("carousel.slideOf", { n: slideIndex + 1, total: count }));
  });
}
