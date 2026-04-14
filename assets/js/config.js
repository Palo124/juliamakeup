/**
 * Environment and integration settings. Edit here (not in app logic).
 */
export const CONFIG = {
  /**
   * Booking API (same spreadsheet as `Availability` + `Reservations` tabs — see `backend/google-apps-script.gs`).
   * Deploy the script as a Web app and paste the `/exec` URL here.
   */
  bookingScriptUrl: "https://script.google.com/macros/s/AKfycbwh3mGqa31m6-QLv8UtdR8NfGHiP9GYdjNQpGOCI9I_KdC8Dot3Dd09WITBOh3qbOub/exec",
  useSheetBooking: true,

  /**
   * Site copy + optional image URLs from Google Sheets (separate spreadsheet + Apps Script).
   * Tabs: `ENG`, `SK`, and optional `IMG` (key → url). See `google-apps-script/site-texts/`.
   */
  contentScriptUrl: "https://script.google.com/macros/s/AKfycbyxv0dPe_Qg6EZL3HM_IaKcHehlTAYHOXaFcn2dVZp1Y--EnrsiDkXu06KDcnQrf0mz/exec",
  useSheetTexts: true,

  /**
   * Google Drive thumbnail `sz=` for sheet-driven images (`/thumbnail?id=…&sz=…`).
   * `w256` looks soft on full-width heroes; `w1920` is a better default (more bandwidth).
   */
  driveImageThumbnailSz: "w1920",

  /**
   * Contact section map: paste the full `src` URL from Google Maps
   * (Share → Embed a map → copy HTML). Shows a pin for that place.
   * Placeholder below centers on Bratislava until you replace it.
   */
  googleMapsEmbedUrl:
    "https://maps.google.com/maps?q=Bratislava%2C+Slovakia&t=&z=14&ie=UTF8&iwloc=&output=embed",

  /** Footer social links — replace with your profile URLs. */
  social: {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
    x: "https://x.com/",
  },
};
