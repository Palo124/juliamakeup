/**
 * Loads booking Apps Script sources into a sandbox for Node tests.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const BOOKING_DIR = path.resolve(__dirname, "../../backend/apps-script-booking");
export const BOOKING_READ_DIR = path.resolve(__dirname, "../../backend/apps-script-booking-read");

export const SHARED_MODULE_FILES = [
  "00_SchemaUrlsAndConfig.gs",
  "20_SpreadsheetAndTimeUtils.gs",
  "25_HttpResponses.gs",
  "28_AvailabilityCache.gs",
  "30_SheetsReservationIO.gs",
  "35_BookingServiceTypes.gs",
  "40_BookingHandlers.gs",
];

/** Write deployment — POST + token actions. */
export const WRITE_MODULE_FILES = [...SHARED_MODULE_FILES, "62_EmailI18n.gs", "10_WebEntry.gs"];

/** Read deployment — GET availability only (entry + maintenance are read-local). */
export const READ_MODULE_FILES = [...SHARED_MODULE_FILES, "10_WebEntry.gs"];

/** @deprecated use WRITE_MODULE_FILES */
export const AVAILABILITY_MODULE_FILES = WRITE_MODULE_FILES;

/** @param {string[]} relativeFiles @param {Record<string, unknown>} sandbox @param {string} [baseDir] */
export function loadBookingScript(relativeFiles, sandbox, baseDir = BOOKING_DIR) {
  const context = vm.createContext(sandbox);

  for (const relativeFile of relativeFiles) {
    const absolutePath = path.join(baseDir, relativeFile);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Missing booking source file: ${absolutePath}`);
    }
    const source = fs.readFileSync(absolutePath, "utf8");
    vm.runInContext(source, context, { filename: absolutePath });
  }

  return sandbox;
}

/** @param {Record<string, unknown>} sandbox */
export function loadWriteModules(sandbox) {
  return loadBookingScript(WRITE_MODULE_FILES, sandbox, BOOKING_DIR);
}

/** @param {Record<string, unknown>} sandbox */
export function loadReadModules(sandbox) {
  return loadBookingScript(READ_MODULE_FILES, sandbox, BOOKING_READ_DIR);
}

/** @param {Record<string, unknown>} sandbox */
export function loadAvailabilityModules(sandbox) {
  return loadWriteModules(sandbox);
}
