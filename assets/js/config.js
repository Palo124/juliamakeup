/**
 * Environment and integration settings. Edit here (not in app logic).
 */
export const CONFIG = {
  /** Public site origin (no trailing slash). Used for canonical URLs, Open Graph, sitemap. */
  siteUrl: "https://julierebeauty.com",

  /** Default share image — path relative to site root (1200×630+ recommended; hero portrait works). */
  seoOgImage: "assets/img/IMG_5886.jpeg",

  /**
   * Booking API (same spreadsheet as `Availability` + `Reservations` tabs — see `backend/apps-script-booking/`).
   * Deploy the script as a Web app and paste the `/exec` URL here.
   */
  bookingScriptUrl: "https://script.google.com/macros/s/AKfycbymkvl15hM-zHqt-YElyRcC4an58RXlv6Cu4aorqzcovn-PKjWEy5XySB3HaeH0BWWY/exec",
  useSheetBooking: true,

  /**
   * Site copy from Google Sheets (no Apps Script). Tabs: **`ENG`**, **`SK`**.
   * Row layout: `key` | `text` | optional **`imageUrl`** (column C on **SK** only — drives `data-site-img`
   * URLs; see `site-text-csv.js` → `SK_CSV_ROW_KEY_TO_SITE_IMG_KEY`). Same layout as `google-apps-script/site-texts/TEMPLATE.md`.
   *
   * **Recommended — Publish entire document:** File → Share → **Publish to the web** → publish the
   * **Entire document**. Copy the id from the link (`…/spreadsheets/d/e/THIS_LONG_ID/pubhtml`) into
   * `contentPublishedSpreadsheetId`. Open each tab (**ENG**, **SK**) in the editor and copy
   * its `gid` from the URL (`…#gid=123456789`) into `contentSheetGids`. The site builds CSV URLs
   * automatically.
   *
   * **Optional:** set `contentCsvUrls.en` / `.sk` to full CSV URLs — they override the
   * published id for that tab (e.g. if you use `/export?format=csv` instead).
   */
  contentPublishedSpreadsheetId:
    "2PACX-1vQ6sVIFjIeKX_I1i_cf7TgCS3nYVdtZjfMVDWdB5ir8tMN1rxk5h4MAvM2VsKS5q_G3YGh8LAMLusaA",
  /** Open the spreadsheet in the editor (not pubhtml), click each tab, copy `#gid=…` from the URL. */
  contentSheetGids: {
    en: "1596156131",
    sk: "545201391",
  },
  contentCsvUrls: {
    en: "",
    sk: "",
  },
  useSheetTexts: true,

  /**
   * Google Drive image `sz=` token for sheet-driven images (`lh3.googleusercontent.com/d/{id}={sz}`).
   * `w256` looks soft on full-width heroes; `w1920` is a better default (more bandwidth).
   */
  driveImageThumbnailSz: "w1920",

  /**
   * Contact section map: paste the full `src` URL from Google Maps
   * (Share → Embed a map → copy HTML). Shows a pin for that place.
   * Račianska 66, 831 02 Bratislava (same coords as Google Maps place link).
   */
  googleMapsEmbedUrl:
    "https://maps.google.com/maps?q=48.1789721%2C17.1287973&t=&z=18&ie=UTF8&iwloc=&output=embed",

  /** Footer social profile URLs (fallback if ENG/SK sheet keys `footer.social*Url` are empty). */
  social: {
    instagram: "https://www.instagram.com/julierebeauty/",
    facebook: "https://www.facebook.com/",
    x: "https://x.com/",
  },
};
