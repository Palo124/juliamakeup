/**
 * Frontend booking-api helpers (Node, no browser).
 * Usage: npm run test:booking:frontend
 */
import assert from "node:assert/strict";
import test from "node:test";

/** Minimal localStorage for Node. */
function createLocalStorage() {
  /** @type {Map<string, string>} */
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

test("getAvailabilityRequestUrl prefers bookingReadScriptUrl", async () => {
  globalThis.localStorage = createLocalStorage();

  const configModule = await import("../assets/js/config.js");
  const originalWrite = configModule.CONFIG.bookingScriptUrl;
  const originalRead = configModule.CONFIG.bookingReadScriptUrl;
  configModule.CONFIG.bookingScriptUrl =
    "https://script.google.com/macros/s/WRITE_TEST/exec";
  configModule.CONFIG.bookingReadScriptUrl =
    "https://script.google.com/macros/s/READ_TEST/exec";

  const api = await import("../assets/js/services/booking-api.js");
  const url = api.getAvailabilityRequestUrl();
  assert.ok(url);
  assert.match(/** @type {string} */ (url), /READ_TEST/);
  assert.doesNotMatch(/** @type {string} */ (url), /WRITE_TEST/);

  configModule.CONFIG.bookingScriptUrl = originalWrite;
  configModule.CONFIG.bookingReadScriptUrl = originalRead;
});

test("getAvailabilityRequestUrl builds action query", async () => {
  globalThis.localStorage = createLocalStorage();

  const configModule = await import("../assets/js/config.js");
  const originalUrl = configModule.CONFIG.bookingScriptUrl;
  configModule.CONFIG.bookingScriptUrl =
    "https://script.google.com/macros/s/AKfycbzTEST/exec";

  const api = await import("../assets/js/services/booking-api.js");
  const url = api.getAvailabilityRequestUrl();
  assert.ok(url);
  const parsed = new URL(/** @type {string} */ (url));
  assert.equal(parsed.searchParams.get("action"), "getAvailability");

  configModule.CONFIG.bookingScriptUrl = originalUrl;
});

test("fetchAvailability always hits network and does not cache", async () => {
  globalThis.localStorage = createLocalStorage();
  const api = await import("../assets/js/services/booking-api.js");

  const payload = {
    ok: true,
    slots: [{ slotId: "s1", date: "2026-09-01", time: "10:00", allowedServices: ["Signature Makeup"] }],
  };

  // Legacy cache entry must be ignored / cleared.
  globalThis.localStorage.setItem(
    "juliamakeup:booking:availability:v1",
    JSON.stringify({ fetchedAt: Date.now(), data: { ok: true, slots: [] } }),
  );

  let fetchCalls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return {
      ok: true,
      text: async () => JSON.stringify(payload),
    };
  };

  try {
    const result = await api.fetchAvailability();
    assert.deepEqual(result, payload);
    assert.equal(fetchCalls, 1);
    assert.equal(api.getCachedAvailability(), null);
    assert.equal(api.hasAvailabilityCache(), false);
    assert.equal(globalThis.localStorage.getItem("juliamakeup:booking:availability:v1"), null);

    await api.fetchAvailability();
    assert.equal(fetchCalls, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("warmBookingBackend deduplicates concurrent fetches", async () => {
  globalThis.localStorage = createLocalStorage();
  globalThis.window = {
    dispatchEvent() {},
  };
  const configModule = await import("../assets/js/config.js");
  const originalWrite = configModule.CONFIG.bookingScriptUrl;
  const originalRead = configModule.CONFIG.bookingReadScriptUrl;
  configModule.CONFIG.bookingScriptUrl =
    "https://script.google.com/macros/s/WRITE_WARM/exec";
  configModule.CONFIG.bookingReadScriptUrl =
    "https://script.google.com/macros/s/READ_WARM/exec";

  const api = await import("../assets/js/services/booking-api.js");
  api.clearAvailabilityCache();

  let fetchCalls = 0;
  /** @type {Set<string>} */
  const urls = new Set();
  const payload = { ok: true, slots: [] };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    fetchCalls += 1;
    urls.add(String(input));
    await new Promise((resolve) => setTimeout(resolve, 20));
    return {
      ok: true,
      text: async () => JSON.stringify(payload),
    };
  };

  try {
    const p1 = api.warmBookingBackend();
    const p2 = api.warmBookingBackend();
    assert.ok(p1);
    assert.equal(p1, p2);
    await p1;
    assert.equal(fetchCalls, 2);
    assert.equal(
      [...urls].some((u) => u.includes("READ_WARM") && u.includes("getAvailability")),
      true,
    );
    assert.equal(
      [...urls].some((u) => u.includes("WRITE_WARM") && u.includes("action=warmup")),
      true,
    );
  } finally {
    globalThis.fetch = originalFetch;
    configModule.CONFIG.bookingScriptUrl = originalWrite;
    configModule.CONFIG.bookingReadScriptUrl = originalRead;
  }
});
