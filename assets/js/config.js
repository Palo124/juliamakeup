/**
 * Environment and integration settings. Edit here (not in app logic).
 */
export const CONFIG = {
  /** Public site origin (no trailing slash). Used for canonical URLs, Open Graph, sitemap. */
  siteUrl: "https://julierebeauty.com",

  /** Default share image — same source as `about.portrait` (Drive → lh3 thumbnail). */
  seoOgImage:
    "https://drive.google.com/file/d/1M2SYG3WTJjP0mbKm1NRF6RmLeXj2aKRI/view?usp=sharing",

  /**
   * Booking write API — POST createReservation, email/approval token links.
   * Deploy `backend/apps-script-booking/` as a Web app and paste the `/exec` URL here.
   */
  bookingScriptUrl: "https://script.google.com/macros/s/AKfycbymkvl15hM-zHqt-YElyRcC4an58RXlv6Cu4aorqzcovn-PKjWEy5XySB3HaeH0BWWY/exec",
  /**
   * Booking read API — GET getAvailability only (lighter cold start).
   * Deploy `backend/apps-script-booking-read/` as a separate Web app. Falls back to bookingScriptUrl when empty.
   */
  bookingReadScriptUrl: "https://script.google.com/macros/s/AKfycbxxVFVuV8SGgcWqyLBZHRETjsMAaecgwveBW4ftTyFeOPaMq3lErPe9waLOZO5Q7EX_7w/exec",
  /** When true, booking form is hidden and visitors see a contact-the-studio message instead. */
  bookingMaintenanceMode: false,
  useSheetBooking: true,

  /**
   * Legacy default width when no `data-site-img-profile` is used (gallery/lightbox fallbacks).
   * Page images use profile widths in `assets/js/site-image-delivery.js` instead of this global size.
   */
  driveImageThumbnailSz: "w1920",

  /**
   * Contact section map: embed `src` (Share → Embed a map in Google Maps, or lat/lng from the place pin).
   * Place: Juliére Beauty — https://maps.app.goo.gl/Ukzo9ACBMrebJvbVA
   */
  googleMapsEmbedUrl:
    "https://maps.google.com/maps?q=48.1791114%2C17.1289502&t=&z=17&ie=UTF8&iwloc=&output=embed",

  /**
   * Homepage Instagram embed strip (`#home-instagram`). Off by default — Meta embed.js is flaky
   * and needs valid `home.instagram.embed.N` permalinks. Footer IG link is unaffected.
   */
  showHomeInstagramEmbeds: false,

  /** Footer social profile URLs (fallback if bundled `footer.social*Url` keys are empty). */
  social: {
    instagram: "https://www.instagram.com/julierebeauty/",
    facebook: "https://www.facebook.com/",
  },
};
