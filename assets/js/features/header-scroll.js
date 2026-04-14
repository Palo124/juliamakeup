import { t } from "../i18n.js";

export function initHeaderScroll() {
  const header = document.querySelector(".site-header--hero");
  const hero = document.querySelector(".hero-carousel");
  const nav = document.getElementById("site-nav");
  const menuToggle = document.querySelector(".menu-toggle");

  if (!header || !hero) {
    return;
  }

  function onScroll() {
    const threshold = Math.max(hero.offsetHeight - 24, 0);
    const pastHero = window.scrollY > threshold;
    header.classList.toggle("site-header--past-hero", pastHero);

    if (!pastHero && nav?.classList.contains("open")) {
      nav.classList.remove("open");
      menuToggle?.setAttribute("aria-expanded", "false");
      menuToggle?.setAttribute("aria-label", t("header.openMenu"));
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}
