/**
 * Generate /en pages from root HTML (index, booking, action).
 * Applies SK sheet image URLs (column C) to both locales. Run after editing HTML: npm run sync:locale-pages
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BUNDLED_STRINGS, resolveSiteImageUrl } from "../assets/js/i18n.js";
import { buildSiteImageDelivery, normalizeSiteImageProfile } from "../assets/js/site-image-delivery.js";
import { pageUrl } from "../assets/js/core/locale-urls.js";
import { parseCsv, siteImgUrlsFromSkCsvRows } from "../assets/js/site-text-csv.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const enDir = join(root, "en");

/** @type {Record<string, "home" | "booking" | "action">} */
const PAGE_KEYS = {
  home: "home",
  booking: "booking",
  action: "action",
};

function canonicalFor(pageKey, lang) {
  return pageUrl(PAGE_KEYS[pageKey], lang);
}

const skSeedCsv = readFileSync(join(root, "google-apps-script/site-texts/seed-SK.csv"), "utf8");
const skImageMap = siteImgUrlsFromSkCsvRows(parseCsv(skSeedCsv));

function hreflangBlock(pageKey) {
  const sk = canonicalFor(pageKey, "sk");
  const en = canonicalFor(pageKey, "en");
  return `  <link rel="alternate" hreflang="sk" href="${sk}">
  <link rel="alternate" hreflang="en" href="${en}">
  <link rel="alternate" hreflang="x-default" href="${sk}">
`;
}

function injectHreflang(html, pageKey) {
  if (html.includes('hreflang="sk"')) {
    return html.replace(
      /<link rel="alternate" hreflang="sk"[^>]*>\s*\n?\s*<link rel="alternate" hreflang="en"[^>]*>\s*\n?\s*<link rel="alternate" hreflang="x-default"[^>]*>\s*\n?/,
      hreflangBlock(pageKey),
    );
  }
  return html.replace(/<meta name="robots"/, `${hreflangBlock(pageKey)}  <meta name="robots"`);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtmlAttr(str) {
  return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function normalizeRootAssetPaths(html) {
  return html
    .replace(/(\s(?:href|src))="assets\//g, '$1="/assets/')
    .replace(/(\s(?:href|src))="\.\.\/assets\//g, '$1="/assets/');
}

function applySkSheetImages(html) {
  return html.replace(/<img\b([^>]*\bdata-site-img="([^"]+)"[^>]*)\/?>/gi, (full, attrs, key) => {
    const profile = normalizeSiteImageProfile(/data-site-img-profile="([^"]+)"/i.exec(attrs)?.[1]);
    const raw = skImageMap[key.trim()];
    const resolved = raw ? resolveSiteImageUrl(raw) : null;
    const fallbackSrc = /\bsrc="([^"]*)"/i.exec(attrs)?.[1] ?? "";
    const baseUrl = resolved || resolveSiteImageUrl(fallbackSrc);
    if (!baseUrl) {
      return full;
    }

    const delivery = buildSiteImageDelivery(baseUrl, profile);
    let nextAttrs = attrs;

    if (/\bsrc="/i.test(nextAttrs)) {
      nextAttrs = nextAttrs.replace(/\bsrc="[^"]*"/i, `src="${escapeHtmlAttr(delivery.src)}"`);
    } else {
      nextAttrs = ` src="${escapeHtmlAttr(delivery.src)}"${nextAttrs}`;
    }

    if (delivery.srcset) {
      if (/\bsrcset="/i.test(nextAttrs)) {
        nextAttrs = nextAttrs.replace(/\bsrcset="[^"]*"/i, `srcset="${escapeHtmlAttr(delivery.srcset)}"`);
      } else {
        nextAttrs = `${nextAttrs.trimEnd()} srcset="${escapeHtmlAttr(delivery.srcset)}"`;
      }
    }

    if (delivery.sizes) {
      if (/\bsizes="/i.test(nextAttrs)) {
        nextAttrs = nextAttrs.replace(/\bsizes="[^"]*"/i, `sizes="${escapeHtmlAttr(delivery.sizes)}"`);
      } else {
        nextAttrs = `${nextAttrs.trimEnd()} sizes="${escapeHtmlAttr(delivery.sizes)}"`;
      }
    }

    if (/googleusercontent\.com|drive\.google/i.test(delivery.src)) {
      if (/\breferrerpolicy="/i.test(nextAttrs)) {
        nextAttrs = nextAttrs.replace(/\breferrerpolicy="[^"]*"/i, 'referrerpolicy="no-referrer"');
      } else {
        nextAttrs = `${nextAttrs.trimEnd()} referrerpolicy="no-referrer"`;
      }
    }

    return `<img${nextAttrs}>`;
  });
}

function prepareSharedHtml(html) {
  return applySkSheetImages(normalizeRootAssetPaths(html));
}

const TEXT_CONTAINER_TAGS =
  "p|h1|h2|h3|h4|strong|span|summary|label|div|a|li|button|figcaption|option|td|th";

function applyBundledLang(html, lang) {
  const strings = BUNDLED_STRINGS[lang];
  let out = html;

  for (const [key, text] of Object.entries(strings)) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const safeText = escapeHtml(text);

    out = out.replace(
      new RegExp(
        `(data-i18n="${escaped}"[^>]*)>\\s*[\\s\\S]*?\\s*<\\/(${TEXT_CONTAINER_TAGS})(\\s[^>]*)?>`,
        "gi",
      ),
      (_, prefix, tag, rest) => `${prefix}>${safeText}</${tag}${rest || ""}>`,
    );

    out = out.replace(
      new RegExp(`(data-i18n-content="${escaped}"[^>]*content=")[^"]*(")`, "g"),
      `$1${escapeHtmlAttr(text)}$2`,
    );
    out = out.replace(
      new RegExp(`(data-i18n-placeholder="${escaped}"[^>]*placeholder=")[^"]*(")`, "g"),
      `$1${escapeHtmlAttr(text)}$2`,
    );
    out = out.replace(
      new RegExp(`(data-i18n-aria="${escaped}"[^>]*aria-label=")[^"]*(")`, "g"),
      `$1${escapeHtmlAttr(text)}$2`,
    );
    out = out.replace(
      new RegExp(`(data-i18n-alt="${escaped}"[^>]*alt=")[^"]*(")`, "g"),
      `$1${escapeHtmlAttr(text)}$2`,
    );
    out = out.replace(
      new RegExp(`(data-i18n-title="${escaped}"[^>]*title=")[^"]*(")`, "g"),
      `$1${escapeHtmlAttr(text)}$2`,
    );
    out = out.replace(
      new RegExp(`(data-i18n-option="${escaped}"[^>]*)>\\s*[\\s\\S]*?\\s*<\\/option>`, "gi"),
      `$1>${safeText}</option>`,
    );
  }

  let titleKey = "meta.title";
  if (out.includes('data-page-title-i18n="meta.titleBookingAction"')) {
    titleKey = "meta.titleBookingAction";
  } else if (out.includes('data-page-title-i18n="meta.titleBooking"')) {
    titleKey = "meta.titleBooking";
  }
  const title = strings[titleKey];
  if (title) {
    out = out.replace(
      /<title id="page-title"[^>]*>[^<]*<\/title>/,
      `<title id="page-title">${escapeHtml(title)}</title>`,
    );
  }

  return out;
}

function applyBundledEn(html) {
  return applyBundledLang(html, "en");
}

function applyBundledSk(html) {
  return applyBundledLang(html, "sk");
}

function toEnPage(html, pageKey) {
  const canonical = canonicalFor(pageKey, "en");
  let out = html
    .replace("<html lang=\"sk\">", "<html lang=\"en\">")
    .replace(
      /<body(?:\s+data-default-lang="[^"]*")?\s+/,
      "<body ",
    )
    .replace(
      /class="lang-switch-btn is-active" data-lang-set="sk" aria-pressed="true"/,
      'class="lang-switch-btn" data-lang-set="sk" aria-pressed="false"',
    )
    .replace(
      /class="lang-switch-btn" data-lang-set="en" aria-pressed="false"/,
      'class="lang-switch-btn is-active" data-lang-set="en" aria-pressed="true"',
    )
    .replace(/id="canonical-link" href="[^"]*"/, `id="canonical-link" href="${canonical}"`)
    .replace(/property="og:url" content="[^"]*"/, `property="og:url" content="${canonical}"`)
    .replace(/property="og:locale" content="sk_SK"/, 'property="og:locale" content="en_GB"')
    .replace(/property="og:locale:alternate" content="en_GB"/, 'property="og:locale:alternate" content="sk_SK"');

  out = injectHreflang(out, pageKey);
  out = applyBundledEn(out);
  return out;
}

function toSkPage(html, pageKey) {
  let out = applyBundledSk(html);
  out = out.replace("<html lang=\"en\">", "<html lang=\"sk\">");
  if (!/^<html lang=/m.test(out)) {
    out = out.replace("<html>", '<html lang="sk">');
  }
  out = out.replace(/<body(?:\s+data-default-lang="[^"]*")?\s+/, "<body ");
  out = out.replace(
    /class="lang-switch-btn is-active" data-lang-set="en" aria-pressed="true"/,
    'class="lang-switch-btn" data-lang-set="en" aria-pressed="false"',
  );
  out = out.replace(
    /class="lang-switch-btn" data-lang-set="sk" aria-pressed="false"/,
    'class="lang-switch-btn is-active" data-lang-set="sk" aria-pressed="true"',
  );
  out = injectHreflang(out, pageKey);
  return out;
}

mkdirSync(enDir, { recursive: true });

const indexShared = prepareSharedHtml(readFileSync(join(root, "index.html"), "utf8"));
const bookingShared = prepareSharedHtml(readFileSync(join(root, "booking.html"), "utf8"));
const actionShared = prepareSharedHtml(readFileSync(join(root, "action.html"), "utf8"));

writeFileSync(join(root, "index.html"), toSkPage(indexShared, "home"));
writeFileSync(join(enDir, "index.html"), toEnPage(indexShared, "home"));
writeFileSync(join(root, "booking.html"), toSkPage(bookingShared, "booking"));
writeFileSync(join(enDir, "booking.html"), toEnPage(bookingShared, "booking"));
writeFileSync(join(root, "action.html"), toSkPage(actionShared, "action"));
writeFileSync(join(enDir, "action.html"), toEnPage(actionShared, "action"));

console.log("Synced SK + EN pages (SK/EN copy from i18n.js, SK sheet images, /assets/ paths)");
