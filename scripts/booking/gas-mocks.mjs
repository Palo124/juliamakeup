/**
 * Minimal Google Apps Script API mocks for loading booking `.gs` sources in Node.
 */
import crypto from "node:crypto";

const SCRIPT_TIME_ZONE = "Europe/Bratislava";

/** @param {string} tz @param {string} fmt */
function formatDateInTimeZone(date, tz, fmt) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  if (fmt === "yyyy-MM-dd") {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  }
  if (fmt === "HH:mm") {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
  }
  if (fmt === "yyyy-MM-dd HH:mm") {
    return `${formatDateInTimeZone(d, tz, "yyyy-MM-dd")} ${formatDateInTimeZone(d, tz, "HH:mm")}`;
  }
  return String(d);
}

/** @param {string} text @param {string} tz @param {string} fmt */
function parseDateInTimeZone(text, tz, fmt) {
  if (fmt !== "yyyy-MM-dd HH:mm") {
    throw new Error(`Unsupported parse format: ${fmt}`);
  }
  const m = String(text).match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);
  if (!m) {
    throw new Error(`Invalid date text: ${text}`);
  }
  const [, y, mo, d, h, mi] = m;
  const utcGuess = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi));
  const offsetMs = getTimeZoneOffsetMs(new Date(utcGuess), tz);
  return new Date(utcGuess - offsetMs);
}

/** @param {Date} date @param {string} timeZone */
function getTimeZoneOffsetMs(date, timeZone) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(
    dtf.formatToParts(date).filter((p) => p.type !== "literal").map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return asUtc - date.getTime();
}

/**
 * @param {string} name
 * @param {string[]} headers
 * @param {unknown[][]} bodyRows
 */
export function createMockSheet(name, headers, bodyRows = []) {
  /** @type {unknown[][]} */
  const data = [headers.slice()];

  for (const row of bodyRows) {
    const next = headers.map((_, i) => (row[i] !== undefined && row[i] !== null ? row[i] : ""));
    data.push(next);
  }

  return {
    getName() {
      return name;
    },
    getLastRow() {
      return data.length;
    },
    getLastColumn() {
      return headers.length;
    },
    getDataRange() {
      return {
        getValues() {
          return data.map((row) => row.slice());
        },
      };
    },
    getRange(row, col, numRows, numCols) {
      if (numRows === undefined && numCols === undefined) {
        return {
          getValue() {
            return data[row - 1]?.[col - 1] ?? "";
          },
          setValue(value) {
            if (!data[row - 1]) {
              data[row - 1] = [];
            }
            data[row - 1][col - 1] = value;
          },
        };
      }
      const rows = numRows ?? 1;
      const cols = numCols ?? 1;
      return {
        getValues() {
          const out = [];
          for (let r = row - 1; r < row - 1 + rows; r += 1) {
            out.push(data[r].slice(col - 1, col - 1 + cols));
          }
          return out;
        },
        setValues(values) {
          for (let r = 0; r < values.length; r += 1) {
            for (let c = 0; c < values[r].length; c += 1) {
              if (!data[row - 1 + r]) {
                data[row - 1 + r] = [];
              }
              data[row - 1 + r][col - 1 + c] = values[r][c];
            }
          }
        },
        setValue(value) {
          if (!data[row - 1]) {
            data[row - 1] = [];
          }
          data[row - 1][col - 1] = value;
        },
      };
    },
    clear() {
      data.length = 0;
    },
    clearContents() {
      data.splice(1);
    },
    appendRow(row) {
      data.push(row.slice());
    },
    deleteRow(rowIndex) {
      data.splice(rowIndex - 1, 1);
    },
    /** @returns {unknown[][]} */
    _data() {
      return data;
    },
  };
}

/** @param {ReturnType<typeof createMockSheet>[]} sheets */
export function createMockSpreadsheet(sheets) {
  /** @type {Map<string, ReturnType<typeof createMockSheet>>} */
  const byName = new Map(sheets.map((sheet) => [sheet.getName(), sheet]));

  return {
    getSheetByName(name) {
      return byName.get(name) ?? null;
    },
    insertSheet(name) {
      const sheet = createMockSheet(name, []);
      byName.set(name, sheet);
      return sheet;
    },
    getName() {
      return "MockSpreadsheet";
    },
  };
}

/** @param {Record<string, string>} [initial] */
export function createScriptProperties(initial = {}) {
  /** @type {Record<string, string>} */
  const store = { ...initial };

  return {
    getProperty(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setProperty(key, value) {
      store[key] = String(value);
    },
    deleteProperty(key) {
      delete store[key];
    },
    getProperties() {
      return { ...store };
    },
    /** @returns {Record<string, string>} */
    _store() {
      return store;
    },
  };
}

export function createScriptCache() {
  /** @type {Map<string, { value: string, expiresAt: number }>} */
  const store = new Map();

  return {
    get(key) {
      const entry = store.get(key);
      if (!entry) {
        return null;
      }
      if (entry.expiresAt <= Date.now()) {
        store.delete(key);
        return null;
      }
      return entry.value;
    },
    put(key, value, ttlSec) {
      store.set(key, {
        value: String(value),
        expiresAt: Date.now() + Number(ttlSec) * 1000,
      });
    },
    remove(key) {
      store.delete(key);
    },
    /** @returns {Map<string, { value: string, expiresAt: number }>} */
    _store() {
      return store;
    },
  };
}

/** @param {{ spreadsheet?: ReturnType<typeof createMockSpreadsheet>, scriptProperties?: Record<string, string> }} [options] */
export function createGasSandbox(options = {}) {
  const scriptProps = createScriptProperties(options.scriptProperties ?? {});
  const scriptCache = createScriptCache();
  const spreadsheet = options.spreadsheet ?? createMockSpreadsheet([]);

  /** @type {{ acquired: boolean, waitLock: (ms: number) => void, releaseLock: () => void }} */
  const lock = {
    acquired: false,
    waitLock() {
      this.acquired = true;
    },
    releaseLock() {
      this.acquired = false;
    },
  };

  /** @type {Array<{ url: string, options?: Record<string, unknown> }>} */
  const urlFetchCalls = [];

  return {
    spreadsheet,
    scriptProps,
    scriptCache,
    lock,
    urlFetchCalls,
    SpreadsheetApp: {
      openById() {
        return spreadsheet;
      },
      getActiveSpreadsheet() {
        return spreadsheet;
      },
    },
    PropertiesService: {
      getScriptProperties() {
        return scriptProps;
      },
    },
    CacheService: {
      getScriptCache() {
        return scriptCache;
      },
    },
    LockService: {
      getScriptLock() {
        return lock;
      },
    },
    Session: {
      getScriptTimeZone() {
        return SCRIPT_TIME_ZONE;
      },
      getActiveUser() {
        return {
          getEmail() {
            return "test@example.com";
          },
        };
      },
    },
    Utilities: {
      formatDate(date, tz, fmt) {
        return formatDateInTimeZone(date, tz, fmt);
      },
      parseDate(text, tz, fmt) {
        return parseDateInTimeZone(text, tz, fmt);
      },
      getUuid() {
        return crypto.randomUUID();
      },
    },
    ContentService: {
      MimeType: {
        JSON: "application/json",
      },
      createTextOutput(text) {
        return {
          _text: String(text),
          setMimeType(mime) {
            this._mime = mime;
            return this;
          },
        };
      },
    },
    HtmlService: {
      createHtmlOutput(html) {
        return {
          _html: String(html),
          setTitle(title) {
            this._title = title;
            return this;
          },
        };
      },
      createTemplateFromFile() {
        return {
          evaluate() {
            return { getContent: () => "<html></html>" };
          },
        };
      },
    },
    ScriptApp: {
      getService() {
        return {
          getUrl() {
            return "https://script.google.com/macros/s/TEST_DEPLOY/exec";
          },
        };
      },
      getProjectTriggers() {
        return [];
      },
      deleteTrigger() {},
      newTrigger() {
        return {
          timeBased() {
            return this;
          },
          everyMinutes() {
            return this;
          },
          create() {},
        };
      },
    },
    UrlFetchApp: {
      fetch(url, options) {
        urlFetchCalls.push({ url: String(url), options: options || {} });
        return {
          getResponseCode() {
            return 200;
          },
          getContentText() {
            return '{"ok":true}';
          },
        };
      },
    },
    console,
    Logger: {
      log(...args) {
        console.log(...args);
      },
    },
  };
}

/** @param {ReturnType<typeof createGasSandbox>} sandbox @param {string} output */
export function readJsonOutput(output) {
  return JSON.parse(output._text);
}
