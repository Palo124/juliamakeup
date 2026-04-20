/**
 * Fetches CSV URLs from config (contentPublishedSpreadsheetId + gids, or contentCsvUrls) and parses rows.
 * Usage: npm run test:site-texts
 *     or node scripts/test-site-text-csv.mjs
 *     or node scripts/test-site-text-csv.mjs "https://…csv…" "https://…csv…" ["https://…img…"]
 */
import { CONFIG } from "../assets/js/config.js";
import { csvRowsToStringMap, parseCsv, resolveSiteTextCsvUrls } from "../assets/js/site-text-csv.js";

const argv = process.argv.slice(2);
let enUrl = argv[0];
let skUrl = argv[1];
let imgUrl = argv[2];

if (!enUrl) {
  const resolved = resolveSiteTextCsvUrls(CONFIG);
  enUrl = resolved.en;
  skUrl = resolved.sk;
  imgUrl = resolved.img;
}

if (!enUrl || !skUrl) {
  console.error(
    "Set contentPublishedSpreadsheetId + contentSheetGids (en, sk), or contentCsvUrls, in assets/js/config.js — or pass two CSV URLs (EN, SK) as arguments.",
  );
  process.exit(1);
}

const headers = {
  Accept: "text/csv,text/plain,*/*",
  "User-Agent": "juliamakeup-site-texts-test/1.0",
};

async function fetchCsv(url) {
  const res = await fetch(url, { method: "GET", redirect: "follow", headers });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  if (text.includes("<!DOCTYPE") && text.includes("html")) {
    throw new Error("Got HTML instead of CSV — check sharing / publish settings and URL.");
  }
  return text;
}

try {
  const [enText, skText] = await Promise.all([fetchCsv(enUrl), fetchCsv(skUrl)]);
  const enMap = csvRowsToStringMap(parseCsv(enText));
  const skMap = csvRowsToStringMap(parseCsv(skText));
  let imgKeys = 0;
  if (imgUrl) {
    const imgText = await fetchCsv(imgUrl);
    imgKeys = Object.keys(csvRowsToStringMap(parseCsv(imgText))).length;
  }
  console.log(
    JSON.stringify(
      {
        ok: true,
        enKeys: Object.keys(enMap).length,
        skKeys: Object.keys(skMap).length,
        imgKeys,
      },
      null,
      2,
    ),
  );
} catch (e) {
  console.error(String(e && e.message ? e.message : e));
  process.exit(1);
}
