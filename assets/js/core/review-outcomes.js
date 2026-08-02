/**
 * Review feedback API error messages for review.html.
 */

/** @typedef {"INVALID_TOKEN" | "INVALID_RATING" | "INVALID_STEP" | "RATING_LOCKED" | "RATING_REQUIRED" | "BUSY" | "CONFIG" | ""} ReviewCode */

/** @param {ReviewCode | string} [code] */
export function messageForReviewCode(code) {
  const key = String(code || "").trim().toUpperCase();
  const map = {
    INVALID_TOKEN: "review.invalidLink",
    INVALID_RATING: "review.invalidRating",
    INVALID_STEP: "review.serverError",
    RATING_LOCKED: "review.ratingLocked",
    RATING_REQUIRED: "review.serverError",
    BUSY: "booking.errBusy",
    CONFIG: "booking.serverConfig",
  };
  return map[key] || "review.serverError";
}

/** @param {ReviewCode | string} [code] */
export function isReviewErrorCode(code) {
  return Boolean(String(code || "").trim());
}
