import { t } from "../i18n.js";
import { getSiteScrollRoot } from "../core/scroll.js";

export function initHeaderScroll() {
  const header = document.querySelector(".site-header--hero");
  const hero = document.querySelector(".hero-carousel");
  const nav = document.getElementById("site-nav");
  const menuToggle = document.querySelector(".menu-toggle");
  const scroller = getSiteScrollRoot();

  if (!header || !hero) {
    return;
  }

  function readScrollTop() {
    return scroller ? scroller.scrollTop : window.scrollY;
  }

  function onScroll() {
    const threshold = Math.max(hero.offsetHeight - 24, 0);
    const pastHero = readScrollTop() > threshold;
    header.classList.toggle("site-header--past-hero", pastHero);

    if (!pastHero && nav?.classList.contains("open")) {
      nav.classList.remove("open");
      menuToggle?.setAttribute("aria-expanded", "false");
      menuToggle?.setAttribute("aria-label", t("header.openMenu"));
    }
  }

  (scroller || window).addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}
