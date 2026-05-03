import { resolvePortfolioGalleryImageSrc, t } from "../i18n.js";

const CATEGORY_LABEL_KEYS = {
  bridal: "portfolio.bridal.label",
  soft: "portfolio.soft.label",
  editorial: "portfolio.editorial.label",
  evening: "portfolio.evening.label",
};

let galleries = null;
/** @type {HTMLDialogElement | null} */
let dialog = null;
/** @type {HTMLElement | null} */
let titleEl = null;
/** @type {HTMLElement | null} */
let gridEl = null;

function parseGalleryFromHash() {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) {
    return null;
  }
  const params = new URLSearchParams(raw);
  const id = params.get("gallery");
  return id && typeof id === "string" ? id : null;
}

function formatModelTag(raw) {
  const s = String(raw).trim();
  if (!s) {
    return "";
  }
  return s.startsWith("@") ? s : `@${s}`;
}

function resolveTagText(item) {
  if (item.tagKey) {
    return formatModelTag(t(item.tagKey));
  }
  if (typeof item.tag === "string" && item.tag.trim()) {
    return formatModelTag(item.tag);
  }
  return "";
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

  const data = galleries[categoryId];
  if (!data) {
    return;
  }

  const labelKey = CATEGORY_LABEL_KEYS[categoryId];
  titleEl.textContent = labelKey ? t(labelKey) : categoryId;

  gridEl.innerHTML = "";
  data.images.forEach((item) => {
    const figure = document.createElement("figure");
    figure.className = "portfolio-gallery__figure";
    const img = document.createElement("img");
    img.className = "portfolio-gallery__img";
    const resolvedSrc = resolvePortfolioGalleryImageSrc(item.altKey, item.src);
    img.src = resolvedSrc;
    if (
      resolvedSrc &&
      (/drive\.google\.com\//i.test(resolvedSrc) ||
        /googleusercontent\.com/i.test(resolvedSrc) ||
        /drive\.usercontent\.google\.com/i.test(resolvedSrc))
    ) {
      img.referrerPolicy = "no-referrer";
    }
    img.alt = item.altKey ? t(item.altKey) : "";
    img.loading = "lazy";
    img.decoding = "async";
    figure.appendChild(img);

    const tagText = resolveTagText(item);
    if (tagText) {
      const tagEl = document.createElement("span");
      tagEl.className = "portfolio-gallery__tag";
      tagEl.textContent = tagText;
      figure.appendChild(tagEl);
    }

    const captionText = item.captionKey
      ? t(item.captionKey)
      : typeof item.caption === "string"
        ? item.caption
        : "";
    if (captionText) {
      const cap = document.createElement("figcaption");
      cap.className = "portfolio-gallery__caption";
      cap.textContent = captionText;
      figure.appendChild(cap);
    }

    gridEl.appendChild(figure);
  });
}

export function openPortfolioGallery(categoryId) {
  if (!dialog || !galleries || !galleries[categoryId]) {
    return;
  }

  renderGallery(categoryId);
  setGalleryHash(categoryId);
  if (!dialog.open) {
    dialog.showModal();
  }
}

export function closePortfolioGallery() {
  if (!dialog?.open) {
    return;
  }
  dialog.close();
  setGalleryHash(null);
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

function onDialogClick(event) {
  if (event.target === dialog) {
    closePortfolioGallery();
  }
}

export async function initPortfolioGallery() {
  await loadGalleries();

  dialog = document.getElementById("portfolio-gallery-dialog");
  titleEl = document.getElementById("portfolio-gallery-title");
  gridEl = document.getElementById("portfolio-gallery-grid");
  const closeBtn = document.getElementById("portfolio-gallery-close");

  if (!dialog || !titleEl || !gridEl) {
    return;
  }

  document.querySelectorAll("[data-portfolio-category]").forEach((el) => {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      const id = el.getAttribute("data-portfolio-category");
      if (id) {
        openPortfolioGallery(id);
      }
    });
    el.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const id = el.getAttribute("data-portfolio-category");
        if (id) {
          openPortfolioGallery(id);
        }
      }
    });
  });

  closeBtn?.addEventListener("click", () => {
    closePortfolioGallery();
  });

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closePortfolioGallery();
  });

  dialog.addEventListener("click", onDialogClick);

  window.addEventListener("hashchange", () => {
    const id = parseGalleryFromHash();
    if (!id) {
      if (dialog.open) {
        dialog.close();
      }
      return;
    }
    if (galleries?.[id]) {
      renderGallery(id);
      if (!dialog.open) {
        dialog.showModal();
      }
    }
  });

  setCardAriaLabels();

  const initial = parseGalleryFromHash();
  if (initial && galleries?.[initial]) {
    renderGallery(initial);
    dialog.showModal();
  }
}
