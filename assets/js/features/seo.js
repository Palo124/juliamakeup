/**
 * Canonical URLs, Open Graph / Twitter meta, hreflang, and JSON-LD structured data.
 */
import { CONFIG } from "../config.js";
import { getPageId, getSiteOrigin, pagePath, pageUrl as localePageUrl } from "../core/locale-urls.js";
import { getLang, resolveSiteImageUrl, siteImageSrcForProfile, t } from "../i18n.js";

/** @typedef {"home" | "booking" | "bridalLanding" | "privacy"} SeoPage */

const FAQ_COUNT = 4;
const BRIDAL_LANDING_FAQ_COUNT = 6;
const JSON_LD_ID = "juliamakeup-json-ld";

/** @type {SeoPage | null} */
let activePage = null;

/** @param {SeoPage} [page] */
function ogImageUrl(page) {
  const source =
    page === "bridalLanding"
      ? "https://drive.google.com/file/d/1zpPOVSkMdypIdToZJQzigpec5VMtCrDA/view?usp=sharing"
      : CONFIG.seoOgImage || "assets/img/favicon_juliere.png";
  const resolved = resolveSiteImageUrl(source);
  return resolved ? siteImageSrcForProfile(resolved, "og") : "";
}

/**
 * @param {SeoPage} page
 * @returns {{ titleKey: string, descriptionKey: string }}
 */
function pageMetaKeys(page) {
  if (page === "booking") {
    return {
      titleKey: "meta.titleBooking",
      descriptionKey: "meta.descriptionBooking",
    };
  }
  if (page === "privacy") {
    return {
      titleKey: "meta.titlePrivacy",
      descriptionKey: "meta.descriptionPrivacy",
    };
  }
  if (page === "bridalLanding") {
    return {
      titleKey: "meta.titleBridalLanding",
      descriptionKey: "meta.descriptionBridalLanding",
    };
  }
  return {
    titleKey: "meta.title",
    descriptionKey: "meta.description",
  };
}

function currentPageUrl(page) {
  const lang = getLang();
  return localePageUrl(page, lang);
}

function setLinkRel(rel, href, hreflang) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (hreflang) {
      el.setAttribute("hreflang", hreflang);
    }
    document.head.appendChild(el);
  }
  if (el instanceof HTMLLinkElement) {
    el.href = href;
  }
}

function applyHreflang(page) {
  const skUrl = localePageUrl(page, "sk");
  if (page === "bridalLanding") {
    setLinkRel("alternate", skUrl, "sk");
    setLinkRel("alternate", skUrl, "x-default");
    return;
  }
  const enUrl = localePageUrl(page, "en");
  setLinkRel("alternate", skUrl, "sk");
  setLinkRel("alternate", enUrl, "en");
  setLinkRel("alternate", skUrl, "x-default");
}

function setMetaByName(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setMetaByProperty(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function socialProfileUrls() {
  const ids = ["footer-link-instagram", "footer-link-facebook", "footer-link-x"];
  return ids
    .map((id) => document.getElementById(id))
    .filter((a) => a instanceof HTMLAnchorElement)
    .map((a) => a.href.trim())
    .filter((href) => href && href !== "#" && /^https?:\/\//i.test(href));
}

function openingHoursSpecification() {
  return [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:00",
      closes: "14:00",
    },
  ];
}

function buildJsonLd(page) {
  const origin = getSiteOrigin() || "";
  const image = ogImageUrl(page);
  const url = currentPageUrl(page);
  const lang = getLang();
  const inLanguage = lang === "sk" ? "sk-SK" : "en-GB";
  const graph = [];

  graph.push({
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    name: "Juliére Beauty",
    url: origin || url,
    inLanguage: ["sk-SK", "en-GB"],
  });

  if (page === "home") {
    graph.push({
      "@type": "BeautySalon",
      "@id": `${origin}/#business`,
      name: "Juliére Beauty",
      url: origin || url,
      image,
      telephone: t("contact.phone"),
      email: t("contact.email"),
      address: {
        "@type": "PostalAddress",
        streetAddress: "Račianska 66",
        addressLocality: "Bratislava",
        postalCode: "831 02",
        addressCountry: "SK",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 48.1791114,
        longitude: 17.1289502,
      },
      openingHoursSpecification: openingHoursSpecification(),
      sameAs: socialProfileUrls(),
    });

    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      inLanguage,
      mainEntity: Array.from({ length: FAQ_COUNT }, (_, i) => {
        const n = i + 1;
        return {
          "@type": "Question",
          name: t(`faq.q${n}`),
          acceptedAnswer: {
            "@type": "Answer",
            text: t(`faq.a${n}`),
          },
        };
      }),
    });
  }

  if (page === "booking") {
    graph.push({
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      name: t("meta.titleBooking"),
      description: t("meta.descriptionBooking"),
      url,
      isPartOf: { "@id": `${origin}/#website` },
      inLanguage,
    });
  }

  if (page === "bridalLanding") {
    graph.push({
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      name: t("meta.titleBridalLanding"),
      description: t("meta.descriptionBridalLanding"),
      url,
      isPartOf: { "@id": `${origin}/#website` },
      about: { "@id": `${origin}/#business` },
      inLanguage: "sk-SK",
    });

    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      inLanguage: "sk-SK",
      mainEntity: Array.from({ length: BRIDAL_LANDING_FAQ_COUNT }, (_, i) => {
        const n = i + 1;
        return {
          "@type": "Question",
          name: t(`bridalLanding.faq.q${n}`),
          acceptedAnswer: {
            "@type": "Answer",
            text: t(`bridalLanding.faq.a${n}`),
          },
        };
      }),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

function applyJsonLd(page) {
  let el = document.getElementById(JSON_LD_ID);
  if (!el) {
    el = document.createElement("script");
    el.id = JSON_LD_ID;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(buildJsonLd(page));
}

export function applySeo(page = activePage || "home") {
  activePage = page;
  const { titleKey, descriptionKey } = pageMetaKeys(page);
  const title = t(titleKey);
  const description = t(descriptionKey);
  const url = currentPageUrl(page);
  const image = ogImageUrl(page);
  const lang = getLang();
  const ogLocale = lang === "sk" ? "sk_SK" : "en_GB";
  const ogLocaleAlt = lang === "sk" ? "en_GB" : "sk_SK";

  const canonical = document.getElementById("canonical-link");
  if (canonical instanceof HTMLLinkElement) {
    canonical.href = url;
  }

  applyHreflang(page);

  setMetaByProperty("og:site_name", "Juliére Beauty");
  setMetaByProperty("og:type", "website");
  setMetaByProperty("og:url", url);
  setMetaByProperty("og:title", title);
  setMetaByProperty("og:description", description);
  setMetaByProperty("og:image", image);
  setMetaByProperty("og:locale", ogLocale);
  setMetaByProperty("og:locale:alternate", ogLocaleAlt);

  setMetaByName("twitter:card", "summary_large_image");
  setMetaByName("twitter:title", title);
  setMetaByName("twitter:description", description);
  setMetaByName("twitter:image", image);

  applyJsonLd(page);
}

/**
 * @param {SeoPage} [page]
 */
export function initSeo(page = "home") {
  activePage = page;
  applySeo(page);
}

/** @param {string} [pathname] */
export function detectSeoPage(pathname = window.location.pathname) {
  const pageId = getPageId(pathname);
  if (pageId === "booking") {
    return "booking";
  }
  if (pageId === "privacy") {
    return "privacy";
  }
  if (pageId === "bridalLanding") {
    return "bridalLanding";
  }
  return "home";
}

/** Exported for sitemap tooling / tests. */
export { pagePath, localePageUrl };
