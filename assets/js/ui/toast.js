import { t } from "../i18n.js";
import { TOAST_MS } from "../core/constants.js";

/**
 * @param {string} message
 * @param {"info" | "success" | "error"} [type]
 * @param {{ title?: string, durationMs?: number }} [options]
 */
export function showToast(message, type = "info", options = {}) {
  const { title = "", durationMs = TOAST_MS } = options;
  let region = document.getElementById("toast-region");
  if (!region) {
    region = document.createElement("div");
    region.id = "toast-region";
    region.className = "toast-region";
    region.setAttribute("aria-live", "polite");
    region.setAttribute("aria-atomic", "false");
    document.body.appendChild(region);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.setAttribute("role", "status");

  const inner = document.createElement("div");
  inner.className = "toast-inner";

  const copy = document.createElement("div");
  copy.className = "toast-copy";

  if (title) {
    const heading = document.createElement("p");
    heading.className = "toast-title";
    heading.textContent = title;
    copy.append(heading);
  }

  const text = document.createElement("p");
  text.className = title ? "toast-detail" : "toast-message";
  text.textContent = message;

  copy.append(text);

  const close = document.createElement("button");
  close.type = "button";
  close.className = "toast-close";
  close.setAttribute("aria-label", t("toast.dismiss"));
  close.textContent = "\u00d7";

  inner.append(copy, close);
  toast.append(inner);
  region.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("toast--visible");
  });

  let dismissed = false;
  function dismiss() {
    if (dismissed) {
      return;
    }
    dismissed = true;
    clearTimeout(timer);
    toast.classList.remove("toast--visible");
    toast.classList.add("toast--leaving");
    setTimeout(() => toast.remove(), 280);
  }

  const timer = setTimeout(dismiss, durationMs);
  close.addEventListener("click", dismiss);
}
