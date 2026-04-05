/**
 * Environment and integration settings. Edit here (not in app logic).
 */
export const CONFIG = {
  googleScriptUrl:
    "https://script.google.com/macros/s/AKfycbz1GmhIy1UbvXEu1flV01q7PVDyJx1NWHVGN_Glj6_FklD7XfZHKkyh6FoihfrHA7lz/exec",
  useGoogleSheets: true,

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
};

/**
 * Booking rules: how far ahead clients can book and which hours are offered per weekday.
 * Weekday: 0 = Sunday … 6 = Saturday.
 */
export const BOOKING = {
  horizonDays: 90,
  slotHoursByWeekday: {
    0: [],
    1: [9, 10, 11, 12, 13, 14, 15, 16, 17],
    2: [9, 10, 11, 12, 13, 14, 15, 16, 17],
    3: [9, 10, 11, 12, 13, 14, 15, 16, 17],
    4: [9, 10, 11, 12, 13, 14, 15, 16, 17],
    5: [9, 10, 11, 12, 13, 14, 15, 16, 17],
    6: [9, 10, 11, 12, 13],
  },
};
