/**
 * One-off / repeatable: build merged_ENG.csv from merged_SK.csv structure + English strings.
 * Run: node scripts/build-merged-eng-from-sk.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BUNDLED_STRINGS } from "../assets/js/i18n.js";
import { parseCsv } from "../assets/js/site-text-csv.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

/** SK merged text differs from bundled SK — curated EN for ENG sheet. */
const OVERRIDE_EN = {
  "meta.title": "Juliére Beauty | Modern makeup studio",
  "meta.description": "Juliére Beauty — an elegant makeup studio.",
  "hero.carouselAria": "Juliére Beauty",
  "hero.slide2.caption": " ",
  "hero.scroll": "Scroll",
  "nav.prices": "Services + pricing",
  "intro.text": "Highlight your beauty.",
  "stats.yearsDesc": "years of experience",
  "stats.sessions": "  ",
  "stats.sessionsDesc": "  ",
  "stats.rating": "Reviews",
  "stats.ratingDesc": "  ",
  "about.eyebrow": "About me",
  "about.h2": "Minimalist makeup tailored to what makes you unique.",
  "about.p1":
    "I'm Julia — makeup has been my passion for over 8 years. I do weddings, balls, proms, shoots and special occasions.",
  "about.p2":
    "I believe every woman is beautiful, and my goal is to gently enhance that beauty so you feel confident and still yourself. I look forward to seeing you!",
  "portfolio.h2": "My work",
  "portfolio.bridal.label": "BEFORE & AFTER",
  "portfolio.bridal.p": "Makeup transformations.",
  "portfolio.soft.label": "Brides",
  "portfolio.soft.p": "Bridal makeup.",
  "portfolio.editorial.label": "Statement looks",
  "portfolio.editorial.p": "Bold makeup or Halloween-ready glam.",
  "portfolio.evening.label": "Brow shaping & lamination",
  "portfolio.evening.p": "Finished work.",
  "prices.eyebrow": "Pricing",
  "prices.h2": "Services",
  "prices.signature.h3": "Event makeup",
  "prices.signature.p":
    "Event makeup is ideal for balls, proms, parties and other special occasions. I'll tailor it to your vision so it enhances your natural beauty and works with your outfit and the event. The result is long-wearing, elegant glam. Duration: 1h",
  "prices.bridal.p":
    "Feel exceptional on your big day! We'll shape bridal makeup to your vision so it fits your style and lasts all day and into the night. Duration: 1h 20m",
  "prices.trial.h3": "Makeup trial",
  "prices.trial.p":
    "We'll refine the look exactly to your expectations so on the day you're sure of a flawless result — stress-free. Duration: 2h",
  "prices.lesson.h3": "Brow grooming",
  "prices.lesson.p":
    "We'll enhance your natural brow shape or use lamination to add volume and a polished look for weeks. Duration: 50 min",
  "prices.signature.detail":
    "Signature makeup is a complete look for everyday life and photos: even skin, balanced colour and a finish that lasts into the evening. We start with skin prep and tailor coverage, eyes and lips to your outfit and lighting. Bring inspiration if you like — the goal is a confident, polished you.",
  "prices.bridal.detail":
    "Bridal makeup includes a consultation, long-wear application and a clear timeline plan for the wedding day so you stay calm and camera-ready. We'll cover trials, touch-ups and coordination with your dress, veil and photographer. On the day it's about glowing skin, staying power and a look that still feels like you.",
  "prices.trial.detail":
    "A trial is the best way to lock in your look before a major event or wedding — colours, intensity and wear time without rushing. You'll leave with notes on what worked and small tweaks for the final appointment. If you're torn between styles, we can try more than one direction within the time.",
  "prices.lesson.detail":
    "The 1:1 lesson is built around your skin, products and goals — from a quick daytime routine to a bolder evening look. We go step by step: tools, application order and how to fix typical issues. You'll get a simple at-home routine and product tips that fit your budget.",
  "booking.intro": "Pick an open slot in the calendar and complete your details below.",
  "contact.line1": "Račianska 66, Bratislava",
  "contact.hours1": " ",
  "contact.hours2": "Mon–Sun: By appointment",
  "contact.hours3": " ",
  "contact.noteP":
    "For wedding dates and group bookings I recommend booking ahead so you can secure your preferred time.",
  "footer.brand": "Juliére Beauty",
};

/** Localize # section headers (first column only). */
function translateSectionHeader(sk) {
  const map = {
    "# === Meta (SEO, titles) ===": "# === Meta (SEO, titles) ===",
    "# === Hero (carousel, tagline) ===": "# === Hero (carousel, tagline) ===",
    "# === Header & brand ===": "# === Header & brand ===",
    "# === Nav links ===": "# === Nav links ===",
    "# === Intro strip + stats ===": "# === Intro strip + stats ===",
    "# === About ===": "# === About ===",
    "# === Portfolio (sections + gallery) ===": "# === Portfolio (sections + gallery) ===",
    "# === Cenník / služby (cards + detail + ceny) ===": "# === Pricing & services (cards, detail, prices) ===",
    "# === Recenzie ===": "# === Reviews ===",
    "# === Pred termínom ===": "# === Before your appointment ===",
    "# === FAQ ===": "# === FAQ ===",
    "# === Názvy služieb (booking dropdown) ===": "# === Service names (booking dropdown) ===",
    "# === Rezervačný widget ===": "# === Booking widget ===",
    "# === Kontakt ===": "# === Contact ===",
    "# === Footer + jazyk + toast + generické carousel ===":
      "# === Footer + language + toast + shared carousel ===",
  };
  return map[sk] ?? sk;
}

function csvEscape(value) {
  const s = String(value ?? "");
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function csvRow(fields) {
  return fields.map(csvEscape).join(",");
}

const legendEn =
  "# imageUrl (optional). Runtime uses column C on the SK tab for data-site-img; duplicate here for editors if you like. Gallery modal: assets/data/portfolio-galleries.json";

const skRows = parseCsv(fs.readFileSync(path.join(root, "merged_SK.csv"), "utf8"));
const skBund = BUNDLED_STRINGS.sk;
const enBund = BUNDLED_STRINGS.en;
const skMerged = {};
for (let r = 1; r < skRows.length; r++) {
  const k = String(skRows[r][0] ?? "").trim();
  if (!k || k.startsWith("#")) continue;
  skMerged[k] = skRows[r][1] ?? "";
}

function englishForKey(key) {
  if (OVERRIDE_EN[key] !== undefined) {
    return OVERRIDE_EN[key];
  }
  const skM = String(skMerged[key] ?? "").replace(/\r\n/g, "\n").trim();
  const skB = String(skBund[key] ?? "").replace(/\r\n/g, "\n").trim();
  if (skM === skB && enBund[key] !== undefined) {
    return enBund[key];
  }
  return enBund[key] ?? skMerged[key] ?? "";
}

const out = [];
for (let r = 0; r < skRows.length; r++) {
  const row = skRows[r];
  const a = row[0] ?? "";
  const key = String(a).trim();
  const c = row[2] ?? "";

  if (r === 0) {
    out.push(csvRow(["key", "text", "imageUrl"]));
    continue;
  }

  if (!key) {
    out.push(csvRow(["", "", c]));
    continue;
  }

  if (key.startsWith("#")) {
    let headerOut = translateSectionHeader(key);
    if (key.includes("imageUrl") && key.includes("Hero")) {
      headerOut = legendEn;
    }
    out.push(csvRow([headerOut, "", c]));
    continue;
  }

  const text = englishForKey(key);
  out.push(csvRow([key, text, c]));
}

const dest = path.join(root, "merged_ENG.csv");
fs.writeFileSync(dest, `${out.join("\n")}\n`, "utf8");
console.log("Wrote", dest, "rows", out.length);
