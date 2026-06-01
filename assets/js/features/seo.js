/**
 * Canonical URLs, Open Graph / Twitter meta, and JSON-LD structured data.
 */
import { CONFIG } from "../config.js";
import { t, getLang } from "../i18n.js";

/** @typedef {"home" | "booking"} SeoPage */

const FAQ_COUNT = 4;
const JSON_LD_ID = "juliamakeup-json-ld";

/** @type {SeoPage | null} */
let activePage = null;

function siteOrigin() {
  return (CONFIG.siteUrl || "").replace(/\/$/, "");
}

function absoluteUrl(path) {
  const origin = siteOrigin();
  if (!origin) {
    return path.startsWith("/") ? path : `/${path}`;
  }
  const clean = path.replace(/^\//, "");
  return `${origin}/${clean}`;
}

function ogImageUrl() {
  return absoluteUrl(CONFIG.seoOgImage || "assets/img/favicon_juliere.png");
}

/**
 * @param {SeoPage} page
 * @returns {{ path: string, titleKey: string, descriptionKey: string }}
 */
function pageMeta(page) {
  if (page === "booking") {
    return {
      path: "booking.html",
      titleKey: "meta.titleBooking",
      descriptionKey: "meta.descriptionBooking",
    };
  }
  return {
    path: "",
    titleKey: "meta.title",
    descriptionKey: "meta.description",
  };
}

function pageUrl(page) {
  const { path } = pageMeta(page);
  const origin = siteOrigin();
  if (!origin) {
    return path || "/";
  }
  return path ? `${origin}/${path}` : `${origin}/`;
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
  const origin = siteOrigin() || "";
  const image = ogImageUrl();
  const url = pageUrl(page);
  const graph = [];

  graph.push({
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    name: "Juliere Beauty",
    url: origin || url,
    inLanguage: ["sk", "en"],
  });

  if (page === "home") {
    graph.push({
      "@type": "BeautySalon",
      "@id": `${origin}/#business`,
      name: "Juliere Beauty",
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
        latitude: 48.1789721,
        longitude: 17.1287973,
      },
      openingHoursSpecification: openingHoursSpecification(),
      sameAs: socialProfileUrls(),
    });

    graph.push({
      "@type": "FAQPage",
      "@id": `${origin}/#faq`,
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
      inLanguage: getLang() === "sk" ? "sk-SK" : "en-GB",
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
  const { titleKey, descriptionKey } = pageMeta(page);
  const title = t(titleKey);
  const description = t(descriptionKey);
  const url = pageUrl(page);
  const image = ogImageUrl();
  const lang = getLang();
  const ogLocale = lang === "sk" ? "sk_SK" : "en_GB";
  const ogLocaleAlt = lang === "sk" ? "en_GB" : "sk_SK";

  const canonical = document.getElementById("canonical-link");
  if (canonical instanceof HTMLLinkElement) {
    canonical.href = url;
  }

  setMetaByProperty("og:site_name", "Juliere Beauty");
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
  window.addEventListener("juliamakeup:lang", () => {
    applySeo(activePage || page);
  });
}
