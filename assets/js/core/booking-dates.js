/** @param {number} n */
function pad2(n) {
  return String(n).padStart(2, "0");
}

/**
 * Normalizes sheet/API date strings to YYYY-MM-DD (local) or "".
 * @param {unknown} raw
 * @returns {string}
 */
export function normalizeDateKey(raw) {
  const s = String(raw ?? "").trim();
  if (!s) {
    return "";
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    return s.slice(0, 10);
  }
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * @param {number} year
 * @param {number} monthIndex 0–11
 * @param {number} day 1–31
 */
export function dateKeyFromParts(year, monthIndex, day) {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

/** Today YYYY-MM-DD in local time. */
export function todayDateKey() {
  const d = new Date();
  return dateKeyFromParts(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * @param {string} a YYYY-MM-DD
 * @param {string} b YYYY-MM-DD
 */
export function compareDateKeys(a, b) {
  return a.localeCompare(b);
}

/**
 * Display time only for slot chips (no label column).
 * @param {unknown} raw
 * @param {string} locale e.g. en-GB, sk-SK
 */
export function formatSlotTimeOnly(raw, locale) {
  const s = String(raw ?? "").trim();
  if (!s) {
    return "—";
  }
  const hm = s.match(/(\d{1,2}):(\d{2})/);
  if (hm) {
    const h = Number(hm[1]);
    const min = hm[2];
    return `${String(h).padStart(2, "0")}:${min}`;
  }
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  return s;
}

/**
 * Sort slots by time string for stable order within a day.
 * @param {Array<{ time?: string }>} list
 */
export function sortSlotsByTime(list) {
  return [...list].sort((a, b) => String(a.time || "").localeCompare(String(b.time || "")));
}
