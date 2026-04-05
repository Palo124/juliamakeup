import { CONFIG } from "../config.js";

export function initContactMap() {
  const frame = document.getElementById("contact-map-frame");
  const url = CONFIG.googleMapsEmbedUrl?.trim();
  if (frame && url) {
    frame.src = url;
  }
}
