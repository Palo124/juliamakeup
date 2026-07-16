/**
 * Unit tests for booking Apps Script logic (runs locally with GAS mocks).
 * Usage: npm run test:booking
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  createGasSandbox,
  createMockSheet,
  createMockSpreadsheet,
  readJsonOutput,
} from "./booking/gas-mocks.mjs";
import {
  BOOKING_DIR,
  BOOKING_READ_DIR,
  READ_MODULE_FILES,
  WRITE_MODULE_FILES,
  loadReadModules,
  loadWriteModules,
} from "./booking/load-script.mjs";
import fs from "node:fs";
import path from "node:path";

/** @typedef {Record<string, unknown> & {
 *   computeAvailabilityPayload_: () => { ok: boolean, slots?: Array<Record<string, unknown>> },
 *   handleGetAvailability_: () => { _text: string },
 *   readBookingAvailabilityCache_: () => unknown,
 *   writeBookingAvailabilityCache_: (payload: unknown) => void,
 *   invalidateBookingAvailabilityCache_: () => void,
 *   runBookingAvailabilityPrewarm_: () => { cacheHit: boolean, slotCount: number, ms: number },
 *   doGet: (e: { parameter?: Record<string, string> }) => { _text: string },
 *   doPost: (e: { postData?: { contents?: string } }) => { _text: string },
 *   normalizeWebAppBaseUrl_: (raw: string) => string,
 *   buildWebAppActionUrl_: (action: string, params: Record<string, string>) => string,
 *   formatSheetDate_: (v: unknown) => string,
 *   formatSheetTime_: (v: unknown) => string,
 *   parseAppointmentStartMs_: (dateStr: string, timeStr: string) => number,
 *   intervalsOverlapMs_: (a: number, b: number, c: number, d: number) => boolean,
 *   serviceIntervalFree_: (...args: unknown[]) => boolean,
 *   isValidEmail_: (email: string) => boolean,
 *   escapeHtml_: (value: unknown) => string,
 *   resCol0_: (name: string) => number,
 *   buildReservationRowFromMap_: (map: Record<string, unknown>) => unknown[],
 *   BOOKING_AVAIL_CACHE_KEY: string,
 * }} BookingCtx */

/** @param {unknown} value */
function jsonEqual(actual, expected, message) {
  assert.equal(JSON.stringify(actual), JSON.stringify(expected), message);
}

/** @param {Record<string, unknown>} [options] */
function loadWriteCtx(options = {}) {
  const sandbox = createGasSandbox(options);
  return {
    ctx: /** @type {BookingCtx} */ (loadWriteModules(sandbox)),
    sandbox,
  };
}

/** @param {Record<string, unknown>} [options] */
function loadReadCtx(options = {}) {
  const sandbox = createGasSandbox(options);
  return /** @type {{ ctx: BookingCtx, sandbox: ReturnType<typeof createGasSandbox> }} */ ({
    ctx: loadReadModules(sandbox),
    sandbox,
  });
}

/** @param {Record<string, unknown>} [options] */
function loadCtx(options = {}) {
  return loadWriteCtx(options).ctx;
}

test("write + read source files exist", () => {
  for (const file of WRITE_MODULE_FILES) {
    assert.ok(fs.existsSync(path.join(BOOKING_DIR, file)), `missing write ${file}`);
  }
  for (const file of READ_MODULE_FILES) {
    assert.ok(fs.existsSync(path.join(BOOKING_READ_DIR, file)), `missing read ${file}`);
  }
  assert.ok(fs.existsSync(path.join(BOOKING_READ_DIR, "81_ReadMaintenance.gs")));
  assert.ok(fs.existsSync(path.join(BOOKING_READ_DIR, "appsscript.json")));
});

test("normalizeWebAppBaseUrl_ rewrites legacy macros URL", () => {
  const ctx = loadCtx();
  const input = "https://script.google.com/macros/s/AKfycbzTEST/exec?foo=1";
  assert.equal(
    ctx.normalizeWebAppBaseUrl_(input),
    "https://script.google.com/a/*/macros/s/AKfycbzTEST/exec",
  );
});

test("buildWebAppActionUrl_ builds verify link", () => {
  const ctx = loadCtx({
    scriptProperties: {
      WEB_APP_URL: "https://script.google.com/macros/s/AKfycbzTEST/exec",
    },
  });
  const url = ctx.buildWebAppActionUrl_("verifyEmail", { token: "abc-123" });
  assert.match(url, /^https:\/\/script\.google\.com\/a\/\*\/macros\/s\/AKfycbzTEST\/exec\?/);
  assert.match(url, /action=verifyEmail/);
  assert.match(url, /token=abc-123/);
});

test("buildWebAppActionUrl_ prefers PUBLIC_SITE_URL action page", () => {
  const ctx = loadCtx({
    scriptProperties: {
      WEB_APP_URL: "https://script.google.com/macros/s/AKfycbzTEST/exec",
      PUBLIC_SITE_URL: "https://julierebeauty.com/",
    },
  });
  const sk = ctx.buildWebAppActionUrl_("verifyEmail", { token: "abc-123" }, "sk");
  const en = ctx.buildWebAppActionUrl_("verifyEmail", { token: "abc-123" }, "en");
  assert.equal(sk, "https://julierebeauty.com/action.html?action=verifyEmail&token=abc-123");
  assert.equal(en, "https://julierebeauty.com/en/action.html?action=verifyEmail&token=abc-123");
});

test("redirectOrHtml_ returns JSON when format=json", () => {
  const ctx = loadCtx();
  ctx.BOOKING_ACTION_FORMAT_JSON_ = true;
  const out = ctx.redirectOrHtml_(
    "Potvrdené",
    "<h1>Rezervácia potvrdená</h1><p>Zákazník bol informovaný.</p>",
    "bookingResult=confirmed",
  );
  const data = readJsonOutput(out);
  assert.equal(data.ok, true);
  assert.equal(data.bookingResult, "confirmed");
  assert.equal(data.bookingCode, "");
  assert.match(String(data.message || ""), /Rezervácia potvrdená/);
});

test("formatSheetDate_ and formatSheetTime_ normalize Date cells", () => {
  const ctx = loadCtx();
  assert.equal(ctx.formatSheetDate_("2026-08-15"), "2026-08-15");
  assert.equal(ctx.formatSheetTime_("10:30"), "10:30");
});

test("intervalsOverlapMs_ detects half-open overlap", () => {
  const ctx = loadCtx();
  assert.equal(ctx.intervalsOverlapMs_(100, 200, 150, 250), true);
  assert.equal(ctx.intervalsOverlapMs_(100, 200, 200, 300), false);
  assert.equal(ctx.intervalsOverlapMs_(100, 200, 50, 100), false);
});

test("isValidEmail_ rejects obvious invalid addresses", () => {
  const ctx = loadCtx();
  assert.equal(ctx.isValidEmail_("client@example.com"), true);
  assert.equal(ctx.isValidEmail_("bad@"), false);
  assert.equal(ctx.isValidEmail_(""), false);
});

test("escapeHtml_ escapes attribute-sensitive characters", () => {
  const ctx = loadCtx();
  assert.equal(ctx.escapeHtml_(`Tom & "Jerry" <script>`), "Tom &amp; &quot;Jerry&quot; &lt;script&gt;");
});

test("resCol0_ and buildReservationRowFromMap_ stay aligned", () => {
  const ctx = loadCtx();
  assert.equal(ctx.resCol0_("Email"), 14);
  const row = ctx.buildReservationRowFromMap_({
    ReservationId: "r1",
    Email: "a@b.c",
    Status: "PENDING_EMAIL",
  });
  assert.equal(row[ctx.resCol0_("ReservationId")], "r1");
  assert.equal(row[ctx.resCol0_("Email")], "a@b.c");
  assert.equal(row[ctx.resCol0_("Status")], "PENDING_EMAIL");
  assert.equal(row[ctx.resCol0_("Calendar Event Id")], "");
});

test("computeAvailabilityPayload_ returns empty slots when Availability is missing", () => {
  const spreadsheet = createMockSpreadsheet([]);
  const ctx = loadCtx({ spreadsheet });
  const payload = ctx.computeAvailabilityPayload_();
  assert.equal(payload.ok, true);
  jsonEqual(payload.slots, []);
});

test("computeAvailabilityPayload_ returns bookable open slots", () => {
  const avail = createMockSheet("Availability", ["SlotId", "Date", "Time", "AllowedServices", "Status"], [
    ["slot-1", "2026-09-01", "10:00", "Signature Makeup", "available"],
    ["slot-2", "2026-09-01", "11:00", "*", "available"],
  ]);
  const res = createMockSheet("Reservations", [
    "ReservationId",
    "Created At",
    "Status",
    "Verification Token",
    "Verification Expires",
    "Approval Token",
    "Approval Expires",
    "Cancellation Token",
    "Cancellation Expires",
    "Cancelled At",
    "SlotId",
    "Date",
    "Time",
    "Name",
    "Email",
    "Phone",
    "Service",
    "Notes",
    "Lang",
    "Calendar Event Id",
  ]);
  const spreadsheet = createMockSpreadsheet([avail, res]);
  const ctx = loadCtx({ spreadsheet });

  const payload = ctx.computeAvailabilityPayload_();
  assert.equal(payload.ok, true);
  assert.equal(payload.slots?.length, 2);

  const slot1 = payload.slots?.find((s) => s.slotId === "slot-1");
  assert.ok(slot1);
  assert.equal(slot1.date, "2026-09-01");
  assert.equal(slot1.time, "10:00");
  jsonEqual(slot1.allowedServices, ["Signature Makeup"]);

  const slot2 = payload.slots?.find((s) => s.slotId === "slot-2");
  assert.ok(slot2);
  assert.ok(Array.isArray(slot2.allowedServices));
  assert.ok((slot2.allowedServices?.length ?? 0) > 1);
});

test("computeAvailabilityPayload_ excludes booked rows and blocking reservations", () => {
  const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const yyyy = future.getFullYear();
  const mm = String(future.getMonth() + 1).padStart(2, "0");
  const dd = String(future.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const avail = createMockSheet("Availability", ["SlotId", "Date", "Time", "AllowedServices", "Status"], [
    ["slot-open", dateStr, "10:00", "Signature Makeup", "available"],
    ["slot-booked-flag", dateStr, "11:00", "Signature Makeup", "booked"],
    ["slot-blocked", dateStr, "12:00", "Signature Makeup", "available"],
  ]);
  const res = createMockSheet("Reservations", [
    "ReservationId",
    "Created At",
    "Status",
    "Verification Token",
    "Verification Expires",
    "Approval Token",
    "Approval Expires",
    "Cancellation Token",
    "Cancellation Expires",
    "Cancelled At",
    "SlotId",
    "Date",
    "Time",
    "Name",
    "Email",
    "Phone",
    "Service",
    "Notes",
    "Lang",
    "Calendar Event Id",
  ], [
    [
      "res-confirmed",
      new Date(),
      "CONFIRMED",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "other-slot",
      dateStr,
      "12:00",
      "Anna",
      "anna@example.com",
      "+421900000000",
      "Signature Makeup",
      "",
      "sk",
      "",
    ],
  ]);
  const spreadsheet = createMockSpreadsheet([avail, res]);
  const ctx = loadCtx({ spreadsheet });

  const payload = ctx.computeAvailabilityPayload_();
  const ids = (payload.slots ?? []).map((s) => s.slotId);
  jsonEqual(ids, ["slot-open"]);
});

test("availability cache round-trip and invalidation", () => {
  const ctx = loadCtx();
  const sample = { ok: true, slots: [{ slotId: "x", date: "2026-09-01", time: "09:00", allowedServices: ["Signature Makeup"] }] };

  assert.equal(ctx.readBookingAvailabilityCache_(), null);
  ctx.writeBookingAvailabilityCache_(sample);
  jsonEqual(ctx.readBookingAvailabilityCache_(), sample);

  ctx.invalidateBookingAvailabilityCache_();
  assert.equal(ctx.readBookingAvailabilityCache_(), null);
});

test("handleGetAvailability_ always recomputes from spreadsheet", () => {
  const spreadsheet = createMockSpreadsheet([
    createMockSheet("Availability", ["SlotId", "Date", "Time", "AllowedServices", "Status"], [
      ["slot-1", "2026-09-01", "10:00", "Signature Makeup", "available"],
    ]),
    createMockSheet("Reservations", [
      "ReservationId",
      "Created At",
      "Status",
      "Verification Token",
      "Verification Expires",
      "Approval Token",
      "Approval Expires",
      "Cancellation Token",
      "Cancellation Expires",
      "Cancelled At",
      "SlotId",
      "Date",
      "Time",
      "Name",
      "Email",
      "Phone",
      "Service",
      "Notes",
      "Lang",
      "Calendar Event Id",
    ]),
  ]);
  const ctx = loadCtx({ spreadsheet });

  // Stale cache must be ignored.
  ctx.writeBookingAvailabilityCache_({
    ok: true,
    slots: [{ slotId: "stale", date: "2026-01-01", time: "00:00", allowedServices: ["Signature Makeup"] }],
  });

  const response = readJsonOutput(ctx.handleGetAvailability_());
  assert.equal(response.ok, true);
  assert.equal(response.slots?.length, 1);
  assert.equal(response.slots?.[0]?.slotId, "slot-1");
});

test("availability cache invalidation pings read deployment", () => {
  const { ctx, sandbox } = loadWriteCtx({
    scriptProperties: {
      BOOKING_READ_SCRIPT_URL: "https://script.google.com/macros/s/READ_TEST/exec",
      BOOKING_REFRESH_SECRET: "sekret",
    },
  });

  ctx.invalidateBookingAvailabilityCache_();
  assert.equal(sandbox.urlFetchCalls.length, 1);
  assert.match(sandbox.urlFetchCalls[0].url, /action=invalidateAvailability/);
  assert.match(sandbox.urlFetchCalls[0].url, /secret=sekret/);
});

test("read doGet serves getAvailability and refreshAvailability", () => {
  const spreadsheet = createMockSpreadsheet([
    createMockSheet("Availability", ["SlotId", "Date", "Time", "AllowedServices", "Status"], [
      ["slot-1", "2026-09-01", "10:00", "Signature Makeup", "available"],
    ]),
    createMockSheet("Reservations", [
      "ReservationId",
      "Created At",
      "Status",
      "Verification Token",
      "Verification Expires",
      "Approval Token",
      "Approval Expires",
      "Cancellation Token",
      "Cancellation Expires",
      "Cancelled At",
      "SlotId",
      "Date",
      "Time",
      "Name",
      "Email",
      "Phone",
      "Service",
      "Notes",
      "Lang",
      "Calendar Event Id",
    ]),
  ]);
  const { ctx } = loadReadCtx({ spreadsheet });

  const avail = readJsonOutput(ctx.doGet({ parameter: { action: "getAvailability" } }));
  assert.equal(avail.ok, true);
  assert.ok(Array.isArray(avail.slots));

  const refresh = readJsonOutput(
    ctx.doGet({ parameter: { action: "refreshAvailability" } }),
  );
  assert.equal(refresh.ok, true);
  assert.equal(typeof refresh.slotCount, "number");

  const help = readJsonOutput(ctx.doGet({ parameter: {} }));
  assert.equal(help.ok, true);
  assert.match(String(help.message), /read API/i);
});

test("write doGet no longer serves getAvailability", () => {
  const ctx = loadCtx({
    spreadsheet: createMockSpreadsheet([
      createMockSheet("Availability", ["SlotId", "Date", "Time", "AllowedServices", "Status"]),
    ]),
  });

  const out = readJsonOutput(ctx.doGet({ parameter: { action: "getAvailability" } }));
  assert.equal(out.ok, true);
  assert.match(String(out.message), /write API/i);
  assert.equal(Array.isArray(out.slots), false);
});

test("read refreshAvailability rejects bad secret", () => {
  const { ctx } = loadReadCtx({
    scriptProperties: {
      BOOKING_REFRESH_SECRET: "expected",
    },
  });

  const out = readJsonOutput(
    ctx.doGet({ parameter: { action: "refreshAvailability", secret: "wrong" } }),
  );
  assert.equal(out.ok, false);
  assert.match(String(out.message), /forbidden/i);
});

test("read invalidateAvailability drops cache without recomputing", () => {
  const spreadsheet = createMockSpreadsheet([
    createMockSheet("Availability", ["SlotId", "Date", "Time", "AllowedServices", "Status"], [
      ["slot-1", "2026-09-01", "10:00", "Signature Makeup", "available"],
    ]),
  ]);
  const { ctx } = loadReadCtx({
    spreadsheet,
    scriptProperties: {
      BOOKING_REFRESH_SECRET: "sekret",
    },
  });

  const fresh = ctx.computeAvailabilityPayload_();
  ctx.writeBookingAvailabilityCache_(fresh);
  assert.ok(ctx.readBookingAvailabilityCache_());

  spreadsheet.getSheetByName = () => {
    throw new Error("invalidateAvailability must not recompute from spreadsheet");
  };

  const out = readJsonOutput(
    ctx.doGet({ parameter: { action: "invalidateAvailability", secret: "sekret" } }),
  );
  assert.equal(out.ok, true);
  assert.equal(out.cleared, true);
  assert.equal(ctx.readBookingAvailabilityCache_(), null);
});

test("write doGet default help message", () => {
  const ctx = loadCtx();
  const help = readJsonOutput(ctx.doGet({ parameter: {} }));
  assert.equal(help.ok, true);
  assert.match(String(help.message), /write API/i);
});

test("doPost validates JSON and required reservation fields", () => {
  const ctx = loadCtx({
    scriptProperties: {
      WEB_APP_URL: "https://script.google.com/macros/s/AKfycbzTEST/exec",
    },
  });

  const badJson = readJsonOutput(ctx.doPost({ postData: { contents: "{" } }));
  assert.equal(badJson.ok, false);
  assert.match(String(badJson.message), /invalid json/i);

  const missingFields = readJsonOutput(
    ctx.doPost({
      postData: {
        contents: JSON.stringify({
          action: "createReservation",
          reservation: { slotId: "s1" },
        }),
      },
    }),
  );
  assert.equal(missingFields.ok, false);
  assert.match(String(missingFields.message), /missing required fields/i);
});

test("doPost honeypot returns fake success", () => {
  const ctx = loadCtx();
  const out = readJsonOutput(
    ctx.doPost({
      postData: {
        contents: JSON.stringify({
          action: "createReservation",
          reservation: { website: "spam-bot", slotId: "x", name: "x", email: "x@y.z", phone: "1", service: "Signature Makeup" },
        }),
      },
    }),
  );
  assert.equal(out.ok, true);
  assert.match(String(out.message), /received/i);
});

test("runBookingAvailabilityPrewarm_ only warms runtime (no availability cache fill)", () => {
  const spreadsheet = createMockSpreadsheet([
    createMockSheet("Availability", ["SlotId", "Date", "Time", "AllowedServices", "Status"], [
      ["slot-1", "2026-09-01", "10:00", "Signature Makeup", "available"],
    ]),
  ]);
  const { ctx } = loadReadCtx({ spreadsheet });

  const result = ctx.runBookingAvailabilityPrewarm_();
  assert.equal(result.cacheHit, false);
  assert.equal(result.slotCount, 0);
  assert.equal(ctx.readBookingAvailabilityCache_(), null);
});

test("refreshBookingAvailabilityCache_ writes cache key used by readers", () => {
  const spreadsheet = createMockSpreadsheet([
    createMockSheet("Availability", ["SlotId", "Date", "Time", "AllowedServices", "Status"], [
      ["slot-1", "2026-10-01", "09:00", "Signature Makeup", "available"],
    ]),
    createMockSheet("Reservations", [
      "ReservationId",
      "Created At",
      "Status",
      "Verification Token",
      "Verification Expires",
      "Approval Token",
      "Approval Expires",
      "Cancellation Token",
      "Cancellation Expires",
      "Cancelled At",
      "SlotId",
      "Date",
      "Time",
      "Name",
      "Email",
      "Phone",
      "Service",
      "Notes",
      "Lang",
      "Calendar Event Id",
    ]),
  ]);
  const { ctx, sandbox } = loadWriteCtx({ spreadsheet });

  const payload = ctx.refreshBookingAvailabilityCache_();
  assert.equal(payload.ok, true);
  assert.equal(sandbox.scriptCache.get(ctx.BOOKING_AVAIL_CACHE_KEY)?.length > 0, true);
  jsonEqual(ctx.readBookingAvailabilityCache_(), payload);
});
