/**
 * Writes CSV seed files for the Site Texts spreadsheet (tabs ENG + SK).
 * Usage: npm run export:site-texts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BUNDLED_STRINGS } from "../assets/js/i18n.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "google-apps-script", "site-texts");

/** Single-line cell text (newlines → space) for stable one-row-per-key CSV. */
function normalizeCell(value) {
  return String(value)
    .replace(/\r\n/g, "\n")
    .replace(/\n/g, " ")
    .replace(/\r/g, " ");
}

function csvEscape(value) {
  const s = String(value);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function csvRow(fields) {
  return fields.map(csvEscape).join(",");
}

/** Third column `imageUrl` is for the SK tab (site reads URLs from SK only); ENG keeps C empty in seeds. */
function buildCsv(lang) {
  const lines = [csvRow(["key", "text", "imageUrl"])];
  for (const [k, v] of Object.entries(BUNDLED_STRINGS[lang])) {
    lines.push(csvRow([normalizeCell(k), normalizeCell(v), ""]));
  }
  return `${lines.join("\n")}\n`;
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "seed-ENG.csv"), buildCsv("en"), "utf8");
fs.writeFileSync(path.join(outDir, "seed-SK.csv"), buildCsv("sk"), "utf8");

const imgPath = path.join(outDir, "seed-IMG.csv");
if (fs.existsSync(imgPath)) {
  fs.unlinkSync(imgPath);
}

for (const name of ["seed-ENG.tsv", "seed-SK.tsv", "seed-IMG.tsv"]) {
  const p = path.join(outDir, name);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
  }
}

console.log("Wrote:");
console.log(" ", path.join(outDir, "seed-ENG.csv"));
console.log(" ", path.join(outDir, "seed-SK.csv"));
