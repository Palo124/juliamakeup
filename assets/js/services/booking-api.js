import { CONFIG } from "../config.js";

const AVAIL_SESSION_KEY = "juliamakeup:booking:availability:v1";
const AVAIL_SESSION_TTL_MS = 3 * 60 * 1000;
const AVAIL_STALE_REVALIDATE_MS = 45 * 1000;

/** @type {Promise<unknown> | null} */
let availabilityInFlight = null;

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
 * @returns {{ fetchedAt: number, data: { ok: boolean, slots?: Array<{ slotId: string, date: string, time: string, allowedServices?: string[], service?: string, label?: string }>, message?: string, pendingVerification?: boolean, code?: string } } | null}
 */
function readSessionAvailabilityCache() {
  try {
    const raw = sessionStorage.getItem(AVAIL_SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.fetchedAt !== "number" || !parsed.data) {
      return null;
    }
    if (Date.now() - parsed.fetchedAt > AVAIL_SESSION_TTL_MS) {
      sessionStorage.removeItem(AVAIL_SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * @param {{ ok: boolean, slots?: unknown[], message?: string, pendingVerification?: boolean, code?: string }} data
 */
function writeSessionAvailabilityCache(data) {
  if (!data?.ok || !Array.isArray(data.slots)) {
    return;
  }
  try {
    sessionStorage.setItem(
      AVAIL_SESSION_KEY,
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
    sessionStorage.removeItem(AVAIL_SESSION_KEY);
  } catch {
    /* ignore */
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

function dispatchAvailabilityUpdated(data) {
  window.dispatchEvent(
    new CustomEvent("juliamakeup:availability-updated", {
      detail: data,
    }),
  );
}

function scheduleAvailabilityRevalidate() {
  if (availabilityInFlight) {
    return;
  }

  availabilityInFlight = fetchAvailabilityFromNetwork()
    .then((data) => {
      if (data.ok) {
        writeSessionAvailabilityCache(data);
        dispatchAvailabilityUpdated(data);
      }
      return data;
    })
    .finally(() => {
      availabilityInFlight = null;
    });
}

/** Warm the network path as early as possible on the booking page. */
export function prefetchAvailability() {
  if (!getAvailabilityRequestUrl()) {
    return;
  }
  if (readSessionAvailabilityCache()) {
    return;
  }
  scheduleAvailabilityRevalidate();
}

/**
 * @param {{ forceFresh?: boolean }} [options]
 * @returns {Promise<{ ok: boolean, slots?: Array<{ slotId: string, date: string, time: string, allowedServices?: string[], service?: string, label?: string }>, message?: string, pendingVerification?: boolean, code?: string }>}
 */
export async function fetchAvailability(options = {}) {
  const { forceFresh = false } = options;
  const cached = !forceFresh ? readSessionAvailabilityCache() : null;

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
        writeSessionAvailabilityCache(data);
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
