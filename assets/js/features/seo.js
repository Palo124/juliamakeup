/**
 * Canonical URLs, Open Graph / Twitter meta, hreflang, and JSON-LD structured data.
 */
import { CONFIG } from "../config.js";
import { getPageId, getSiteOrigin, pagePath, pageUrl as localePageUrl } from "../core/locale-urls.js";
import { getLang, resolveSiteImageUrl, siteImageSrcForProfile, t } from "../i18n.js";

/** @typedef {"home" | "booking" | "bridalLanding" | "promLanding" | "privacy"} SeoPage */

const FAQ_COUNT = 4;
const BRIDAL_LANDING_FAQ_COUNT = 6;
const JSON_LD_ID = "juliamakeup-json-ld";
const SK_ONLY_LANDINGS = new Set(["bridalLanding"]);

/** @type {SeoPage | null} */
let activePage = null;

/** @param {SeoPage} [page] */
function ogImageUrl(page) {
  const source =
    page === "bridalLanding"
      ? "https://drive.google.com/file/d/1zpPOVSkMdypIdToZJQzigpec5VMtCrDA/view?usp=sharing"
      : page === "promLanding"
        ? "/assets/img/stuzkova_makeup/stuzkova-3-w1200.webp"
        : CONFIG.seoOgImage || "assets/img/favicon_juliere.png";
  const resolved = resolveSiteImageUrl(source);
  const src = resolved ? siteImageSrcForProfile(resolved, "og") : "";
  if (!src) {
    return "";
  }
  if (/^https?:\/\//i.test(src)) {
    return src;
  }
  const origin = getSiteOrigin() || CONFIG.siteUrl || "";
  const path = src.startsWith("/") ? src : `/${src}`;
  return origin ? `${origin}${path}` : path;
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
  if (page === "promLanding") {
    return {
      titleKey: "meta.titlePromLanding",
      descriptionKey: "meta.descriptionPromLanding",
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
  if (SK_ONLY_LANDINGS.has(page)) {
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
  const ids = ["footer-link-instagram", "footer-link-facebook"];
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

/**
 * @param {string} origin
 * @param {string} image
 */
function beautySalonJsonLd(origin, image) {
  return {
    "@type": "BeautySalon",
    "@id": `${origin}/#business`,
    name: "Juliére Beauty",
    url: origin,
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
  };
}

/**
 * @param {string} prefix
 * @param {number} count
 */
function faqEntities(prefix, count) {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    return {
      "@type": "Question",
      name: t(`${prefix}.q${n}`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`${prefix}.a${n}`),
      },
    };
  });
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
    graph.push(beautySalonJsonLd(origin, image));

    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      inLanguage,
      mainEntity: faqEntities("faq", FAQ_COUNT),
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
      mainEntity: faqEntities("bridalLanding.faq", BRIDAL_LANDING_FAQ_COUNT),
    });
  }

  if (page === "promLanding") {
    graph.push(beautySalonJsonLd(origin, image));

    graph.push({
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      name: t("meta.titlePromLanding"),
      description: t("meta.descriptionPromLanding"),
      url,
      isPartOf: { "@id": `${origin}/#website` },
      about: { "@id": `${origin}/#business` },
      inLanguage,
    });

    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: lang === "sk" ? "Domov" : "Home",
          item: localePageUrl("home", lang),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: lang === "sk" ? "Líčenie na stužkovú Bratislava" : "Prom Makeup Bratislava",
          item: url,
        },
      ],
    });

    graph.push({
      "@type": "Service",
      "@id": `${url}#service`,
      name: lang === "sk" ? "Líčenie na stužkovú" : "Prom makeup",
      serviceType: "Makeup",
      description: t("meta.descriptionPromLanding"),
      url,
      provider: { "@id": `${origin}/#business` },
      areaServed: {
        "@type": "City",
        name: "Bratislava",
      },
      offers: {
        "@type": "Offer",
        price: "40",
        priceCurrency: "EUR",
      },
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
  if (pageId === "promLanding") {
    return "promLanding";
  }
  return "home";
}

/** Exported for sitemap tooling / tests. */
export { pagePath, localePageUrl };
