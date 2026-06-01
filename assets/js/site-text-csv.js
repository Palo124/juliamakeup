/**
 * Builds CSV fetch URLs for site texts. Per-tab full URLs win; otherwise uses
 * **Publish to the web → Entire document** id + per-tab `gid`.
 *
 * Published link looks like `…/spreadsheets/d/e/2PACX-…/pubhtml` — use the id segment
 * (between `/d/e/` and `/pub…`) as `contentPublishedSpreadsheetId`, and each tab’s
 * `gid` from the editor URL (`…#gid=123456789`).
 *
 * @param {{ contentCsvUrls?: { en?: string; sk?: string }; contentPublishedSpreadsheetId?: string; contentSheetGids?: { en?: string; sk?: string } }} config
 * @returns {{ en: string; sk: string }}
 */
export function resolveSiteTextCsvUrls(config) {
  const manual = config.contentCsvUrls || {};
  const id = String(config.contentPublishedSpreadsheetId ?? "").trim();
  const gids = config.contentSheetGids || {};

  const buildPublished = (gidRaw) => {
    const gid = String(gidRaw ?? "").trim();
    if (!id || !gid) {
      return "";
    }
    return `https://docs.google.com/spreadsheets/d/e/${id}/pub?gid=${encodeURIComponent(gid)}&single=true&output=csv`;
  };

  const en = String(manual.en ?? "").trim() || buildPublished(gids.en);
  const sk = String(manual.sk ?? "").trim() || buildPublished(gids.sk);

  return { en, sk };
}

/**
 * Parse CSV (RFC 4180-style) into rows of string fields. Handles quoted fields and commas.
 * @param {string} text
 * @returns {string[][]}
 */
export function parseCsv(text) {
  const s = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows = [];
  let row = [];
  let field = "";
  let i = 0;
  let inQuotes = false;

  while (i < s.length) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\r") {
      i++;
      continue;
    }
    if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += c;
    i++;
  }
  row.push(field);
  if (row.length > 1 || (row.length === 1 && row[0] !== "")) {
    rows.push(row);
  }
  return rows;
}

/**
 * First row = header; columns A=key, B=text (column C `imageUrl` on SK is used by {@link siteImgUrlsFromSkCsvRows}).
 * @param {string[][]} rows
 * @returns {Record<string, string>}
 */
export function csvRowsToStringMap(rows) {
  if (!rows.length) {
    return {};
  }
  /** @type {Record<string, string>} */
  const out = {};
  for (let r = 1; r < rows.length; r++) {
    const key = String(rows[r][0] ?? "").trim();
    if (!key || key.startsWith("#")) {
      continue;
    }
    const raw = rows[r][1];
    out[key] = raw === null || raw === undefined ? "" : String(raw);
  }
  return out;
}

/**
 * Optional column C = image URL per row key (SK sheet). Ignores empty / comment keys like {@link csvRowsToStringMap}.
 * @param {string[][]} rows
 * @returns {Record<string, string>}
 */
export function csvRowsToImageUrlsByRowKey(rows) {
  if (!rows.length) {
    return {};
  }
  /** @type {Record<string, string>} */
  const out = {};
  for (let r = 1; r < rows.length; r++) {
    const key = String(rows[r][0] ?? "").trim();
    if (!key || key.startsWith("#")) {
      continue;
    }
    const raw = rows[r][2];
    if (raw === null || raw === undefined) {
      continue;
    }
    const url = String(raw).trim();
    if (!url) {
      continue;
    }
    out[key] = url;
  }
  return out;
}

/** SK row keys that carry the URL for a `data-site-img` key (see `index.html`). */
export const SK_CSV_ROW_KEY_TO_SITE_IMG_KEY = {
  "hero.slide1.alt": "hero.slide1",
  "hero.slide2.alt": "hero.slide2",
  "hero.slide3.alt": "hero.slide3",
  "about.photoAlt": "about.portrait",
  "portfolio.bridal.label": "portfolio.tile.bridal",
  "portfolio.soft.label": "portfolio.tile.soft",
  "portfolio.editorial.label": "portfolio.tile.editorial",
  "portfolio.evening.label": "portfolio.tile.evening",
};

const SITE_IMG_DIRECT_KEYS = new Set([
  "hero.slide1",
  "hero.slide2",
  "hero.slide3",
  "about.portrait",
  "portfolio.tile.bridal",
  "portfolio.tile.soft",
  "portfolio.tile.editorial",
  "portfolio.tile.evening",
]);

/** Row key A = alt key for modal gallery stills (`portfolio.gallery.{cat}.{1..n}`), column C = image URL. */
const PORTFOLIO_GALLERY_IMAGE_ROW_KEY_RE =
  /^portfolio\.gallery\.[a-z]+\.[1-9]\d*$/;

/**
 * Builds image URL map from SK CSV column C: `data-site-img` keys (aliases + direct), plus `portfolio.gallery.*.<n>` row keys for the modal.
 * @param {string[][]} rows
 * @returns {Record<string, string>}
 */
export function siteImgUrlsFromSkCsvRows(rows) {
  const urlByRowKey = csvRowsToImageUrlsByRowKey(rows);
  /** @type {Record<string, string>} */
  const out = {};
  for (const [rowKey, url] of Object.entries(urlByRowKey)) {
    const mapped = SK_CSV_ROW_KEY_TO_SITE_IMG_KEY[rowKey];
    if (mapped) {
      out[mapped] = url;
    }
  }
  for (const [rowKey, url] of Object.entries(urlByRowKey)) {
    if (SITE_IMG_DIRECT_KEYS.has(rowKey)) {
      out[rowKey] = url;
    }
  }
  for (const [rowKey, url] of Object.entries(urlByRowKey)) {
    if (PORTFOLIO_GALLERY_IMAGE_ROW_KEY_RE.test(rowKey)) {
      out[rowKey] = url;
    }
  }
  return out;
}

/**
 * Fetches a published site-text CSV tab.
 * @param {string} url
 * @returns {Promise<string>}
 */
export async function fetchSiteTextCsv(url) {
  const trimmed = String(url ?? "").trim();
  if (!trimmed) {
    throw new Error("Empty CSV URL");
  }

  const res = await fetch(trimmed, {
    method: "GET",
    redirect: "follow",
    credentials: "omit",
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${trimmed.slice(0, 80)}…`);
  }
  if (text.includes("<!DOCTYPE") && text.includes("html")) {
    throw new Error("Got HTML instead of CSV — check publish settings and tab gid.");
  }
  return text;
}
