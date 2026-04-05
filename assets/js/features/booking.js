import { BOOKING } from "../config.js";
import { getDateLocale, t } from "../i18n.js";
import { STORAGE_KEYS } from "../core/constants.js";
import { readStorage, writeStorage } from "../core/storage.js";
import { pad2, formatDateKey, parseDateKey, startOfLocalDay } from "../core/dates.js";
import { state, bookingState } from "../core/state.js";
import { elements } from "../core/elements.js";
import { syncAction } from "../services/sheets.js";
import { showToast } from "../ui/toast.js";

function newReservationId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function formatReservationWhenLabel(dateStr, timeStr) {
  if (!dateStr || !timeStr) {
    return "";
  }

  const dateObj = parseDateKey(dateStr);
  const datePart = dateObj.toLocaleDateString(getDateLocale(), {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${datePart} · ${timeStr}`;
}

function reservationBelongsToUser(reservation, userEmail) {
  const normalized = userEmail.toLowerCase();
  const account = (reservation.accountEmail || "").toString().toLowerCase();
  const bookingEmail = (reservation.email || "").toString().toLowerCase();

  return account === normalized || bookingEmail === normalized;
}

function getMyReservationsList() {
  if (!state.currentUser) {
    return [];
  }

  const email = state.currentUser.email.toLowerCase();
  const all = readStorage(STORAGE_KEYS.reservations, []);

  return all.filter((reservation) => reservationBelongsToUser(reservation, email));
}

function findReservationIndex(all, target) {
  return all.findIndex((reservation) => {
    if (target.id && reservation.id) {
      return reservation.id === target.id;
    }

    const targetAccount = (target.accountEmail || target.email || "").toString().toLowerCase();

    return (
      (reservation.date || "") === (target.date || "") &&
      (reservation.time || "") === (target.time || "") &&
      (reservation.accountEmail || reservation.email || "").toString().toLowerCase() === targetAccount
    );
  });
}

async function cancelMyReservation(target) {
  const all = readStorage(STORAGE_KEYS.reservations, []);
  const index = findReservationIndex(all, target);

  if (index === -1) {
    showToast(t("toast.bookingNotFound"), "error");
    return;
  }

  const row = all[index];

  try {
    await syncAction("cancelReservation", {
      accountEmail: row.accountEmail || row.email,
      date: row.date,
      time: row.time,
    });
  } catch (error) {
    showToast(error.message, "error");
    return;
  }

  all.splice(index, 1);
  writeStorage(STORAGE_KEYS.reservations, all);
  showToast(t("toast.bookingCancelled"), "success");
  renderMyReservations();
  renderBookingCalendar();
  renderBookingSlots();
}

export function renderMyReservations() {
  const panel = elements.myReservationsPanel;
  const list = elements.myReservationsList;
  const emptyEl = elements.myReservationsEmpty;

  if (!panel || !list || !emptyEl) {
    return;
  }

  if (!state.currentUser) {
    panel.classList.add("hidden");
    return;
  }

  panel.classList.remove("hidden");
  const mine = getMyReservationsList();

  mine.sort((a, b) => {
    const byDate = (a.date || "").localeCompare(b.date || "");
    if (byDate !== 0) {
      return byDate;
    }

    return (a.time || "").localeCompare(b.time || "");
  });

  list.innerHTML = "";

  if (mine.length === 0) {
    emptyEl.classList.remove("hidden");
  } else {
    emptyEl.classList.add("hidden");
  }

  for (const reservation of mine) {
    const item = document.createElement("li");
    item.className = "my-reservations-item";

    const meta = document.createElement("div");
    meta.className = "my-reservations-meta";

    const title = document.createElement("strong");
    title.textContent = reservation.service || t("myRes.bookingFallback");

    const when = document.createElement("span");
    when.textContent = formatReservationWhenLabel(reservation.date, reservation.time);

    meta.append(title, when);

    if (reservation.phone) {
      const phone = document.createElement("span");
      phone.textContent = `${t("myRes.phonePrefix")} ${reservation.phone}`;
      meta.append(phone);
    }

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "button button-danger button-small";
    cancelButton.textContent = t("myRes.cancel");
    cancelButton.addEventListener("click", () => {
      void cancelMyReservation(reservation);
    });

    item.append(meta, cancelButton);
    list.appendChild(item);
  }
}

function getBookedSlotKeys() {
  const reservations = readStorage(STORAGE_KEYS.reservations, []);
  const set = new Set();

  for (const reservation of reservations) {
    if (reservation.date && reservation.time) {
      set.add(`${reservation.date}|${reservation.time}`);
    }
  }

  return set;
}

function getSlotTimesForDateKey(dateKey) {
  const date = parseDateKey(dateKey);
  const weekday = date.getDay();
  const hours = BOOKING.slotHoursByWeekday[weekday] || [];

  return hours.map((hour) => `${pad2(hour)}:00`);
}

function isDateSelectable(dateKey) {
  const date = parseDateKey(dateKey);
  const today = startOfLocalDay(new Date());
  const lastBookable = new Date(today);
  lastBookable.setDate(lastBookable.getDate() + BOOKING.horizonDays);

  if (date < today || date > lastBookable) {
    return false;
  }

  return getSlotTimesForDateKey(dateKey).length > 0;
}

function setBookingMonthFromDate(date) {
  bookingState.viewYear = date.getFullYear();
  bookingState.viewMonth = date.getMonth();
}

export function resetBookingPicker() {
  bookingState.selectedDate = null;
  bookingState.selectedTime = null;

  if (elements.reservationDateInput) {
    elements.reservationDateInput.value = "";
  }

  if (elements.reservationTimeInput) {
    elements.reservationTimeInput.value = "";
  }

  if (elements.slotsHint) {
    elements.slotsHint.textContent = t("slots.hintNone");
  }

  if (elements.slotsChips) {
    elements.slotsChips.innerHTML = "";
  }

  setBookingMonthFromDate(new Date());
  renderBookingCalendar();
}

export function renderBookingCalendar() {
  if (!elements.calendarGrid || !elements.calendarMonthLabel) {
    return;
  }

  const { viewYear, viewMonth } = bookingState;
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startPad = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const today = startOfLocalDay(new Date());
  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  elements.calendarMonthLabel.textContent = firstOfMonth.toLocaleDateString(getDateLocale(), {
    month: "long",
    year: "numeric",
  });

  elements.calendarGrid.innerHTML = "";

  const appendDayButton = (day) => {
    const dateKey = formatDateKey(viewYear, viewMonth, day);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    button.textContent = String(day);
    button.setAttribute("role", "gridcell");

    if (dateKey === todayKey) {
      button.classList.add("is-today");
    }

    if (dateKey === bookingState.selectedDate) {
      button.classList.add("is-selected");
    }

    if (!isDateSelectable(dateKey)) {
      button.classList.add("is-disabled");
      button.disabled = true;
      button.title = t("cal.noAvailability");
    } else {
      button.addEventListener("click", () => selectBookingDate(dateKey));
    }

    elements.calendarGrid.appendChild(button);
  };

  for (let index = 0; index < startPad; index += 1) {
    const placeholder = document.createElement("div");
    placeholder.className = "calendar-day is-outside";
    placeholder.setAttribute("aria-hidden", "true");
    elements.calendarGrid.appendChild(placeholder);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    appendDayButton(day);
  }

  const totalCells = startPad + daysInMonth;
  const trailing = (7 - (totalCells % 7)) % 7;

  for (let index = 0; index < trailing; index += 1) {
    const placeholder = document.createElement("div");
    placeholder.className = "calendar-day is-outside";
    placeholder.setAttribute("aria-hidden", "true");
    elements.calendarGrid.appendChild(placeholder);
  }

  updateCalendarNavState();
}

function updateCalendarNavState() {
  if (!elements.calPrev || !elements.calNext) {
    return;
  }

  const today = startOfLocalDay(new Date());
  const lastBookable = new Date(today);
  lastBookable.setDate(lastBookable.getDate() + BOOKING.horizonDays);

  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastBookableMonthStart = new Date(lastBookable.getFullYear(), lastBookable.getMonth(), 1);
  const viewMonthStart = new Date(bookingState.viewYear, bookingState.viewMonth, 1);

  elements.calPrev.disabled = viewMonthStart.getTime() <= currentMonthStart.getTime();
  elements.calNext.disabled = viewMonthStart.getTime() >= lastBookableMonthStart.getTime();
}

function shiftBookingMonth(delta) {
  const next = new Date(bookingState.viewYear, bookingState.viewMonth + delta, 1);
  bookingState.viewYear = next.getFullYear();
  bookingState.viewMonth = next.getMonth();

  if (bookingState.selectedDate) {
    const selected = parseDateKey(bookingState.selectedDate);

    if (selected.getFullYear() !== bookingState.viewYear || selected.getMonth() !== bookingState.viewMonth) {
      bookingState.selectedDate = null;
      bookingState.selectedTime = null;

      if (elements.reservationDateInput) {
        elements.reservationDateInput.value = "";
      }

      if (elements.reservationTimeInput) {
        elements.reservationTimeInput.value = "";
      }

      if (elements.slotsHint) {
        elements.slotsHint.textContent = t("slots.hintNone");
      }

      if (elements.slotsChips) {
        elements.slotsChips.innerHTML = "";
      }
    }
  }

  renderBookingCalendar();
}

function selectBookingDate(dateKey) {
  bookingState.selectedDate = dateKey;
  bookingState.selectedTime = null;

  if (elements.reservationDateInput) {
    elements.reservationDateInput.value = dateKey;
  }

  if (elements.reservationTimeInput) {
    elements.reservationTimeInput.value = "";
  }

  const label = parseDateKey(dateKey).toLocaleDateString(getDateLocale(), {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (elements.slotsHint) {
    elements.slotsHint.textContent = t("slots.hintFor", { date: label });
  }

  renderBookingSlots();
  renderBookingCalendar();
}

export function renderBookingSlots() {
  if (!elements.slotsChips) {
    return;
  }

  elements.slotsChips.innerHTML = "";

  if (!bookingState.selectedDate) {
    return;
  }

  const booked = getBookedSlotKeys();
  const times = getSlotTimesForDateKey(bookingState.selectedDate);

  for (const time of times) {
    const key = `${bookingState.selectedDate}|${time}`;
    const isBooked = booked.has(key);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "slot-chip";
    button.textContent = time;
    button.dataset.time = time;

    if (isBooked) {
      button.classList.add("is-booked");
      button.disabled = true;
      button.title = t("slots.booked");
    } else {
      if (time === bookingState.selectedTime) {
        button.classList.add("is-selected");
      }

      button.addEventListener("click", () => selectBookingSlot(time));
    }

    elements.slotsChips.appendChild(button);
  }

  const openSlots = times.filter((time) => !booked.has(`${bookingState.selectedDate}|${time}`));

  if (openSlots.length === 0 && elements.slotsHint) {
    elements.slotsHint.textContent = t("slots.noOpen");
  }
}

function selectBookingSlot(time) {
  bookingState.selectedTime = time;

  if (elements.reservationTimeInput) {
    elements.reservationTimeInput.value = time;
  }

  renderBookingSlots();
}

export function initBookingCalendar() {
  if (!elements.calendarGrid) {
    return;
  }

  setBookingMonthFromDate(new Date());
  renderBookingCalendar();

  if (elements.calPrev) {
    elements.calPrev.addEventListener("click", () => shiftBookingMonth(-1));
  }

  if (elements.calNext) {
    elements.calNext.addEventListener("click", () => shiftBookingMonth(1));
  }
}

export function updateAccountUI() {
  const hasUser = Boolean(state.currentUser);
  elements.accountPanel.classList.toggle("hidden", !hasUser);

  if (hasUser) {
    elements.accountName.textContent = state.currentUser.name;
    elements.reservationForm.elements.name.value = state.currentUser.name;
    elements.reservationForm.elements.email.value = state.currentUser.email;
  }

  renderMyReservations();
}

export async function handleReservation(event) {
  event.preventDefault();

  const formData = new FormData(elements.reservationForm);
  const reservation = Object.fromEntries(formData.entries());
  const date = reservation.date?.toString().trim();
  const time = reservation.time?.toString().trim();

  if (!date || !time) {
    showToast(t("toast.pickSlot"), "error");
    return;
  }

  const slotKey = `${date}|${time}`;

  if (getBookedSlotKeys().has(slotKey)) {
    showToast(t("toast.slotTaken"), "error");
    renderBookingSlots();
    renderBookingCalendar();
    return;
  }

  reservation.createdAt = new Date().toISOString();
  reservation.accountEmail = state.currentUser?.email || reservation.email;
  reservation.id = newReservationId();

  const reservations = readStorage(STORAGE_KEYS.reservations, []);
  reservations.push(reservation);
  writeStorage(STORAGE_KEYS.reservations, reservations);

  try {
    await syncAction("reservation", { reservation });
    const dateLabel = parseDateKey(date).toLocaleDateString(getDateLocale(), {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    elements.reservationForm.reset();
    resetBookingPicker();
    updateAccountUI();
    renderMyReservations();
    showToast(t("toast.reservationSaved", { date: dateLabel, time }), "success");
  } catch (error) {
    reservations.pop();
    writeStorage(STORAGE_KEYS.reservations, reservations);
    renderBookingCalendar();
    renderBookingSlots();
    showToast(error.message, "error");
  }
}

export function bindReservationForm() {
  elements.reservationForm.addEventListener("submit", handleReservation);
}
