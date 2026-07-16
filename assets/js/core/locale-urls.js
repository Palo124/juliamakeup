/**
 * Locale URL helpers — `/` = SK, `/en/` = EN.
 */
import { CONFIG } from "../config.js";

/** @typedef {"home" | "booking" | "action" | "bridalLanding"} PageId */
/** @typedef {"en" | "sk"} SiteLang */

/**
 * @param {string} [pathname]
 * @returns {SiteLang}
 */
export function getLangFromPath(pathname = window.location.pathname) {
  return /^\/en(\/|$)/.test(pathname) ? "en" : "sk";
}

/**
 * @param {string} [pathname]
 * @returns {PageId}
 */
export function getPageId(pathname = window.location.pathname) {
  const base = pathname.replace(/\/$/, "") || "/";
  if (/\/booking\.html$/i.test(base)) {
    return "booking";
  }
  if (/\/action\.html$/i.test(base)) {
    return "action";
  }
  if (/\/svadobne-licenie-bratislava$/i.test(base)) {
    return "bridalLanding";
  }
  return "home";
}

/**
 * Site path for a page + locale (leading slash, trailing slash on EN/SK home).
 * @param {PageId} pageId
 * @param {SiteLang} lang
 * @returns {string}
 */
export function pagePath(pageId, lang) {
  if (pageId === "bridalLanding") {
    return "/svadobne-licenie-bratislava/";
  }
  if (pageId === "action") {
    return lang === "en" ? "/en/action.html" : "/action.html";
  }
  if (lang === "en") {
    return pageId === "booking" ? "/en/booking.html" : "/en/";
  }
  return pageId === "booking" ? "/booking.html" : "/";
}

function siteOrigin() {
  return (CONFIG.siteUrl || "").replace(/\/$/, "");
}

/** @returns {string} */
export function getSiteOrigin() {
  return siteOrigin();
}

/**
 * Absolute canonical URL for a page + locale.
 * @param {PageId} pageId
 * @param {SiteLang} lang
 * @returns {string}
 */
export function pageUrl(pageId, lang) {
  const origin = siteOrigin();
  const path = pagePath(pageId, lang);
  if (!origin) {
    return path;
  }
  if (path === "/") {
    return `${origin}/`;
  }
  return `${origin}${path}`;
}

/**
 * Same page in another locale (hash preserved).
 * @param {SiteLang} targetLang
 * @param {{ pathname?: string, hash?: string, pageId?: PageId }} [opts]
 * @returns {string}
 */
export function switchLocaleHref(targetLang, opts = {}) {
  const pathname = opts.pathname ?? window.location.pathname;
  const hash = opts.hash ?? window.location.hash;
  const pageId = opts.pageId ?? getPageId(pathname);
  return `${pagePath(pageId, targetLang)}${hash}`;
}
