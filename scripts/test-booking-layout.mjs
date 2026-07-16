/**
 * Verifies booking repo layout and read/write sync sources stay aligned.
 * Usage: npm run test:booking:layout
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  BOOKING_DIR,
  BOOKING_READ_DIR,
  READ_MODULE_FILES,
  SHARED_MODULE_FILES,
  WRITE_MODULE_FILES,
} from "./booking/load-script.mjs";

/** Must match scripts/sync-booking-read.sh SHARED array. */
const READ_SYNC_FILES = [
  "00_SchemaUrlsAndConfig.gs",
  "20_SpreadsheetAndTimeUtils.gs",
  "25_HttpResponses.gs",
  "28_AvailabilityCache.gs",
  "30_SheetsReservationIO.gs",
  "35_BookingServiceTypes.gs",
  "40_BookingHandlers.gs",
];

const READ_LOCAL_FILES = ["10_WebEntry.gs", "81_ReadMaintenance.gs", "appsscript.json"];

const REQUIRED_WRITE_ONLY_FILES = [
  "50_VerifyEmail.gs",
  "60_Mail.gs",
  "61_EmailHtmlRender.gs",
  "65_BookingCalendar.gs",
  "70_ApproveRejectCancel.gs",
  "80_MaintenanceAndInit.gs",
  "appsscript.json",
];

test("write booking project contains required modules", () => {
  for (const file of WRITE_MODULE_FILES) {
    assert.ok(fs.existsSync(path.join(BOOKING_DIR, file)), `missing write ${file}`);
  }
  for (const file of REQUIRED_WRITE_ONLY_FILES) {
    assert.ok(fs.existsSync(path.join(BOOKING_DIR, file)), `missing write-only ${file}`);
  }
});

test("read booking project contains required modules", () => {
  for (const file of READ_MODULE_FILES) {
    assert.ok(fs.existsSync(path.join(BOOKING_READ_DIR, file)), `missing read ${file}`);
  }
  for (const file of READ_LOCAL_FILES) {
    assert.ok(fs.existsSync(path.join(BOOKING_READ_DIR, file)), `missing read-local ${file}`);
  }
});

test("read sync sources exist in write project", () => {
  for (const file of READ_SYNC_FILES) {
    assert.ok(fs.existsSync(path.join(BOOKING_DIR, file)), `missing shared source ${file}`);
  }
});

test("shared modules match between write and read trees", () => {
  for (const file of READ_SYNC_FILES) {
    const writeText = fs.readFileSync(path.join(BOOKING_DIR, file), "utf8");
    const readText = fs.readFileSync(path.join(BOOKING_READ_DIR, file), "utf8");
    assert.equal(readText, writeText, `${file} out of sync — run npm run booking:sync:read`);
  }
});

test("read appsscript uses spreadsheets scope only", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(BOOKING_READ_DIR, "appsscript.json"), "utf8"));
  assert.deepEqual(manifest.oauthScopes, [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/script.scriptapp",
  ]);
});

test("loader module lists stay aligned with sync script", () => {
  assert.deepEqual(SHARED_MODULE_FILES, READ_SYNC_FILES);
  for (const file of READ_SYNC_FILES) {
    assert.ok(READ_MODULE_FILES.includes(file), `READ_MODULE_FILES missing ${file}`);
  }
});
