import { CONFIG } from "../config.js";

export function initContactMap() {
  const frame = document.getElementById("contact-map-frame");
  const url = CONFIG.googleMapsEmbedUrl?.trim();
  if (!frame || !url || frame.src) {
    return;
  }

  const load = () => {
    if (!frame.src) {
      frame.src = url;
    }
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          load();
          observer.disconnect();
        }
      },
      { rootMargin: "240px" },
    );
    observer.observe(frame);
    return;
  }

  load();
}
