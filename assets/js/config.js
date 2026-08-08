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
   * Site copy from Google Sheets (no Apps Script). Tab **`SK`** is required; **`ENG`** is optional.
   * Row layout: `key` | `text` | optional **`imageUrl`** (column C on **SK** only — drives `data-site-img`
   * URLs; see `site-text-csv.js` → `SK_CSV_ROW_KEY_TO_SITE_IMG_KEY`). Same layout as `google-apps-script/site-texts/TEMPLATE.md`.
   *
   * **Recommended — Publish entire document:** File → Share → **Publish to the web** → publish the
   * **Entire document**. Copy the id from the link (`…/spreadsheets/d/e/THIS_LONG_ID/pubhtml`) into
   * `contentPublishedSpreadsheetId`. Open the **SK** tab in the editor and copy its `gid` from the
   * URL (`…#gid=123456789`) into `contentSheetGids.sk` (leave `.en` empty if there is no ENG tab).
   * automatically.
   *
   * **Optional:** set `contentCsvUrls.en` / `.sk` to full CSV URLs — they override the
   * published id for that tab (e.g. if you use `/export?format=csv` instead).
   */
  contentPublishedSpreadsheetId:
    "2PACX-1vQ6sVIFjIeKX_I1i_cf7TgCS3nYVdtZjfMVDWdB5ir8tMN1rxk5h4MAvM2VsKS5q_G3YGh8LAMLusaA",
  /** Open the spreadsheet in the editor (not pubhtml), click each tab, copy `#gid=…` from the URL. */
  contentSheetGids: {
    en: "",
    sk: "545201391",
  },
  contentCsvUrls: {
    en: "",
    sk: "",
  },
  useSheetTexts: true,

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

  /** Footer social profile URLs (fallback if ENG/SK sheet keys `footer.social*Url` are empty). */
  social: {
    instagram: "https://www.instagram.com/julierebeauty/",
    facebook: "https://www.facebook.com/",
    x: "https://x.com/",
  },
};
