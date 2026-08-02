import { t } from "../i18n.js";

/**
 * User-facing copy for bookingResult / bookingCode from token-link outcomes.
 * @param {string} result
 * @param {string} code
 * @returns {string}
 */
export function messageForBookingUrlOutcome(result, code) {
  const r = String(result || "").trim();
  const c = String(code || "").trim();
  if (r === "email_verified") {
    return t("booking.resultEmailVerified");
  }
  if (r === "confirmed") {
    return t("booking.resultConfirmed");
  }
  if (r === "rejected") {
    return t("booking.resultRejected");
  }
  if (r === "cancelled") {
    return t("booking.resultCancelled");
  }
  if (r === "already_cancelled") {
    return t("booking.resultAlreadyCancelled");
  }
  if (r === "review_unsubscribed") {
    return t("review.unsubscribeDoneBody");
  }
  if (r === "error") {
    if (c === "EXPIRED_VERIFICATION") {
      return t("booking.expiredVerification");
    }
    if (c === "TOKEN_USED") {
      return t("booking.tokenUsed");
    }
    if (c === "INVALID_TOKEN") {
      return t("booking.invalidToken");
    }
    if (c === "SLOT_TAKEN") {
      return t("booking.slotTaken");
    }
    if (c === "CONFIG") {
      return t("booking.serverConfig");
    }
    if (c === "BUSY") {
      return t("booking.errBusy");
    }
    if (c === "MAIL_ERROR") {
      return t("booking.mailError");
    }
    return t("booking.resultLinkError");
  }
  return t("booking.resultLinkError");
}

/**
 * @param {string} result
 * @returns {boolean}
 */
export function isBookingOutcomeError(result) {
  const r = String(result || "").trim();
  return r === "error" || r === "rejected";
}
