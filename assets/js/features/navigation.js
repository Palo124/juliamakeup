import { CONFIG } from "../config.js";
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

export function closeMobileMenu() {
  if (!elements.menuToggle || !elements.siteNav) {
    return;
  }

  if (!elements.siteNav.classList.contains("open")) {
    return;
  }

  elements.siteNav.classList.remove("open");
  elements.menuToggle.setAttribute("aria-expanded", "false");
  elements.menuToggle.setAttribute("aria-label", t("header.openMenu"));
}

function bindNavDropdown() {
  const dropdown = document.querySelector(".nav-dropdown");
  const toggle = dropdown?.querySelector(".nav-dropdown__toggle");
  if (!(dropdown instanceof HTMLElement) || !(toggle instanceof HTMLButtonElement)) {
    return;
  }

  const setOpen = (open) => {
    dropdown.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(!dropdown.classList.contains("is-open"));
  });

  dropdown.addEventListener("mouseenter", () => {
    toggle.setAttribute("aria-expanded", "true");
  });

  dropdown.addEventListener("mouseleave", () => {
    if (!dropdown.classList.contains("is-open")) {
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node) || dropdown.contains(target)) {
      return;
    }
    setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      toggle.blur();
    }
  });
}

export function bindNavigation() {
  bindNavDropdown();

  if (elements.menuToggle) {
    elements.menuToggle.addEventListener("click", toggleMobileMenu);
  }

  if (elements.siteNav) {
    elements.siteNav.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const link = target.closest("a[href]");
      if (!link || !elements.siteNav?.contains(link)) {
        return;
      }
      closeMobileMenu();
    });
  }

  if (
    CONFIG.useSheetBooking &&
    !CONFIG.bookingMaintenanceMode &&
    (CONFIG.bookingReadScriptUrl?.trim() || CONFIG.bookingScriptUrl?.trim())
  ) {
    const warmBooking = () => {
      void import("../services/booking-api.js").then((mod) => mod.warmBookingBackend());
    };
    for (const link of document.querySelectorAll('a[href*="booking.html"], a[href="#booking"]')) {
      link.addEventListener("mouseenter", warmBooking, { once: true, passive: true });
      link.addEventListener("focus", warmBooking, { once: true });
      link.addEventListener("touchstart", warmBooking, { once: true, passive: true });
    }
  }
}
