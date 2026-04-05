/**
 * Writes TSV seed files for the Site Texts spreadsheet (tabs ENG + SK).
 * Usage: npm run export:site-texts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BUNDLED_STRINGS } from "../assets/js/i18n.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "google-apps-script", "site-texts");

function flattenForTsv(value) {
  return String(value)
    .replace(/\r\n/g, "\n")
    .replace(/\n/g, " ")
    .replace(/\t/g, " ");
}

function buildTsv(lang) {
  const lines = ["key\ttext"];
  for (const [k, v] of Object.entries(BUNDLED_STRINGS[lang])) {
    lines.push(`${k}\t${flattenForTsv(v)}`);
  }
  return `${lines.join("\n")}\n`;
}

const imgSeed = [
  "key\turl",
  "hero.slide1\t",
  "hero.slide2\t",
  "hero.slide3\t",
  "# Paste HTTPS image URLs (or leave empty to use bundled files in index.html).",
  "# Allowed: https://... http://... assets/img/... /absolute-path-from-site-root",
].join("\n");

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "seed-ENG.tsv"), buildTsv("en"), "utf8");
fs.writeFileSync(path.join(outDir, "seed-SK.tsv"), buildTsv("sk"), "utf8");
fs.writeFileSync(path.join(outDir, "seed-IMG.tsv"), `${imgSeed}\n`, "utf8");

console.log("Wrote:");
console.log(" ", path.join(outDir, "seed-ENG.tsv"));
console.log(" ", path.join(outDir, "seed-SK.tsv"));
console.log(" ", path.join(outDir, "seed-IMG.tsv"));
