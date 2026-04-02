/**
 * Environment and integration settings. Edit here (not in app logic).
 */
export const CONFIG = {
  googleScriptUrl:
    "https://script.google.com/macros/s/AKfycbyl0jiVcdu5WVN0kHqmxVrqcNqeAtGCa9rK_yzsrTCJhTDkXKhXyQE73D1Vyyhe4kK1/exec",
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
