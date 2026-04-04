import { CONFIG, BOOKING } from "./config.js";
import { initI18n, t, getDateLocale } from "./i18n.js";

const STORAGE_KEYS = {
  users: "juliamakeup-users",
  session: "juliamakeup-session",
  reservations: "juliamakeup-reservations",
};

const state = {
  currentUser: null,
};

const bookingState = {
  viewYear: null,
  viewMonth: null,
  selectedDate: null,
  selectedTime: null,
};

const elements = {
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

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

const TOAST_MS = 5200;

function showToast(message, type = "info") {
  let region = document.getElementById("toast-region");
  if (!region) {
    region = document.createElement("div");
    region.id = "toast-region";
    region.className = "toast-region";
    region.setAttribute("aria-live", "polite");
    region.setAttribute("aria-atomic", "false");
    document.body.appendChild(region);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.setAttribute("role", "status");

  const inner = document.createElement("div");
  inner.className = "toast-inner";

  const text = document.createElement("p");
  text.className = "toast-message";
  text.textContent = message;

  const close = document.createElement("button");
  close.type = "button";
  close.className = "toast-close";
  close.setAttribute("aria-label", t("toast.dismiss"));
  close.textContent = "\u00d7";

  inner.append(text, close);
  toast.append(inner);
  region.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("toast--visible");
  });

  let dismissed = false;
  function dismiss() {
    if (dismissed) {
      return;
    }
    dismissed = true;
    clearTimeout(timer);
    toast.classList.remove("toast--visible");
    toast.classList.add("toast--leaving");
    setTimeout(() => toast.remove(), 280);
  }

  const timer = setTimeout(dismiss, TOAST_MS);
  close.addEventListener("click", dismiss);
}

function toggleMobileMenu() {
  if (!elements.menuToggle || !elements.siteNav) {
    return;
  }

  const isOpen = elements.siteNav.classList.toggle("open");
  elements.menuToggle.setAttribute("aria-expanded", String(isOpen));
  elements.menuToggle.setAttribute("aria-label", isOpen ? t("header.closeMenu") : t("header.openMenu"));
}

function switchTab(targetTab) {
  elements.tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === targetTab;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  elements.registerForm.classList.toggle("active", targetTab === "register");
  elements.loginForm.classList.toggle("active", targetTab === "login");
}

function updateAccountUI() {
  const hasUser = Boolean(state.currentUser);
  elements.accountPanel.classList.toggle("hidden", !hasUser);

  if (hasUser) {
    elements.accountName.textContent = state.currentUser.name;
    elements.reservationForm.elements.name.value = state.currentUser.name;
    elements.reservationForm.elements.email.value = state.currentUser.email;
  }

  renderMyReservations();
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatDateKey(year, monthIndex, day) {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

function parseDateKey(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
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

function renderMyReservations() {
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

function resetBookingPicker() {
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

function renderBookingCalendar() {
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

function renderBookingSlots() {
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

function initBookingCalendar() {
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

async function postToGoogleSheets(payload) {
  const response = await fetch(CONFIG.googleScriptUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(t("toast.syncFailed"));
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(t("toast.badResponse"));
  }
}

async function syncAction(action, data) {
  if (CONFIG.useGoogleSheets && CONFIG.googleScriptUrl) {
    const result = await postToGoogleSheets({ action, ...data });

    if (result && result.ok === false) {
      throw new Error(result.message || t("toast.sheetsFailed"));
    }

    return result;
  }

  return { ok: true, mode: "local" };
}

async function handleRegister(event) {
  event.preventDefault();

  const formData = new FormData(elements.registerForm);
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();

  const users = readStorage(STORAGE_KEYS.users, []);
  const alreadyExists = users.some((user) => user.email === email);

  if (alreadyExists) {
    showToast(t("toast.accountExists"), "error");
    return;
  }

  const user = { name, email, password };

  try {
    await syncAction("register", { user });
    users.push(user);
    writeStorage(STORAGE_KEYS.users, users);
    writeStorage(STORAGE_KEYS.session, user);
    state.currentUser = user;
    updateAccountUI();
    elements.registerForm.reset();
    showToast(t("toast.welcome", { name }), "success");
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function handleLogin(event) {
  event.preventDefault();

  const formData = new FormData(elements.loginForm);
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();

  const users = readStorage(STORAGE_KEYS.users, []);
  const user = users.find((entry) => entry.email === email && entry.password === password);

  if (!user) {
    showToast(t("toast.wrongLogin"), "error");
    return;
  }

  writeStorage(STORAGE_KEYS.session, user);
  state.currentUser = user;

  try {
    await syncAction("login", { email, password });
    updateAccountUI();
    elements.loginForm.reset();
    showToast(t("toast.signedIn", { name: state.currentUser.name }), "success");
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function handleReservation(event) {
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

function handleLogout() {
  localStorage.removeItem(STORAGE_KEYS.session);
  state.currentUser = null;
  elements.accountPanel.classList.add("hidden");
  elements.reservationForm.reset();
  resetBookingPicker();
  renderMyReservations();
  showToast(t("toast.signedOut"), "info");
}

function restoreSession() {
  state.currentUser = readStorage(STORAGE_KEYS.session, null);
  updateAccountUI();
}

function bindEvents() {
  if (elements.menuToggle) {
    elements.menuToggle.addEventListener("click", toggleMobileMenu);
  }

  elements.tabButtons.forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  elements.registerForm.addEventListener("submit", handleRegister);
  elements.loginForm.addEventListener("submit", handleLogin);
  elements.reservationForm.addEventListener("submit", handleReservation);
  elements.logoutButton.addEventListener("click", handleLogout);
}

function initHeroCarousel() {
  const track = document.getElementById("hero-carousel-track");
  const dotsRoot = document.getElementById("hero-carousel-dots");
  const prevButton = document.getElementById("hero-carousel-prev");
  const nextButton = document.getElementById("hero-carousel-next");

  if (!track || !dotsRoot) {
    return;
  }

  const slides = track.querySelectorAll(".hero-carousel-slide");
  const count = slides.length;

  if (count === 0) {
    return;
  }

  dotsRoot.innerHTML = "";

  let index = 0;
  let autoTimer = null;

  function go(targetIndex) {
    index = ((targetIndex % count) + count) % count;
    track.style.transform = `translateX(-${index * 100}vw)`;

    dotsRoot.querySelectorAll(".hero-carousel-dot").forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
      dot.setAttribute("aria-selected", String(dotIndex === index));
    });
  }

  for (let slideIndex = 0; slideIndex < count; slideIndex += 1) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = `hero-carousel-dot${slideIndex === 0 ? " is-active" : ""}`;
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", t("carousel.slideOf", { n: slideIndex + 1, total: count }));
    dot.setAttribute("aria-selected", slideIndex === 0 ? "true" : "false");
    dot.addEventListener("click", () => {
      go(slideIndex);
      restartAuto();
    });
    dotsRoot.append(dot);
  }

  function restartAuto() {
    clearInterval(autoTimer);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reduceMotion.matches) {
      return;
    }

    autoTimer = window.setInterval(() => {
      go(index + 1);
    }, 6500);
  }

  prevButton?.addEventListener("click", () => {
    go(index - 1);
    restartAuto();
  });

  nextButton?.addEventListener("click", () => {
    go(index + 1);
    restartAuto();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(autoTimer);
    } else {
      restartAuto();
    }
  });

  restartAuto();
}

function initHeaderScroll() {
  const header = document.querySelector(".site-header--hero");
  const hero = document.querySelector(".hero-carousel");
  const nav = document.getElementById("site-nav");
  const menuToggle = document.querySelector(".menu-toggle");

  if (!header || !hero) {
    return;
  }

  function onScroll() {
    const threshold = Math.max(hero.offsetHeight - 24, 0);
    const pastHero = window.scrollY > threshold;
    header.classList.toggle("site-header--past-hero", pastHero);

    if (!pastHero && nav?.classList.contains("open")) {
      nav.classList.remove("open");
      menuToggle?.setAttribute("aria-expanded", "false");
      menuToggle?.setAttribute("aria-label", t("header.openMenu"));
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function initHeroScrollSkip() {
  const hero = document.querySelector(".hero-carousel");

  if (!hero) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const prefersCoarsePointer = window.matchMedia("(pointer: coarse)");
  let lockUntil = 0;
  let touchStartY = 0;
  let touchStartX = 0;
  let touchStartedInHero = false;
  let scrollAnimationFrame = null;

  function heroBottom() {
    return hero.offsetHeight;
  }

  function isInsideHeroScrollRange() {
    return window.scrollY < heroBottom() - 2;
  }

  function easeOutCubic(progress) {
    return 1 - (1 - progress) ** 3;
  }

  function animateScrollTo(targetY, durationMs) {
    if (scrollAnimationFrame !== null) {
      cancelAnimationFrame(scrollAnimationFrame);
      scrollAnimationFrame = null;
    }

    const startY = window.scrollY;
    const travel = targetY - startY;

    if (Math.abs(travel) < 2) {
      return;
    }

    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      window.scrollTo(0, startY + travel * easeOutCubic(t));

      if (t < 1) {
        scrollAnimationFrame = requestAnimationFrame(tick);
      } else {
        scrollAnimationFrame = null;
      }
    }

    scrollAnimationFrame = requestAnimationFrame(tick);
  }

  function skipPastHero() {
    const top = heroBottom();

    if (prefersReducedMotion.matches) {
      lockUntil = Date.now() + 400;
      window.scrollTo(0, top);
      return;
    }

    const durationMs = prefersCoarsePointer.matches ? 700 : 540;
    lockUntil = Date.now() + durationMs + 320;
    animateScrollTo(top, durationMs);
  }

  window.addEventListener(
    "wheel",
    (event) => {
      if (Date.now() < lockUntil) {
        if (event.deltaY > 0) {
          event.preventDefault();
        }

        return;
      }

      if (!isInsideHeroScrollRange() || event.deltaY <= 45) {
        return;
      }

      event.preventDefault();
      skipPastHero();
    },
    { passive: false }
  );

  document.addEventListener(
    "touchstart",
    (event) => {
      if (!isInsideHeroScrollRange()) {
        touchStartedInHero = false;
        return;
      }

      touchStartY = event.touches[0].clientY;
      touchStartX = event.touches[0].clientX;
      touchStartedInHero = hero.contains(event.target);
    },
    { passive: true }
  );

  document.addEventListener(
    "touchmove",
    (event) => {
      if (!touchStartedInHero || Date.now() < lockUntil || !isInsideHeroScrollRange()) {
        return;
      }

      const touch = event.touches[0];
      const verticalIntent = touchStartY - touch.clientY;
      const horizontalDrift = Math.abs(touch.clientX - touchStartX);

      if (verticalIntent < 24) {
        return;
      }

      if (verticalIntent < horizontalDrift * 0.75) {
        return;
      }

      event.preventDefault();
      touchStartedInHero = false;
      skipPastHero();
    },
    { passive: false }
  );

  window.addEventListener("keydown", (event) => {
    if (!isInsideHeroScrollRange() || Date.now() < lockUntil) {
      return;
    }

    const tag = document.activeElement?.tagName;

    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
      return;
    }

    if (event.key === "PageDown" || event.key === "ArrowDown") {
      event.preventDefault();
      skipPastHero();
    }

    if (event.key === " " && !event.ctrlKey && !event.metaKey) {
      if (document.activeElement?.closest?.("button, a, [role='button']")) {
        return;
      }

      event.preventDefault();
      skipPastHero();
    }
  });
}

function updateCarouselDotsI18n() {
  const dotsRoot = document.getElementById("hero-carousel-dots");
  if (!dotsRoot) {
    return;
  }

  const dots = dotsRoot.querySelectorAll(".hero-carousel-dot");
  const count = dots.length;

  dots.forEach((dot, slideIndex) => {
    dot.setAttribute("aria-label", t("carousel.slideOf", { n: slideIndex + 1, total: count }));
  });
}

function onLanguageChanged() {
  if (elements.menuToggle && elements.siteNav) {
    const isOpen = elements.siteNav.classList.contains("open");
    elements.menuToggle.setAttribute("aria-label", isOpen ? t("header.closeMenu") : t("header.openMenu"));
  }

  renderBookingCalendar();

  if (bookingState.selectedDate) {
    renderBookingSlots();
  } else if (elements.slotsHint) {
    elements.slotsHint.textContent = t("slots.hintNone");
  }

  renderMyReservations();
  updateCarouselDotsI18n();
}

initI18n();
window.addEventListener("juliamakeup:lang", onLanguageChanged);

restoreSession();
bindEvents();
initBookingCalendar();
initHeroCarousel();
initHeaderScroll();
initHeroScrollSkip();
