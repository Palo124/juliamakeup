/**
 * Post-visit review page — save rating on load, optional comment, thank-you.
 */
import { messageForReviewCode } from "../core/review-outcomes.js";
import { getLangFromPath, pagePath } from "../core/locale-urls.js";
import { applyTranslations, t } from "../i18n.js";
import { postReviewFeedback, warmBookingWriteBackend } from "../services/booking-api.js";

/** @param {HTMLElement | null} card @param {"loading" | "form" | "success" | "error"} state */
function setState(card, state) {
  if (!card) {
    return;
  }
  card.dataset.state = state;
}

/** @param {1 | 2 | 3} rating */
function ratingCaption(rating) {
  return t(`review.rating${rating}`);
}

/** @param {1 | 2 | 3} rating */
function renderStarsMarkup(rating) {
  const stars = "★".repeat(rating);
  return `<span class="review-stars-display__stars" aria-hidden="true">${stars}</span><span class="review-stars-display__label">${ratingCaption(rating)}</span>`;
}

/**
 * @param {HTMLElement | null} card
 * @param {string} messageKey
 */
function showError(card, messageKey) {
  const titleEl = document.getElementById("review-title");
  const textEl = document.getElementById("review-text");
  const spinnerEl = document.getElementById("review-spinner");
  const formPanel = document.getElementById("review-form-panel");
  const ctaEl = document.getElementById("review-home-cta");

  setState(card, "error");
  if (spinnerEl) {
    spinnerEl.hidden = true;
  }
  if (formPanel) {
    formPanel.hidden = true;
  }
  if (titleEl) {
    titleEl.removeAttribute("data-i18n");
    titleEl.textContent = t("review.errorTitle");
  }
  if (textEl) {
    textEl.removeAttribute("data-i18n");
    textEl.textContent = t(messageKey);
  }
  if (ctaEl) {
    ctaEl.classList.remove("hidden");
  }
}

/** @param {HTMLElement | null} card @param {1 | 2 | 3} rating */
function showForm(card, rating) {
  const titleEl = document.getElementById("review-title");
  const textEl = document.getElementById("review-text");
  const hintEl = document.getElementById("review-form-hint");
  const spinnerEl = document.getElementById("review-spinner");
  const formPanel = document.getElementById("review-form-panel");
  const starsEl = document.getElementById("review-stars-display");
  const ctaEl = document.getElementById("review-home-cta");

  setState(card, "form");
  if (spinnerEl) {
    spinnerEl.hidden = true;
  }
  if (titleEl) {
    titleEl.removeAttribute("data-i18n");
    titleEl.textContent = t("review.formTitle");
  }
  if (textEl) {
    textEl.hidden = true;
  }
  if (hintEl) {
    hintEl.hidden = false;
  }
  if (starsEl) {
    starsEl.innerHTML = renderStarsMarkup(rating);
    starsEl.setAttribute("aria-label", ratingCaption(rating));
  }
  if (formPanel) {
    formPanel.hidden = false;
  }
  if (ctaEl) {
    ctaEl.classList.add("hidden");
  }
}

/** @param {HTMLElement | null} card */
function showThankYou(card) {
  const titleEl = document.getElementById("review-title");
  const textEl = document.getElementById("review-text");
  const hintEl = document.getElementById("review-form-hint");
  const spinnerEl = document.getElementById("review-spinner");
  const formPanel = document.getElementById("review-form-panel");
  const ctaEl = document.getElementById("review-home-cta");

  setState(card, "success");
  if (spinnerEl) {
    spinnerEl.hidden = true;
  }
  if (hintEl) {
    hintEl.hidden = true;
  }
  if (formPanel) {
    formPanel.hidden = true;
  }
  if (titleEl) {
    titleEl.removeAttribute("data-i18n");
    titleEl.textContent = t("review.thankYouTitle");
  }
  if (textEl) {
    textEl.hidden = false;
    textEl.removeAttribute("data-i18n");
    textEl.textContent = t("review.thankYouBody");
  }
  if (ctaEl) {
    ctaEl.classList.remove("hidden");
  }
}

/** @returns {1 | 2 | 3 | null} */
function parseRatingParam(raw) {
  const n = Number(String(raw || "").trim());
  if (n === 1 || n === 2 || n === 3) {
    return n;
  }
  return null;
}

async function run() {
  const card = document.getElementById("review-card");
  const lang = getLangFromPath();
  document.documentElement.lang = lang === "sk" ? "sk" : "en";
  applyTranslations();

  const ctaEl = document.getElementById("review-home-cta");
  if (ctaEl) {
    ctaEl.href = pagePath("home", lang);
  }

  const params = new URLSearchParams(window.location.search);
  const token = String(params.get("token") || "").trim();
  const rating = parseRatingParam(params.get("rating"));

  if (!token || !rating) {
    showError(card, !token ? "review.invalidLink" : "review.invalidRating");
    return;
  }

  warmBookingWriteBackend();
  setState(card, "loading");

  const saveRating = await postReviewFeedback({ token, step: "rating", rating });
  if (!saveRating || saveRating.ok !== true) {
    const code = saveRating?.reviewCode || "";
    showError(card, messageForReviewCode(code));
    return;
  }

  if (saveRating.reviewResult === "complete") {
    showThankYou(card);
    return;
  }

  showForm(card, rating);

  const form = document.getElementById("review-form");
  const commentEl = document.getElementById("review-comment");
  const submitBtn = document.getElementById("review-submit");
  const skipBtn = document.getElementById("review-skip");

  /** @param {"comment" | "skip"} step */
  async function finish(step) {
    if (submitBtn) {
      submitBtn.disabled = true;
    }
    if (skipBtn) {
      skipBtn.disabled = true;
    }
    if (commentEl) {
      commentEl.disabled = true;
    }

    const payload =
      step === "skip"
        ? { token, step: "skip" }
        : { token, step: "comment", text: String(commentEl?.value || "").trim() };

    const result = await postReviewFeedback(payload);
    if (!result || result.ok !== true) {
      if (submitBtn) {
        submitBtn.disabled = false;
      }
      if (skipBtn) {
        skipBtn.disabled = false;
      }
      if (commentEl) {
        commentEl.disabled = false;
      }
      showError(card, messageForReviewCode(result?.reviewCode));
      return;
    }

    showThankYou(card);
  }

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    void finish("comment");
  });

  skipBtn?.addEventListener("click", () => {
    void finish("skip");
  });
}

void run();
