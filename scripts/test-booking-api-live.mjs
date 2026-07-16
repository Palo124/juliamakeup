/**
 * Live smoke tests against deployed booking web apps (read + write).
 * Usage: npm run test:booking:live
 */
import assert from "node:assert/strict";
import test from "node:test";
import { CONFIG } from "../assets/js/config.js";

const WRITE_URL = (process.env.BOOKING_SCRIPT_URL || CONFIG.bookingScriptUrl || "").trim();
const READ_URL = (
  process.env.BOOKING_READ_SCRIPT_URL ||
  CONFIG.bookingReadScriptUrl?.trim() ||
  WRITE_URL
).trim();
const WRITE_ENABLED = Boolean(WRITE_URL);
const READ_ENABLED = Boolean(READ_URL);

/** @param {string} base @param {string} [query] */
function apiUrl(base, query = "") {
  const u = new URL(base);
  if (query.startsWith("?")) {
    const params = new URLSearchParams(query.slice(1));
    for (const [key, value] of params) {
      u.searchParams.set(key, value);
    }
  }
  return u.toString();
}

/** @param {Response} response */
async function readJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response (${response.status}): ${text.slice(0, 300)}`);
  }
}

test("write booking API configured", { skip: !WRITE_ENABLED }, () => {
  assert.match(WRITE_URL, /^https:\/\//);
  assert.match(WRITE_URL, /\/exec$/);
});

test("read booking API configured", { skip: !READ_ENABLED }, () => {
  assert.match(READ_URL, /^https:\/\//);
  assert.match(READ_URL, /\/exec$/);
});

test("GET getAvailability on read returns ok + slots array", { skip: !READ_ENABLED, timeout: 45000 }, async () => {
  const started = Date.now();
  const response = await fetch(apiUrl(READ_URL, "?action=getAvailability"), {
    method: "GET",
    redirect: "follow",
    headers: { Accept: "application/json" },
  });
  const elapsedMs = Date.now() - started;

  assert.equal(response.ok, true, `HTTP ${response.status}`);
  const data = await readJson(response);
  assert.equal(data.ok, true);
  assert.ok(Array.isArray(data.slots), "slots must be an array");

  console.log(JSON.stringify({ target: "read", ok: true, slotCount: data.slots.length, elapsedMs }, null, 2));
});

test("GET getAvailability on write is not served", { skip: !WRITE_ENABLED, timeout: 45000 }, async () => {
  const response = await fetch(apiUrl(WRITE_URL, "?action=getAvailability"), {
    method: "GET",
    redirect: "follow",
    headers: { Accept: "application/json" },
  });
  assert.equal(response.ok, true);
  const data = await readJson(response);
  assert.equal(data.ok, true);
  assert.equal(Array.isArray(data.slots), false);
  assert.match(String(data.message), /write API/i);
});

test("GET write default route returns API help JSON", { skip: !WRITE_ENABLED, timeout: 45000 }, async () => {
  const response = await fetch(WRITE_URL, {
    method: "GET",
    redirect: "follow",
    headers: { Accept: "application/json" },
  });
  assert.equal(response.ok, true);
  const data = await readJson(response);
  assert.equal(data.ok, true);
  assert.match(String(data.message), /write API/i);
});

test("POST invalid JSON is rejected on write", { skip: !WRITE_ENABLED, timeout: 45000 }, async () => {
  const response = await fetch(WRITE_URL, {
    method: "POST",
    redirect: "follow",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
      Accept: "application/json",
    },
    body: "{",
  });
  assert.equal(response.ok, true);
  const data = await readJson(response);
  assert.equal(data.ok, false);
  assert.match(String(data.message), /invalid json/i);
});

test("POST createReservation validates required fields on write", { skip: !WRITE_ENABLED, timeout: 45000 }, async () => {
  const response = await fetch(WRITE_URL, {
    method: "POST",
    redirect: "follow",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
      Accept: "application/json",
    },
    body: JSON.stringify({
      action: "createReservation",
      reservation: { slotId: "nonexistent-slot-id" },
    }),
  });
  assert.equal(response.ok, true);
  const data = await readJson(response);
  assert.equal(data.ok, false);
  assert.match(String(data.message), /missing required fields/i);
});

if (!WRITE_ENABLED) {
  console.log("Skipping live write tests — set BOOKING_SCRIPT_URL or CONFIG.bookingScriptUrl.");
}

if (!READ_ENABLED) {
  console.log("Skipping live read tests — set BOOKING_READ_SCRIPT_URL or CONFIG.bookingReadScriptUrl.");
}
