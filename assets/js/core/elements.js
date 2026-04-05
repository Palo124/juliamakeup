/**
 * Cached DOM references. Safe to import after DOM is ready (script at end of `<body>`).
 */
export const elements = {
  menuToggle: document.querySelector(".menu-toggle"),
  siteNav: document.querySelector(".site-nav"),
  tabButtons: document.querySelectorAll(".tab-button"),
  registerForm: document.getElementById("register-form"),
  loginForm: document.getElementById("login-form"),
  reservationForm: document.getElementById("reservation-form"),
  accountPanel: document.getElementById("account-panel"),
  accountName: document.getElementById("account-name"),
  logoutButton: document.getElementById("logout-button"),
  calendarGrid: document.getElementById("calendar-grid"),
  calendarMonthLabel: document.getElementById("calendar-month-label"),
  calPrev: document.getElementById("cal-prev"),
  calNext: document.getElementById("cal-next"),
  slotsHint: document.getElementById("slots-hint"),
  slotsChips: document.getElementById("slots-chips"),
  reservationDateInput: document.getElementById("reservation-date-input"),
  reservationTimeInput: document.getElementById("reservation-time-input"),
  myReservationsPanel: document.getElementById("my-reservations"),
  myReservationsList: document.getElementById("my-reservations-list"),
  myReservationsEmpty: document.getElementById("my-reservations-empty"),
};
