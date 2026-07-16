/**
 * Email CTA landing — paints “processing” immediately, then calls write /exec?format=json.
 */
import { messageForBookingUrlOutcome, isBookingOutcomeError } from "../core/booking-outcomes.js";
import { getLangFromPath, pagePath } from "../core/locale-urls.js";
import { applyTranslations, t } from "../i18n.js";
import { fetchBookingTokenAction, warmBookingWriteBackend } from "../services/booking-api.js";

const ALLOWED_ACTIONS = new Set([
  "verifyEmail",
  "approveReservation",
  "rejectReservation",
  "cancelReservation",
]);

/**
 * @param {HTMLElement | null} card
 * @param {"loading" | "success" | "error"} state
 */
function setState(card, state) {
  if (!card) {
    return;
  }
  card.dataset.state = state;
}

/**
 * @param {HTMLElement | null} card
 * @param {string} result
 * @param {string} code
 */
function showResult(card, result, code) {
  const titleEl = document.getElementById("booking-action-title");
  const textEl = document.getElementById("booking-action-text");
  const hintEl = document.getElementById("booking-action-hint");
  const spinnerEl = document.getElementById("booking-action-spinner");
  const ctaEl = document.getElementById("booking-action-cta");
  const message = messageForBookingUrlOutcome(result, code);
  const isError = isBookingOutcomeError(result);
  const lang = getLangFromPath();

  setState(card, isError ? "error" : "success");

  if (spinnerEl) {
    spinnerEl.hidden = true;
  }
  if (hintEl) {
    hintEl.hidden = true;
  }
  if (titleEl) {
    titleEl.removeAttribute("data-i18n");
    titleEl.textContent = t(isError ? "booking.actionFailTitle" : "booking.actionDoneTitle");
  }
  if (textEl) {
    textEl.removeAttribute("data-i18n");
    textEl.textContent = message;
  }
  if (ctaEl) {
    ctaEl.classList.remove("hidden");
    ctaEl.href = pagePath("booking", lang);
  }
}

async function run() {
  const card = document.getElementById("booking-action-card");
  const lang = getLangFromPath();
  document.documentElement.lang = lang === "sk" ? "sk" : "en";
  applyTranslations();

  const ctaEl = document.getElementById("booking-action-cta");
  if (ctaEl) {
    ctaEl.href = pagePath("booking", lang);
  }

  warmBookingWriteBackend();

  const params = new URLSearchParams(window.location.search);
  const action = String(params.get("action") || "").trim();
  const token = String(params.get("token") || "").trim();

  if (!ALLOWED_ACTIONS.has(action) || !token) {
    showResult(card, "error", "INVALID_TOKEN");
    return;
  }

  setState(card, "loading");

  const data = await fetchBookingTokenAction(action, token);
  if (!data || data.ok !== true || !data.bookingResult) {
    showResult(card, "error", data?.bookingCode || data?.code || "");
    return;
  }

  showResult(card, data.bookingResult, data.bookingCode || data.code || "");
}

void run();
