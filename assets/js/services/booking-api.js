import { CONFIG } from "../config.js";

const AVAIL_CACHE_KEY = "juliamakeup:booking:availability:v1";

/** @type {Promise<unknown> | null} */
let availabilityInFlight = null;

/** @type {Promise<boolean> | null} */
let writeWarmInFlight = null;

/** @type {Promise<unknown[]> | null} */
let warmAllInFlight = null;

/** @returns {string} */
function getBookingReadBaseUrl() {
  const read = CONFIG.bookingReadScriptUrl?.trim();
  if (read) {
    return read;
  }
  return CONFIG.bookingScriptUrl?.trim() || "";
}

/**
 * @returns {string | null}
 */
export function getAvailabilityRequestUrl() {
  const base = getBookingReadBaseUrl();
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
 * Availability is always fetched from the network (no localStorage cache).
 * @returns {null}
 */
export function getCachedAvailability() {
  return null;
}

/** @returns {boolean} */
export function hasAvailabilityCache() {
  return false;
}

/** Clears any legacy localStorage entry from older builds. */
export function clearAvailabilityCache() {
  try {
    localStorage.removeItem(AVAIL_CACHE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * @param {string} text
 * @returns {{ ok: boolean, slots?: unknown[], message?: string, pendingVerification?: boolean, code?: string }}
 */
function parseAvailabilityResponse(text) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) {
    return { ok: false, message: "Empty response from server." };
  }
  if (trimmed.startsWith("<")) {
    return { ok: false, message: "Invalid response from server." };
  }
  try {
    const data = JSON.parse(trimmed);
    if (!data || typeof data !== "object") {
      return { ok: false, message: "Invalid response from server." };
    }
    return data;
  } catch {
    return { ok: false, message: "Invalid response from server." };
  }
}

/**
 * @returns {Promise<{ ok: boolean, slots?: Array<{ slotId: string, date: string, time: string, allowedServices?: string[], service?: string, label?: string }>, message?: string, pendingVerification?: boolean, code?: string }>}
 */
async function fetchAvailabilityFromNetwork() {
  const url = getAvailabilityRequestUrl();
  if (!url) {
    return { ok: false, message: "Booking URL not configured." };
  }

  let response;
  try {
    response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        Accept: "application/json",
      },
    });
  } catch {
    return { ok: false, message: "Could not reach booking server." };
  }

  const text = await response.text();
  const data = parseAvailabilityResponse(text);
  if (!response.ok && data.ok !== true) {
    return { ok: false, message: data.message || `Booking server error (${response.status}).` };
  }
  return data;
}

function dispatchAvailabilityUpdated(data) {
  window.dispatchEvent(
    new CustomEvent("juliamakeup:availability-updated", {
      detail: data,
    }),
  );
}

function scheduleAvailabilityRevalidate() {
  if (!getAvailabilityRequestUrl()) {
    return null;
  }

  if (availabilityInFlight) {
    return availabilityInFlight;
  }

  availabilityInFlight = fetchAvailabilityFromNetwork()
    .then((data) => {
      if (data.ok) {
        dispatchAvailabilityUpdated(data);
      }
      return data;
    })
    .finally(() => {
      availabilityInFlight = null;
    });

  return availabilityInFlight;
}

/** Prefetch — always hits the network (no browser cache). */
export function prefetchAvailability() {
  return scheduleAvailabilityRevalidate();
}

/**
 * Ping the write /exec (createReservation) so its GAS instance is warm before submit.
 * Cheap GET — returns API help JSON. Does not create a reservation.
 * @returns {Promise<boolean> | null}
 */
/** @returns {string | null} */
export function getWriteWarmupRequestUrl() {
  const base = CONFIG.bookingScriptUrl?.trim();
  if (!base) {
    return null;
  }
  try {
    const u = new URL(base);
    u.searchParams.set("action", "warmup");
    return u.toString();
  } catch {
    return null;
  }
}

export function warmBookingWriteBackend() {
  const url = getWriteWarmupRequestUrl();
  if (!url) {
    return null;
  }

  if (writeWarmInFlight) {
    return writeWarmInFlight;
  }

  writeWarmInFlight = fetch(url, {
    method: "GET",
    redirect: "follow",
    headers: {
      Accept: "application/json",
    },
  })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      writeWarmInFlight = null;
    });

  return writeWarmInFlight;
}

/**
 * Warm read (availability) + write (reservation) GAS deployments in the background.
 * Safe to call on page entry — never blocks UI.
 * @returns {Promise<unknown[]> | null}
 */
export function warmBookingBackend() {
  if (warmAllInFlight) {
    return warmAllInFlight;
  }

  const tasks = [];
  const readWarm = scheduleAvailabilityRevalidate();
  const writeWarm = warmBookingWriteBackend();
  if (readWarm) {
    tasks.push(readWarm);
  }
  if (writeWarm) {
    tasks.push(writeWarm);
  }
  if (!tasks.length) {
    return null;
  }

  warmAllInFlight = Promise.all(tasks).finally(() => {
    warmAllInFlight = null;
  });
  return warmAllInFlight;
}

/**
 * Always fetches availability from the network (no localStorage cache).
 * @param {{ forceFresh?: boolean }} [options]
 * @returns {Promise<{ ok: boolean, slots?: Array<{ slotId: string, date: string, time: string, allowedServices?: string[], service?: string, label?: string }>, message?: string, pendingVerification?: boolean, code?: string }>}
 */
export async function fetchAvailability(options = {}) {
  void options;
  clearAvailabilityCache();

  if (availabilityInFlight) {
    return /** @type {Promise<ReturnType<typeof fetchAvailabilityFromNetwork>>} */ (availabilityInFlight);
  }

  availabilityInFlight = fetchAvailabilityFromNetwork().finally(() => {
    availabilityInFlight = null;
  });

  return availabilityInFlight;
}

/**
 * Token actions from email CTAs (verify / approve / reject / cancel).
 * Calls write /exec with format=json (site action.html).
 * @param {string} action
 * @param {string} token
 * @returns {Promise<{ ok?: boolean, bookingResult?: string, bookingCode?: string, code?: string, message?: string }>}
 */
export async function fetchBookingTokenAction(action, token) {
  const base = CONFIG.bookingScriptUrl?.trim();
  if (!base) {
    return { ok: false, bookingResult: "error", bookingCode: "CONFIG", message: "Booking URL not configured." };
  }

  let url;
  try {
    const u = new URL(base);
    u.searchParams.set("action", String(action || ""));
    u.searchParams.set("token", String(token || ""));
    u.searchParams.set("format", "json");
    url = u.toString();
  } catch {
    return { ok: false, bookingResult: "error", bookingCode: "CONFIG", message: "Booking URL not configured." };
  }

  let response;
  try {
    response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        Accept: "application/json",
      },
    });
  } catch {
    return { ok: false, bookingResult: "error", bookingCode: "", message: "Could not reach booking server." };
  }

  const text = await response.text();
  const trimmed = String(text ?? "").trim();
  if (!trimmed || trimmed.startsWith("<")) {
    return { ok: false, bookingResult: "error", bookingCode: "", message: "Invalid response from server." };
  }

  try {
    const data = JSON.parse(trimmed);
    if (!data || typeof data !== "object") {
      return { ok: false, bookingResult: "error", bookingCode: "", message: "Invalid response from server." };
    }
    return data;
  } catch {
    return { ok: false, bookingResult: "error", bookingCode: "", message: "Invalid response from server." };
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
    const data = JSON.parse(text);
    if (data.ok) {
      clearAvailabilityCache();
    }
    return data;
  } catch {
    return { ok: false, message: "Invalid response from server." };
  }
}
