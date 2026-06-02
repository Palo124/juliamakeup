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
import { initPortfolioGallery, refreshPortfolioGalleryI18n } from "./features/portfolio-gallery.js";
import { initPriceCarousel, updatePriceCarouselDotsI18n } from "./features/price-carousel.js";
import { initReviewsCarousel, updateReviewsCarouselDotsI18n } from "./features/reviews-carousel.js";
import {
  initBeforeVisitCarousel,
  updateBeforeVisitCarouselDotsI18n,
} from "./features/before-visit-carousel.js";
import { initPriceServiceDialog, refreshPriceServiceDialogI18n } from "./features/price-service-dialog.js";
import { initHeaderScroll } from "./features/header-scroll.js";
import { initSheetBooking } from "./features/sheet-booking.js";
import { initSeo, detectSeoPage } from "./features/seo.js";

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
  refreshPortfolioGalleryI18n();
  refreshPriceServiceDialogI18n();
}

async function bootstrap() {
  initContactMap();
  await initI18n();
  initSeo(detectSeoPage());
  window.addEventListener("juliamakeup:lang", onLanguageChanged);

  bindNavigation();
  initHeroCarousel();
  initPortfolioCarousel();
  initPriceCarousel();
  initReviewsCarousel();
  initBeforeVisitCarousel();
  void initPortfolioGallery();
  initPriceServiceDialog();
  initHeaderScroll();
  initSheetBooking();
}

void bootstrap();
