import { CONFIG } from "../config.js";
import { getHomeInstagramEmbedPermalinks } from "../i18n.js";

const EMBED_SCRIPT_SRC = "https://www.instagram.com/embed.js";
const MOBILE_MAX_WIDTH = "(max-width: 899px)";
const PERMALINK_RE =
  /^https:\/\/(www\.)?instagram\.com\/(?:[A-Za-z0-9_.]+\/)?(?:p|reel|tv)\/[A-Za-z0-9_-]+\/?(?:\?.*)?$/;

/** @type {Promise<void> | null} */
let embedScriptPromise = null;
/** @type {IntersectionObserver | null} */
let visibilityObserver = null;
let langListenerBound = false;
let viewportListenerBound = false;
let embedsActivated = false;
/** @type {string | null} */
let mobileRandomPermalink = null;
/** @type {string} */
let lastRenderedKey = "";

function isMobileViewport() {
  return window.matchMedia(MOBILE_MAX_WIDTH).matches;
}

/**
 * @param {string} url
 */
function isValidPermalink(url) {
  return PERMALINK_RE.test(url.trim());
}

/**
 * Instagram embed.js expects short permalinks (`/reel/ID/`, not `/user/reel/ID/`).
 * @param {string} url
 */
function canonicalEmbedPermalink(url) {
  const trimmed = url.trim();
  if (!isValidPermalink(trimmed)) {
    return "";
  }

  try {
    const parsed = new URL(trimmed);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const typeIndex = parts.findIndex((part) => part === "p" || part === "reel" || part === "tv");
    if (typeIndex === -1) {
      return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
    }

    const type = parts[typeIndex];
    const id = parts[typeIndex + 1];
    if (!id) {
      return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
    }

    return `https://www.instagram.com/${type}/${id}/`;
  } catch {
    return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
  }
}

function collectPermalinks() {
  return getHomeInstagramEmbedPermalinks().map(canonicalEmbedPermalink).filter(Boolean);
}

/** On phone: one random post per visit; on tablet/desktop: show all configured embeds. */
function permalinksForViewport(allPermalinks) {
  if (allPermalinks.length <= 1) {
    return allPermalinks;
  }

  if (!isMobileViewport()) {
    mobileRandomPermalink = null;
    return allPermalinks;
  }

  if (!mobileRandomPermalink || !allPermalinks.includes(mobileRandomPermalink)) {
    const index = Math.floor(Math.random() * allPermalinks.length);
    mobileRandomPermalink = allPermalinks[index];
  }

  return mobileRandomPermalink ? [mobileRandomPermalink] : [];
}

/**
 * @param {string} permalink
 */
function createEmbedBlockquote(permalink) {
  const blockquote = document.createElement("blockquote");
  blockquote.className = "instagram-media";
  blockquote.setAttribute("data-instgrm-permalink", permalink);
  blockquote.setAttribute("data-instgrm-version", "14");
  return blockquote;
}

function loadEmbedScript() {
  if (embedScriptPromise) {
    return embedScriptPromise;
  }

  embedScriptPromise = new Promise((resolve, reject) => {
    if (window.instgrm?.Embeds) {
      resolve();
      return;
    }

    const existing = document.querySelector(`script[src="${EMBED_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Instagram embed script failed")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = EMBED_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Instagram embed script failed"));
    document.body.appendChild(script);
  });

  return embedScriptPromise;
}

function processEmbeds() {
  window.instgrm?.Embeds?.process();
}

function activateEmbeds() {
  if (embedsActivated) {
    processEmbeds();
    return;
  }

  embedsActivated = true;
  void loadEmbedScript()
    .then(() => {
      processEmbeds();
      requestAnimationFrame(processEmbeds);
    })
    .catch(() => {
      embedsActivated = false;
    });
}

/**
 * @param {HTMLElement} container
 * @param {string[]} permalinks
 */
function renderEmbeds(container, permalinks) {
  container.replaceChildren();
  permalinks.forEach((permalink) => {
    const wrap = document.createElement("div");
    wrap.className = "home-instagram-embed";

    const fallback = document.createElement("a");
    fallback.className = "home-instagram-fallback";
    fallback.href = permalink;
    fallback.target = "_blank";
    fallback.rel = "noopener noreferrer";
    fallback.textContent = "Instagram";

    wrap.append(fallback, createEmbedBlockquote(permalink));
    container.appendChild(wrap);
  });
}

function scheduleEmbedActivation(section) {
  if (embedsActivated) {
    processEmbeds();
    return;
  }

  if (visibilityObserver) {
    return;
  }

  const start = () => activateEmbeds();

  if ("IntersectionObserver" in window) {
    visibilityObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          start();
          visibilityObserver?.disconnect();
          visibilityObserver = null;
        }
      },
      { rootMargin: "480px" },
    );
    visibilityObserver.observe(section);
    return;
  }

  start();
}

export function refreshInstagramEmbeds() {
  const section = document.getElementById("home-instagram");
  const container = document.getElementById("home-instagram-embeds");
  if (!section || !container) {
    return;
  }

  if (!CONFIG.showHomeInstagramEmbeds) {
    section.hidden = true;
    container.replaceChildren();
    container.classList.remove("home-instagram-grid--single");
    lastRenderedKey = "";
    return;
  }

  const allPermalinks = collectPermalinks();
  if (!allPermalinks.length) {
    section.hidden = true;
    container.replaceChildren();
    container.classList.remove("home-instagram-grid--single");
    lastRenderedKey = "";
    return;
  }

  const permalinks = permalinksForViewport(allPermalinks);
  const renderKey = permalinks.join("|");
  section.hidden = false;
  container.classList.toggle("home-instagram-grid--single", permalinks.length === 1);

  if (renderKey !== lastRenderedKey) {
    renderEmbeds(container, permalinks);
    lastRenderedKey = renderKey;
    if (embedsActivated) {
      activateEmbeds();
    }
  }

  scheduleEmbedActivation(section);
}

function bindViewportListener() {
  if (viewportListenerBound) {
    return;
  }
  viewportListenerBound = true;
  window.matchMedia(MOBILE_MAX_WIDTH).addEventListener("change", () => {
    mobileRandomPermalink = null;
    lastRenderedKey = "";
    refreshInstagramEmbeds();
  });
}

export function initInstagramEmbeds() {
  if (!CONFIG.showHomeInstagramEmbeds) {
    refreshInstagramEmbeds();
    return;
  }

  if (!langListenerBound) {
    langListenerBound = true;
    window.addEventListener("juliamakeup:lang", refreshInstagramEmbeds);
  }
  bindViewportListener();
  refreshInstagramEmbeds();
}
