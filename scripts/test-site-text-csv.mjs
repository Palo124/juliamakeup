/**
 * Fetches CSV URLs from config (contentPublishedSpreadsheetId + gids, or contentCsvUrls) and parses rows.
 * Usage: npm run test:site-texts
 *     or node scripts/test-site-text-csv.mjs
 *     or node scripts/test-site-text-csv.mjs [SK_CSV_URL] [EN_CSV_URL]
 */
import { CONFIG } from "../assets/js/config.js";
import {
  csvRowsToStringMap,
  fetchSiteTextCsv,
  parseCsv,
  resolveSiteTextCsvUrls,
  siteImgUrlsFromSkCsvRows,
} from "../assets/js/site-text-csv.js";

const argv = process.argv.slice(2);
let skUrl = argv[0];
let enUrl = argv[1];

if (!skUrl) {
  const resolved = resolveSiteTextCsvUrls(CONFIG);
  skUrl = resolved.sk;
  enUrl = resolved.en;
}

if (!skUrl) {
  console.error(
    "Set contentPublishedSpreadsheetId + contentSheetGids.sk (or contentCsvUrls.sk) in assets/js/config.js — or pass SK CSV URL as first argument.",
  );
  process.exit(1);
}

try {
  const skText = await fetchSiteTextCsv(skUrl);
  const skRows = parseCsv(skText);
  const skMap = csvRowsToStringMap(skRows);
  const imgKeys = Object.keys(siteImgUrlsFromSkCsvRows(skRows)).length;

  /** @type {Record<string, unknown>} */
  const report = {
    ok: true,
    skKeys: Object.keys(skMap).length,
    siteImgKeysFromSk: imgKeys,
  };

  if (enUrl) {
    try {
      const enText = await fetchSiteTextCsv(enUrl);
      report.enKeys = Object.keys(csvRowsToStringMap(parseCsv(enText))).length;
    } catch (e) {
      report.enSkipped = true;
      report.enError = String(e?.message ?? e);
    }
  } else {
    report.enSkipped = true;
  }

  console.log(JSON.stringify(report, null, 2));
} catch (e) {
  console.error(String(e?.message ?? e));
  process.exit(1);
}
