import { CONFIG } from "../config.js";

/**
 * @returns {string | null}
 */
export function getAvailabilityRequestUrl() {
  const base = CONFIG.bookingScriptUrl?.trim();
  if (!base) {
    return null;
  }
  try {
    const u = new URL(base);
    u.searchParams.set("action", "getAvailability");
    return u.toString();
  } catch {
    return null;
  }
}

/**
 * @returns {Promise<{ ok: boolean, slots?: Array<{ slotId: string, date: string, time: string, allowedServices?: string[], service?: string, label?: string }>, message?: string, pendingVerification?: boolean, code?: string }>}
 */
export async function fetchAvailability() {
  const url = getAvailabilityRequestUrl();
  if (!url) {
    return { ok: false, message: "Booking URL not configured." };
  }

  const response = await fetch(url, {
    method: "GET",
    redirect: "follow",
    headers: {
      Accept: "application/json",
    },
  });

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, message: "Invalid response from server." };
  }
}

/**
 * @param {Record<string, string>} reservation
 */
export async function postReservation(reservation) {
  const base = CONFIG.bookingScriptUrl?.trim();
  if (!base) {
    return { ok: false, message: "Booking URL not configured." };
  }

  const response = await fetch(base, {
    method: "POST",
    redirect: "follow",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
      Accept: "application/json",
    },
    body: JSON.stringify({
      action: "createReservation",
      reservation,
    }),
  });

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, message: "Invalid response from server." };
  }
}
