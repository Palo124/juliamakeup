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
   * Placeholder below centers on Bratislava until you replace it.
   */
  googleMapsEmbedUrl:
    "https://maps.google.com/maps?q=Bratislava%2C+Slovakia&t=&z=14&ie=UTF8&iwloc=&output=embed",

  /** Footer social profile URLs (fallback if ENG/SK sheet keys `footer.social*Url` are empty). */
  social: {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
    x: "https://x.com/",
  },
};
