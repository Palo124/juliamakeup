/**
 * Builds CSV fetch URLs for site texts. Per-tab full URLs win; otherwise uses
 * **Publish to the web → Entire document** id + per-tab `gid`.
 *
 * Published link looks like `…/spreadsheets/d/e/2PACX-…/pubhtml` — use the id segment
 * (between `/d/e/` and `/pub…`) as `contentPublishedSpreadsheetId`, and each tab’s
 * `gid` from the editor URL (`…#gid=123456789`).
 *
 * @param {{ contentCsvUrls?: { en?: string; sk?: string; img?: string }; contentPublishedSpreadsheetId?: string; contentSheetGids?: { en?: string; sk?: string; img?: string } }} config
 * @returns {{ en: string; sk: string; img: string }}
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
  const img = String(manual.img ?? "").trim() || buildPublished(gids.img);

  return { en, sk, img };
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
 * First row = header; columns A=key, B=text (optional C+ ignored).
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
