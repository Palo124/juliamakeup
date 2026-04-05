import { t } from "../i18n.js";
import { elements } from "../core/elements.js";

export function toggleMobileMenu() {
  if (!elements.menuToggle || !elements.siteNav) {
    return;
  }

  const isOpen = elements.siteNav.classList.toggle("open");
  elements.menuToggle.setAttribute("aria-expanded", String(isOpen));
  elements.menuToggle.setAttribute("aria-label", isOpen ? t("header.closeMenu") : t("header.openMenu"));
}

export function bindNavigation() {
  if (elements.menuToggle) {
    elements.menuToggle.addEventListener("click", toggleMobileMenu);
  }
}
