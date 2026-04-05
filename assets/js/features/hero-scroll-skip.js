import { getSiteScrollRoot } from "../core/scroll.js";

export function initHeroScrollSkip() {
  const hero = document.querySelector(".hero-carousel");
  const scroller = getSiteScrollRoot();

  if (!hero) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const prefersCoarsePointer = window.matchMedia("(pointer: coarse)");
  let lockUntil = 0;
  let touchStartY = 0;
  let touchStartX = 0;
  let touchStartedInHero = false;
  let scrollAnimationFrame = null;

  function readScrollTop() {
    return scroller ? scroller.scrollTop : window.scrollY;
  }

  function writeScrollTop(y) {
    if (scroller) {
      scroller.scrollTop = y;
    } else {
      window.scrollTo(0, y);
    }
  }

  function heroBottom() {
    return hero.offsetHeight;
  }

  function isInsideHeroScrollRange() {
    return readScrollTop() < heroBottom() - 2;
  }

  function easeOutCubic(progress) {
    return 1 - (1 - progress) ** 3;
  }

  function animateScrollTo(targetY, durationMs) {
    if (scrollAnimationFrame !== null) {
      cancelAnimationFrame(scrollAnimationFrame);
      scrollAnimationFrame = null;
    }

    const startY = readScrollTop();
    const travel = targetY - startY;

    if (Math.abs(travel) < 2) {
      return;
    }

    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      writeScrollTop(startY + travel * easeOutCubic(t));

      if (t < 1) {
        scrollAnimationFrame = requestAnimationFrame(tick);
      } else {
        scrollAnimationFrame = null;
      }
    }

    scrollAnimationFrame = requestAnimationFrame(tick);
  }

  function skipPastHero() {
    const top = heroBottom();

    if (prefersReducedMotion.matches) {
      lockUntil = Date.now() + 400;
      writeScrollTop(top);
      return;
    }

    const durationMs = prefersCoarsePointer.matches ? 700 : 540;
    lockUntil = Date.now() + durationMs + 320;
    animateScrollTo(top, durationMs);
  }

  window.addEventListener(
    "wheel",
    (event) => {
      if (Date.now() < lockUntil) {
        if (event.deltaY > 0) {
          event.preventDefault();
        }

        return;
      }

      if (!isInsideHeroScrollRange() || event.deltaY <= 45) {
        return;
      }

      event.preventDefault();
      skipPastHero();
    },
    { passive: false }
  );

  document.addEventListener(
    "touchstart",
    (event) => {
      if (!isInsideHeroScrollRange()) {
        touchStartedInHero = false;
        return;
      }

      touchStartY = event.touches[0].clientY;
      touchStartX = event.touches[0].clientX;
      touchStartedInHero = hero.contains(event.target);
    },
    { passive: true }
  );

  document.addEventListener(
    "touchmove",
    (event) => {
      if (!touchStartedInHero || Date.now() < lockUntil || !isInsideHeroScrollRange()) {
        return;
      }

      const touch = event.touches[0];
      const verticalIntent = touchStartY - touch.clientY;
      const horizontalDrift = Math.abs(touch.clientX - touchStartX);

      if (verticalIntent < 24) {
        return;
      }

      if (verticalIntent < horizontalDrift * 0.75) {
        return;
      }

      event.preventDefault();
      touchStartedInHero = false;
      skipPastHero();
    },
    { passive: false }
  );

  window.addEventListener("keydown", (event) => {
    if (!isInsideHeroScrollRange() || Date.now() < lockUntil) {
      return;
    }

    const tag = document.activeElement?.tagName;

    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
      return;
    }

    if (event.key === "PageDown" || event.key === "ArrowDown") {
      event.preventDefault();
      skipPastHero();
    }

    if (event.key === " " && !event.ctrlKey && !event.metaKey) {
      if (document.activeElement?.closest?.("button, a, [role='button']")) {
        return;
      }

      event.preventDefault();
      skipPastHero();
    }
  });
}
