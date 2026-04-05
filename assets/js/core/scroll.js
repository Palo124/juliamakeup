/** Main page scroll container (`#site-scroll-snap`); falls back to `window` when missing. */
export function getSiteScrollRoot() {
  return document.getElementById("site-scroll-snap");
}
