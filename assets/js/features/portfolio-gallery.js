import { applySiteImageDeliveryToElement } from "../site-image-delivery.js";
import { resolvePortfolioGalleryImageBase, t } from "../i18n.js";

const CATEGORY_LABEL_KEYS = {
  bridal: "portfolio.bridal.label",
  soft: "portfolio.soft.label",
  editorial: "portfolio.editorial.label",
  evening: "portfolio.evening.label",
};

let galleries = null;
/** @type {Promise<void> | null} */
let galleriesLoadPromise = null;
/** @type {HTMLDialogElement | null} */
let dialog = null;
/** @type {HTMLElement | null} */
let titleEl = null;
/** @type {HTMLElement | null} */
let gridEl = null;
/** @type {HTMLElement | null} */
let lightboxEl = null;
/** @type {HTMLImageElement | null} */
let lightboxImg = null;
/** @type {HTMLElement | null} */
let lastThumbFocus = null;

/** Lightbox navigation state (same category as grid). */
let lightboxCategoryId = /** @type {string | null} */ (null);
let lightboxIndex = 0;

/** @type {number | null} */
let swipePointerId = null;
let swipeStartX = 0;
let swipeStartY = 0;
/** Skip backdrop dismiss click after a swipe (ghost click). */
let suppressLightboxBackdropCloseUntil = 0;

const SWIPE_MIN_PX = 48;
const SWIPE_VERTICAL_DOMINANCE = 0.78;

/** @typedef {{ src?: string, altKey?: string, tagKey?: string, captionKey?: string }} PortfolioGalleryItem */

let pageScrollLocked = false;
let savedScrollY = 0;

function lockPageScroll() {
  if (pageScrollLocked) {
    return;
  }
  pageScrollLocked = true;
  savedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  document.documentElement.classList.add("is-portfolio-gallery-open");
  document.body.classList.add("is-portfolio-gallery-open");
  document.body.style.top = `-${savedScrollY}px`;
}

function unlockPageScroll() {
  if (!pageScrollLocked) {
    return;
  }
  const y = savedScrollY;
  pageScrollLocked = false;
  document.documentElement.classList.remove("is-portfolio-gallery-open");
  document.body.classList.remove("is-portfolio-gallery-open");
  document.body.style.top = "";

  const restore = () => {
    window.scrollTo({ top: y, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = y;
    document.body.scrollTop = y;
  };

  document.documentElement.classList.add("is-portfolio-gallery-restoring");
  restore();
  requestAnimationFrame(() => {
    restore();
    document.documentElement.classList.remove("is-portfolio-gallery-restoring");
  });
}

function openPortfolioGalleryDialog() {
  if (!dialog || dialog.open) {
    return;
  }
  lockPageScroll();
  dialog.showModal();
}

function visibleGalleryImages(/** @type {string} */ categoryId) {
  const images = galleries?.[categoryId]?.images;
  if (!Array.isArray(images)) {
    return [];
  }
  return images.filter((item) => resolvePortfolioGalleryImageBase(item.altKey, item.src));
}

function referrerPolicyForResolvedSrc(/** @type {string} */ resolvedSrc) {
  if (
    resolvedSrc &&
    (/drive\.google\.com\//i.test(resolvedSrc) ||
      /googleusercontent\.com/i.test(resolvedSrc) ||
      /drive\.usercontent\.google\.com/i.test(resolvedSrc))
  ) {
    return "no-referrer";
  }
  return "";
}

function applyLightboxImage() {
  if (!lightboxImg || !lightboxCategoryId || !galleries?.[lightboxCategoryId]) {
    return;
  }
  const images = visibleGalleryImages(lightboxCategoryId);
  const item = images[lightboxIndex];
  if (!item) {
    return;
  }
  const imageBase = resolvePortfolioGalleryImageBase(item.altKey, item.src);
  if (!imageBase) {
    return;
  }
  applySiteImageDeliveryToElement(lightboxImg, imageBase, "gallery");
  lightboxImg.alt = item.altKey ? t(item.altKey) : "";
  const resolvedSrc = lightboxImg.currentSrc || lightboxImg.src;
  const ref = referrerPolicyForResolvedSrc(resolvedSrc);
  if (ref) {
    lightboxImg.referrerPolicy = ref;
  } else {
    lightboxImg.removeAttribute("referrerpolicy");
  }
  updateLightboxNav();
}

function updateLightboxNav() {
  const prev = document.getElementById("portfolio-gallery-lightbox-prev");
  const next = document.getElementById("portfolio-gallery-lightbox-next");
  if (!prev || !next) {
    return;
  }
  if (!lightboxCategoryId || !galleries?.[lightboxCategoryId]) {
    prev.disabled = true;
    next.disabled = true;
    return;
  }
  const images = visibleGalleryImages(lightboxCategoryId);
  const n = images.length;
  prev.disabled = lightboxIndex <= 0;
  next.disabled = lightboxIndex >= n - 1;
}

function lightboxStep(/** @type {number} */ delta) {
  if (!lightboxCategoryId || !galleries?.[lightboxCategoryId]) {
    return;
  }
  const images = visibleGalleryImages(lightboxCategoryId);
  const next = lightboxIndex + delta;
  if (next < 0 || next >= images.length) {
    return;
  }
  lightboxIndex = next;
  applyLightboxImage();
}

function markSwipeGesture() {
  suppressLightboxBackdropCloseUntil = performance.now() + 420;
}

function closeGalleryLightbox() {
  if (!lightboxEl || lightboxEl.hidden) {
    return;
  }
  lightboxEl.hidden = true;
  lightboxCategoryId = null;
  lightboxIndex = 0;
  if (lightboxImg) {
    lightboxImg.removeAttribute("src");
    lightboxImg.alt = "";
    lightboxImg.removeAttribute("referrerpolicy");
  }
  updateLightboxNav();
  lastThumbFocus?.focus?.();
  lastThumbFocus = null;
}

function openGalleryLightbox(/** @type {string} */ categoryId, /** @type {number} */ imageIndex) {
  if (!lightboxEl || !lightboxImg || !visibleGalleryImages(categoryId)[imageIndex]) {
    return;
  }
  lightboxCategoryId = categoryId;
  lightboxIndex = imageIndex;
  applyLightboxImage();
  lightboxEl.hidden = false;
  document.getElementById("portfolio-gallery-lightbox-close")?.focus();
}

function parseGalleryFromHash() {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) {
    return null;
  }
  const params = new URLSearchParams(raw);
  const id = params.get("gallery");
  return id && typeof id === "string" ? id : null;
}

function setGalleryHash(categoryId) {
  const base = `${window.location.pathname}${window.location.search}`;
  if (categoryId) {
    window.history.replaceState(null, "", `${base}#gallery=${encodeURIComponent(categoryId)}`);
  } else {
    window.history.replaceState(null, "", base);
  }
}

function renderGallery(categoryId) {
  if (!titleEl || !gridEl || !galleries) {
    return;
  }

  closeGalleryLightbox();

  const data = galleries[categoryId];
  if (!data) {
    return;
  }

  const labelKey = CATEGORY_LABEL_KEYS[categoryId];
  titleEl.textContent = labelKey ? t(labelKey) : categoryId;

  gridEl.innerHTML = "";
  visibleGalleryImages(categoryId).forEach((item, imageIndex) => {
    const imageBase = resolvePortfolioGalleryImageBase(item.altKey, item.src);
    if (!imageBase) {
      return;
    }

    const figure = document.createElement("figure");
    figure.className = "portfolio-gallery__figure";

    const hit = document.createElement("button");
    hit.type = "button";
    hit.className = "portfolio-gallery__img-hit";
    hit.setAttribute("aria-label", t("portfolio.gallery.fullscreenOpen"));

    const img = document.createElement("img");
    img.className = "portfolio-gallery__img";
    applySiteImageDeliveryToElement(img, imageBase, "gallery");
    const resolvedSrc = img.currentSrc || img.src;
    if (referrerPolicyForResolvedSrc(resolvedSrc)) {
      img.referrerPolicy = "no-referrer";
    }
    img.alt = item.altKey ? t(item.altKey) : "";
    img.loading = "lazy";
    img.decoding = "async";

    if (item.tagKey) {
      const tagText = t(item.tagKey).trim();
      if (tagText) {
        const tag = document.createElement("span");
        tag.className = "portfolio-gallery__tag";
        tag.textContent = tagText;
        figure.appendChild(tag);
      }
    }

    hit.appendChild(img);
    hit.addEventListener("click", (event) => {
      event.stopPropagation();
      lastThumbFocus = hit;
      openGalleryLightbox(categoryId, imageIndex);
    });

    figure.appendChild(hit);

    if (item.captionKey) {
      const captionText = t(item.captionKey).trim();
      if (captionText) {
        const caption = document.createElement("p");
        caption.className = "portfolio-gallery__caption";
        caption.textContent = captionText;
        figure.appendChild(caption);
      }
    }

    gridEl.appendChild(figure);
  });
}

export async function openPortfolioGallery(categoryId) {
  if (!dialog) {
    return;
  }

  await ensureGalleriesLoaded();
  if (!galleries?.[categoryId] || visibleGalleryImages(categoryId).length === 0) {
    return;
  }

  renderGallery(categoryId);
  setGalleryHash(categoryId);
  openPortfolioGalleryDialog();
}

export function closePortfolioGallery() {
  closeGalleryLightbox();
  if (dialog?.open) {
    dialog.close();
  }
  setGalleryHash(null);
  unlockPageScroll();
}

function setCardAriaLabels() {
  document.querySelectorAll("[data-portfolio-category]").forEach((el) => {
    const id = el.getAttribute("data-portfolio-category");
    const labelKey = id ? CATEGORY_LABEL_KEYS[id] : null;
    if (labelKey) {
      el.setAttribute("aria-label", `${t(labelKey)} — ${t("portfolio.gallery.openSuffix")}`);
    }
  });
}

export function refreshPortfolioGalleryI18n() {
  setCardAriaLabels();
  const id = parseGalleryFromHash();
  if (dialog?.open && id && galleries?.[id]) {
    if (visibleGalleryImages(id).length === 0) {
      closePortfolioGallery();
      return;
    }
    renderGallery(id);
  }
}

async function loadGalleries() {
  const url = new URL("../../data/portfolio-galleries.json", import.meta.url);
  const res = await fetch(url);
  if (!res.ok) {
    galleries = {};
    return;
  }
  galleries = await res.json();
}

function ensureGalleriesLoaded() {
  if (!galleriesLoadPromise) {
    galleriesLoadPromise = loadGalleries();
  }
  return galleriesLoadPromise;
}

function onDialogClick(event) {
  if (event.target !== dialog) {
    return;
  }
  if (lightboxEl && !lightboxEl.hidden) {
    closeGalleryLightbox();
    return;
  }
  closePortfolioGallery();
}

export async function initPortfolioGallery() {
  dialog = document.getElementById("portfolio-gallery-dialog");
  titleEl = document.getElementById("portfolio-gallery-title");
  gridEl = document.getElementById("portfolio-gallery-grid");
  lightboxEl = document.getElementById("portfolio-gallery-lightbox");
  lightboxImg = document.getElementById("portfolio-gallery-lightbox-img");
  const closeBtn = document.getElementById("portfolio-gallery-close");
  const lightboxClose = document.getElementById("portfolio-gallery-lightbox-close");

  if (!dialog || !titleEl || !gridEl || !lightboxEl || !lightboxImg) {
    return;
  }

  document.querySelectorAll("[data-portfolio-category]").forEach((el) => {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      const id = el.getAttribute("data-portfolio-category");
      if (id) {
        void openPortfolioGallery(id);
      }
    });
    el.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const id = el.getAttribute("data-portfolio-category");
        if (id) {
          void openPortfolioGallery(id);
        }
      }
    });
  });

  closeBtn?.addEventListener("click", () => {
    closePortfolioGallery();
  });

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    if (lightboxEl && !lightboxEl.hidden) {
      closeGalleryLightbox();
      return;
    }
    closePortfolioGallery();
  });

  dialog.addEventListener("click", onDialogClick);

  lightboxClose?.addEventListener("click", (event) => {
    event.stopPropagation();
    closeGalleryLightbox();
  });

  const lightboxPrev = document.getElementById("portfolio-gallery-lightbox-prev");
  const lightboxNext = document.getElementById("portfolio-gallery-lightbox-next");
  lightboxPrev?.addEventListener("click", (event) => {
    event.stopPropagation();
    lightboxStep(-1);
  });
  lightboxNext?.addEventListener("click", (event) => {
    event.stopPropagation();
    lightboxStep(1);
  });

  lightboxEl.addEventListener(
    "pointerdown",
    (event) => {
      if (lightboxEl.hidden) {
        return;
      }
      if (event.target instanceof Element && event.target.closest(".portfolio-gallery-lightbox__close")) {
        return;
      }
      if (event.target instanceof Element && event.target.closest(".portfolio-gallery-lightbox__arrow")) {
        return;
      }
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }
      swipePointerId = event.pointerId;
      swipeStartX = event.clientX;
      swipeStartY = event.clientY;
    },
    true,
  );

  lightboxEl.addEventListener(
    "pointerup",
    (event) => {
      if (swipePointerId === null || event.pointerId !== swipePointerId) {
        return;
      }
      swipePointerId = null;
      const dx = event.clientX - swipeStartX;
      const dy = event.clientY - swipeStartY;
      if (Math.abs(dx) < SWIPE_MIN_PX) {
        return;
      }
      if (Math.abs(dy) > Math.abs(dx) * SWIPE_VERTICAL_DOMINANCE) {
        return;
      }
      markSwipeGesture();
      if (dx < 0) {
        lightboxStep(1);
      } else {
        lightboxStep(-1);
      }
    },
    true,
  );

  lightboxEl.addEventListener("pointercancel", () => {
    swipePointerId = null;
  });

  lightboxEl.addEventListener("click", (event) => {
    if (performance.now() < suppressLightboxBackdropCloseUntil) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (event.target === lightboxImg) {
      return;
    }
    if (event.target instanceof Element && event.target.closest(".portfolio-gallery-lightbox__arrow")) {
      return;
    }
    closeGalleryLightbox();
  });

  dialog.addEventListener("keydown", (event) => {
    if (!lightboxEl || lightboxEl.hidden) {
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      lightboxStep(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      lightboxStep(1);
    }
  });

  window.addEventListener("hashchange", () => {
    const id = parseGalleryFromHash();
    if (!id) {
      closePortfolioGallery();
      return;
    }
    void ensureGalleriesLoaded().then(() => {
      if (!galleries?.[id] || visibleGalleryImages(id).length === 0) {
        return;
      }
      renderGallery(id);
      openPortfolioGalleryDialog();
    });
  });

  setCardAriaLabels();

  const initial = parseGalleryFromHash();
  if (initial) {
    await ensureGalleriesLoaded();
    if (galleries?.[initial] && visibleGalleryImages(initial).length > 0) {
      renderGallery(initial);
      openPortfolioGalleryDialog();
    }
  }
}
