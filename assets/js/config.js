/**
 * Environment and integration settings. Edit here (not in app logic).
 */
export const CONFIG = {
  googleScriptUrl:
    "https://script.google.com/macros/s/AKfycbz1GmhIy1UbvXEu1flV01q7PVDyJx1NWHVGN_Glj6_FklD7XfZHKkyh6FoihfrHA7lz/exec",
  useGoogleSheets: true,
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
