import { t } from "../i18n.js";

/** @typedef {"signature"|"bridal"|"trial"|"lesson"|"brows"|"shoot"} PriceServiceId */

const SERVICE_IDS = /** @type {const} */ (["signature", "bridal", "trial", "lesson", "brows", "shoot"]);

const TITLE_KEYS = {
  signature: "prices.signature.h3",
  bridal: "prices.bridal.h3",
  trial: "prices.trial.h3",
  lesson: "prices.lesson.h3",
  brows: "prices.brows.h3",
  shoot: "prices.shoot.h3",
};

const PRICE_KEYS = {
  signature: "prices.signature.price",
  bridal: "prices.bridal.price",
  trial: "prices.trial.price",
  lesson: "prices.lesson.price",
  brows: "prices.brows.price",
  shoot: "prices.shoot.price",
};

const DETAIL_KEYS = {
  signature: "prices.signature.detail",
  bridal: "prices.bridal.detail",
  trial: "prices.trial.detail",
  lesson: "prices.lesson.detail",
  brows: "prices.brows.detail",
  shoot: "prices.shoot.detail",
};

const DURATION_KEYS = {
  signature: "prices.signature.duration",
  bridal: "prices.bridal.duration",
  trial: "prices.trial.duration",
  lesson: "prices.lesson.duration",
  brows: "prices.brows.duration",
  shoot: "prices.shoot.duration",
};

/** @type {HTMLDialogElement | null} */
let dialog = null;
/** @type {HTMLElement | null} */
let titleEl = null;
/** @type {HTMLElement | null} */
let priceEl = null;
/** @type {HTMLElement | null} */
let durationEl = null;
/** @type {HTMLElement | null} */
let bodyEl = null;

function parsePriceFromHash() {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) {
    return null;
  }
  const params = new URLSearchParams(raw);
  const id = params.get("price");
  if (!id || typeof id !== "string") {
    return null;
  }
  return SERVICE_IDS.includes(/** @type {PriceServiceId} */ (id)) ? /** @type {PriceServiceId} */ (id) : null;
}

function setPriceHash(serviceId) {
  const base = `${window.location.pathname}${window.location.search}`;
  if (serviceId) {
    window.history.replaceState(null, "", `${base}#price=${encodeURIComponent(serviceId)}`);
  } else {
    window.history.replaceState(null, "", base);
  }
}

function renderDetail(serviceId) {
  if (!titleEl || !priceEl || !durationEl || !bodyEl) {
    return;
  }

  titleEl.textContent = t(TITLE_KEYS[serviceId]);
  priceEl.textContent = t(PRICE_KEYS[serviceId]);
  durationEl.textContent = t(DURATION_KEYS[serviceId]);

  const detail = t(DETAIL_KEYS[serviceId]);
  bodyEl.innerHTML = "";
  const chunks = detail
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  chunks.forEach((chunk) => {
    const p = document.createElement("p");
    p.textContent = chunk;
    bodyEl.appendChild(p);
  });
}

/**
 * @param {PriceServiceId} serviceId
 */
export function openPriceServiceDialog(serviceId) {
  if (!dialog || !SERVICE_IDS.includes(serviceId)) {
    return;
  }

  renderDetail(serviceId);
  setPriceHash(serviceId);
  if (!dialog.open) {
    dialog.showModal();
  }
}

export function closePriceServiceDialog() {
  if (!dialog?.open) {
    return;
  }
  dialog.close();
  setPriceHash(null);
}

function setCardAriaLabels() {
  document.querySelectorAll("[data-price-service]").forEach((el) => {
    const id = el.getAttribute("data-price-service");
    if (!id || !TITLE_KEYS[/** @type {PriceServiceId} */ (id)]) {
      return;
    }
    const sid = /** @type {PriceServiceId} */ (id);
    el.setAttribute("aria-label", `${t(TITLE_KEYS[sid])} — ${t("prices.detail.openSuffix")}`);
  });
}

export function refreshPriceServiceDialogI18n() {
  setCardAriaLabels();
  const id = parsePriceFromHash();
  if (dialog?.open && id) {
    renderDetail(id);
  }
}

function onDialogClick(event) {
  if (event.target === dialog) {
    closePriceServiceDialog();
  }
}

export function initPriceServiceDialog() {
  dialog = document.getElementById("price-service-dialog");
  titleEl = document.getElementById("price-service-title");
  priceEl = document.getElementById("price-service-price");
  durationEl = document.getElementById("price-service-duration");
  bodyEl = document.getElementById("price-service-body");
  const closeBtn = document.getElementById("price-service-close");

  if (!dialog || !titleEl || !priceEl || !durationEl || !bodyEl) {
    return;
  }

  document.querySelectorAll("[data-price-service]").forEach((el) => {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      const id = el.getAttribute("data-price-service");
      if (id && SERVICE_IDS.includes(/** @type {PriceServiceId} */ (id))) {
        openPriceServiceDialog(/** @type {PriceServiceId} */ (id));
      }
    });
    el.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const id = el.getAttribute("data-price-service");
        if (id && SERVICE_IDS.includes(/** @type {PriceServiceId} */ (id))) {
          openPriceServiceDialog(/** @type {PriceServiceId} */ (id));
        }
      }
    });
  });

  closeBtn?.addEventListener("click", () => {
    closePriceServiceDialog();
  });

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closePriceServiceDialog();
  });

  dialog.addEventListener("click", onDialogClick);

  window.addEventListener("hashchange", () => {
    const id = parsePriceFromHash();
    if (!id) {
      if (dialog.open) {
        dialog.close();
      }
      return;
    }
    renderDetail(id);
    if (!dialog.open) {
      dialog.showModal();
    }
  });

  setCardAriaLabels();

  const initial = parsePriceFromHash();
  if (initial) {
    renderDetail(initial);
    dialog.showModal();
  }
}
