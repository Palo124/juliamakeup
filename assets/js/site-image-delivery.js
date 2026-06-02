/**
 * Responsive image delivery for site photos (Google Drive lh3 URLs and local assets).
 */

/** @typedef {"hero" | "portrait" | "thumb" | "gallery" | "og"} SiteImageProfile */

/** @type {Record<SiteImageProfile, { widths: number[]; defaultWidth: number; sizes: string }>} */
export const SITE_IMAGE_PROFILES = {
  hero: {
    widths: [640, 960, 1200, 1440],
    defaultWidth: 1200,
    sizes: "(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw",
  },
  portrait: {
    widths: [480, 640, 800, 960],
    defaultWidth: 800,
    sizes: "(max-width: 760px) 100vw, 50vw",
  },
  thumb: {
    widths: [320, 480, 640, 720],
    defaultWidth: 640,
    sizes: "(max-width: 760px) 80vw, 300px",
  },
  gallery: {
    widths: [960, 1280, 1600, 1920],
    defaultWidth: 1600,
    sizes: "100vw",
  },
  og: {
    widths: [1200],
    defaultWidth: 1200,
    sizes: "1200px",
  },
};

const DRIVE_FILE_ID_RE = /^[a-zA-Z0-9_-]+$/;

/** Local masters with generated `-w{width}.webp` variants (see `scripts/optimize-site-images.mjs`). */
const LOCAL_RESPONSIVE_BASES = new Set(["/assets/img/IMG_7567"]);

/**
 * @param {unknown} input
 * @returns {string | null}
 */
export function extractGoogleDriveFileId(input) {
  const s = String(input).trim();
  if (!s) {
    return null;
  }

  if (!/[\/:?#]/.test(s) && DRIVE_FILE_ID_RE.test(s) && s.length >= 10) {
    return s;
  }

  const userContent = s.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/i);
  if (userContent) {
    return userContent[1];
  }

  let u;
  try {
    u = new URL(s);
  } catch {
    try {
      u = new URL(s.startsWith("http") ? s : `https://${s}`);
    } catch {
      u = null;
    }
  }

  if (u) {
    const host = u.hostname.replace(/^www\./i, "");
    const isDriveHost =
      host === "drive.google.com" ||
      host === "docs.google.com" ||
      host === "drive.usercontent.google.com";

    const directId = u.pathname.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (directId) {
      return directId[1];
    }

    const filePath = u.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (filePath) {
      return filePath[1];
    }

    const idParam = u.searchParams.get("id");
    if (idParam && DRIVE_FILE_ID_RE.test(idParam) && isDriveHost) {
      return idParam;
    }
  }

  if (/drive\.google\.com|docs\.google\.com/i.test(s)) {
    const q = s.match(/[?&#]id=([a-zA-Z0-9_-]+)/i);
    if (q) {
      return q[1];
    }
  }

  return null;
}

/**
 * @param {string} id
 * @param {number} width
 */
export function driveImageUrl(id, width) {
  return `https://lh3.googleusercontent.com/d/${id}=w${width}`;
}

/**
 * @param {unknown} profileKey
 * @returns {SiteImageProfile}
 */
export function normalizeSiteImageProfile(profileKey) {
  const key = String(profileKey ?? "").trim();
  if (key && key in SITE_IMAGE_PROFILES) {
    return /** @type {SiteImageProfile} */ (key);
  }
  return "hero";
}

/**
 * @param {string} resolvedUrl
 * @returns {string | null}
 */
function localResponsiveBase(resolvedUrl) {
  const match = resolvedUrl.match(/^(\/assets\/img\/[^/?#]+?)(?:-\w+)?\.(?:jpe?g|webp|png)(?:\?.*)?$/i);
  if (!match) {
    return null;
  }

  const base = match[1];
  return LOCAL_RESPONSIVE_BASES.has(base) ? base : null;
}

/**
 * @param {string} resolvedUrl
 * @param {SiteImageProfile} profileKey
 * @returns {{ src: string; srcset?: string; sizes?: string }}
 */
export function buildSiteImageDelivery(resolvedUrl, profileKey) {
  const profile = SITE_IMAGE_PROFILES[normalizeSiteImageProfile(profileKey)];
  const id = extractGoogleDriveFileId(resolvedUrl);

  if (id) {
    return {
      src: driveImageUrl(id, profile.defaultWidth),
      srcset: profile.widths.map((w) => `${driveImageUrl(id, w)} ${w}w`).join(", "),
      sizes: profile.sizes,
    };
  }

  const localBase = localResponsiveBase(resolvedUrl);
  if (localBase) {
    return {
      src: `${localBase}-w${profile.defaultWidth}.webp`,
      srcset: profile.widths.map((w) => `${localBase}-w${w}.webp ${w}w`).join(", "),
      sizes: profile.sizes,
    };
  }

  return { src: resolvedUrl };
}

/**
 * @param {HTMLImageElement} img
 * @param {string} resolvedUrl
 * @param {SiteImageProfile | string} profileKey
 */
export function applySiteImageDeliveryToElement(img, resolvedUrl, profileKey) {
  const { src, srcset, sizes } = buildSiteImageDelivery(resolvedUrl, normalizeSiteImageProfile(profileKey));
  img.src = src;

  if (srcset) {
    img.srcset = srcset;
    img.sizes = sizes ?? "";
  } else {
    img.removeAttribute("srcset");
    img.removeAttribute("sizes");
  }

  if (
    /drive\.google\.com\//i.test(resolvedUrl) ||
    /googleusercontent\.com/i.test(resolvedUrl) ||
    /drive\.usercontent\.google\.com/i.test(resolvedUrl) ||
    /googleusercontent\.com/i.test(src)
  ) {
    img.referrerPolicy = "no-referrer";
  }
}

/**
 * @param {string} resolvedUrl
 * @param {SiteImageProfile | string} profileKey
 * @returns {string}
 */
export function siteImageSrcForProfile(resolvedUrl, profileKey) {
  return buildSiteImageDelivery(resolvedUrl, profileKey).src;
}
