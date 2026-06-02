/**
 * Site entry — wires i18n, features, and UI. See `assets/js/` layout:
 *   core/     DOM refs, constants
 *   services/ backend bridges (Google Sheets for copy)
 *   ui/       cross-cutting UI (toasts)
 *   features/ page features (hero, navigation, map)
 */
import { initI18n, t } from "./i18n.js";
import { elements } from "./core/elements.js";
import { initContactMap } from "./features/contact-map.js";
import { bindNavigation } from "./features/navigation.js";
import { initHeroCarousel, updateCarouselDotsI18n } from "./features/hero-carousel.js";
import { initPortfolioCarousel, updatePortfolioCarouselDotsI18n } from "./features/portfolio-carousel.js";
import { initPriceCarousel, updatePriceCarouselDotsI18n } from "./features/price-carousel.js";
import { initReviewsCarousel, updateReviewsCarouselDotsI18n } from "./features/reviews-carousel.js";
import {
  initBeforeVisitCarousel,
  updateBeforeVisitCarouselDotsI18n,
} from "./features/before-visit-carousel.js";
import { initHeaderScroll } from "./features/header-scroll.js";
import { initSeo, detectSeoPage } from "./features/seo.js";

/** @type {Promise<typeof import("./features/portfolio-gallery.js")> | null} */
let portfolioGalleryModule = null;

/** @type {Promise<typeof import("./features/price-service-dialog.js")> | null} */
let priceServiceDialogModule = null;

function loadPortfolioGalleryModule() {
  if (!portfolioGalleryModule) {
    portfolioGalleryModule = import("./features/portfolio-gallery.js");
  }
  return portfolioGalleryModule;
}

function loadPriceServiceDialogModule() {
  if (!priceServiceDialogModule) {
    priceServiceDialogModule = import("./features/price-service-dialog.js");
  }
  return priceServiceDialogModule;
}

function onLanguageChanged() {
  if (elements.menuToggle && elements.siteNav) {
    const isOpen = elements.siteNav.classList.contains("open");
    elements.menuToggle.setAttribute("aria-label", isOpen ? t("header.closeMenu") : t("header.openMenu"));
  }

  updateCarouselDotsI18n();
  updatePortfolioCarouselDotsI18n();
  updatePriceCarouselDotsI18n();
  updateReviewsCarouselDotsI18n();
  updateBeforeVisitCarouselDotsI18n();
  void loadPortfolioGalleryModule().then((mod) => mod.refreshPortfolioGalleryI18n());
  void loadPriceServiceDialogModule().then((mod) => mod.refreshPriceServiceDialogI18n());
}

function initCriticalFeatures() {
  bindNavigation();
  initHeroCarousel();
  initHeaderScroll();
}

function initBelowFoldFeatures() {
  initPortfolioCarousel();
  initPriceCarousel();
  initReviewsCarousel();
  initBeforeVisitCarousel();
  void loadPortfolioGalleryModule().then((mod) => mod.initPortfolioGallery());
  void loadPriceServiceDialogModule().then((mod) => mod.initPriceServiceDialog());
}

function scheduleBelowFoldFeatures() {
  const run = () => initBelowFoldFeatures();
  if ("requestIdleCallback" in window) {
    requestIdleCallback(run, { timeout: 2500 });
  } else {
    setTimeout(run, 1);
  }
}

async function bootstrap() {
  initContactMap();
  initI18n();
  const page = detectSeoPage();
  initSeo(page);
  window.addEventListener("juliamakeup:lang", onLanguageChanged);

  initCriticalFeatures();
  scheduleBelowFoldFeatures();

  if (page === "booking") {
    const { initSheetBooking } = await import("./features/sheet-booking.js");
    initSheetBooking();
  }
}

void bootstrap();
