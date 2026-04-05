/**
 * Site entry — wires i18n, features, and UI. See `assets/js/` layout:
 *   core/     shared state, DOM refs, dates, storage
 *   services/ backend bridges (Google Sheets)
 *   ui/       cross-cutting UI (toasts)
 *   features/ page features (auth, booking, hero, navigation)
 */
import { initI18n, t } from "./i18n.js";
import { elements } from "./core/elements.js";
import { bookingState } from "./core/state.js";
import { initContactMap } from "./features/contact-map.js";
import { bindNavigation } from "./features/navigation.js";
import { bindAuthEvents, restoreSession } from "./features/auth.js";
import {
  bindReservationForm,
  initBookingCalendar,
  renderBookingCalendar,
  renderBookingSlots,
  renderMyReservations,
} from "./features/booking.js";
import { initHeroCarousel, updateCarouselDotsI18n } from "./features/hero-carousel.js";
import { initHeaderScroll } from "./features/header-scroll.js";
import { initHeroScrollSkip } from "./features/hero-scroll-skip.js";

function onLanguageChanged() {
  if (elements.menuToggle && elements.siteNav) {
    const isOpen = elements.siteNav.classList.contains("open");
    elements.menuToggle.setAttribute("aria-label", isOpen ? t("header.closeMenu") : t("header.openMenu"));
  }

  renderBookingCalendar();

  if (bookingState.selectedDate) {
    renderBookingSlots();
  } else if (elements.slotsHint) {
    elements.slotsHint.textContent = t("slots.hintNone");
  }

  renderMyReservations();
  updateCarouselDotsI18n();
}

async function bootstrap() {
  initContactMap();
  await initI18n();
  window.addEventListener("juliamakeup:lang", onLanguageChanged);

  restoreSession();
  bindNavigation();
  bindAuthEvents();
  initBookingCalendar();
  bindReservationForm();
  initHeroCarousel();
  initHeaderScroll();
  initHeroScrollSkip();
}

void bootstrap();
