import { t } from "../i18n.js";
import { TOAST_MS } from "../core/constants.js";

export function showToast(message, type = "info") {
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

  const text = document.createElement("p");
  text.className = "toast-message";
  text.textContent = message;

  const close = document.createElement("button");
  close.type = "button";
  close.className = "toast-close";
  close.setAttribute("aria-label", t("toast.dismiss"));
  close.textContent = "\u00d7";

  inner.append(text, close);
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

  const timer = setTimeout(dismiss, TOAST_MS);
  close.addEventListener("click", dismiss);
}
