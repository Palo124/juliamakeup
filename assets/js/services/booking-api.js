import { CONFIG } from "../config.js";

const AVAIL_CACHE_KEY = "juliamakeup:booking:availability:v1";
const AVAIL_CACHE_TTL_MS = 60 * 60 * 1000;
const AVAIL_STALE_REVALIDATE_MS = 5 * 60 * 1000;

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
 * @returns {{ fetchedAt: number, data: { ok: boolean, slots?: Array<{ slotId: string, date: string, time: string, allowedServices?: string[], service?: string, label?: string }>, message?: string, pendingVerification?: boolean, code?: string } } | null}
 */
function readAvailabilityCacheEntry() {
  try {
    const raw = localStorage.getItem(AVAIL_CACHE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.fetchedAt !== "number" || !parsed.data) {
      return null;
    }
    if (Date.now() - parsed.fetchedAt > AVAIL_CACHE_TTL_MS) {
      localStorage.removeItem(AVAIL_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * @returns {{ ok: boolean, slots?: Array<{ slotId: string, date: string, time: string, allowedServices?: string[], service?: string, label?: string }>, message?: string, pendingVerification?: boolean, code?: string } | null}
 */
export function getCachedAvailability() {
  return readAvailabilityCacheEntry()?.data ?? null;
}

/** @returns {boolean} */
export function hasAvailabilityCache() {
  const cached = getCachedAvailability();
  return Boolean(cached?.ok && Array.isArray(cached.slots) && cached.slots.length > 0);
}

/**
 * @param {{ ok: boolean, slots?: unknown[], message?: string, pendingVerification?: boolean, code?: string }} data
 */
function writeAvailabilityCache(data) {
  if (!data?.ok || !Array.isArray(data.slots)) {
    return;
  }
  try {
    localStorage.setItem(
      AVAIL_CACHE_KEY,
      JSON.stringify({
        fetchedAt: Date.now(),
        data,
      }),
    );
  } catch {
    /* quota / private mode */
  }
}

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
        writeAvailabilityCache(data);
        dispatchAvailabilityUpdated(data);
      }
      return data;
    })
    .finally(() => {
      availabilityInFlight = null;
    });

  return availabilityInFlight;
}

/** Soft prefetch — refreshes in background when cache is older than 5 minutes. */
export function prefetchAvailability() {
  if (!getAvailabilityRequestUrl()) {
    return null;
  }

  const cached = readAvailabilityCacheEntry();
  if (cached) {
    const age = Date.now() - cached.fetchedAt;
    if (age < AVAIL_STALE_REVALIDATE_MS) {
      return null;
    }
    return scheduleAvailabilityRevalidate();
  }

  return scheduleAvailabilityRevalidate();
}

/**
 * Ping the write /exec (createReservation) so its GAS instance is warm before submit.
 * Cheap GET — returns API help JSON. Does not create a reservation.
 * @returns {Promise<boolean> | null}
 */
export function warmBookingWriteBackend() {
  const base = CONFIG.bookingScriptUrl?.trim();
  if (!base) {
    return null;
  }

  if (writeWarmInFlight) {
    return writeWarmInFlight;
  }

  writeWarmInFlight = fetch(base, {
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
 * @param {{ forceFresh?: boolean }} [options]
 * @returns {Promise<{ ok: boolean, slots?: Array<{ slotId: string, date: string, time: string, allowedServices?: string[], service?: string, label?: string }>, message?: string, pendingVerification?: boolean, code?: string }>}
 */
export async function fetchAvailability(options = {}) {
  const { forceFresh = false } = options;
  const cached = !forceFresh ? readAvailabilityCacheEntry() : null;

  if (cached && !forceFresh) {
    const age = Date.now() - cached.fetchedAt;
    if (age >= AVAIL_STALE_REVALIDATE_MS) {
      scheduleAvailabilityRevalidate();
    }
    return cached.data;
  }

  if (availabilityInFlight) {
    return /** @type {Promise<ReturnType<typeof fetchAvailabilityFromNetwork>>} */ (availabilityInFlight);
  }

  availabilityInFlight = fetchAvailabilityFromNetwork()
    .then((data) => {
      if (data.ok) {
        writeAvailabilityCache(data);
      }
      return data;
    })
    .finally(() => {
      availabilityInFlight = null;
    });

  return availabilityInFlight;
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
