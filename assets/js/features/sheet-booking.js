import {
  compareDateKeys,
  dateKeyFromParts,
  formatSlotTimeOnly,
  normalizeDateKey,
  sortSlotsByTime,
  todayDateKey,
} from "../core/booking-dates.js";
import { CONFIG } from "../config.js";
import { pagePath } from "../core/locale-urls.js";
import { applyTranslations, getDateLocale, getLang, t } from "../i18n.js";
import {
  fetchAvailability,
  getCachedAvailability,
  hasAvailabilityCache,
  postReservation,
  warmBookingBackend,
} from "../services/booking-api.js";
import { showToast } from "../ui/toast.js";

const WEEKDAY_KEYS = [
  "booking.calMo",
  "booking.calTu",
  "booking.calWe",
  "booking.calTh",
  "booking.calFr",
  "booking.calSa",
  "booking.calSu",
];

/**
 * @param {string} sheetValue
 * @param {string} selected
 */
function serviceMatches(sheetValue, selected) {
  return (
    String(sheetValue ?? "")
      .trim()
      .toLowerCase() ===
    String(selected ?? "")
      .trim()
      .toLowerCase()
  );
}

/**
 * @param {{ allowedServices?: string[], service?: string, label?: string }} slot
 * @returns {string[]}
 */
function slotAllowedServices(slot) {
  if (Array.isArray(slot.allowedServices) && slot.allowedServices.length) {
    return slot.allowedServices.map((s) => String(s).trim()).filter(Boolean);
  }
  const legacy = String(slot.service ?? slot.label ?? "").trim();
  return legacy ? [legacy] : [];
}

/**
 * @param {{ allowedServices?: string[], service?: string, label?: string }} slot
 * @param {string} selected
 */
function slotAllowsService(slot, selected) {
  const svc = String(selected ?? "").trim();
  if (!svc) {
    return false;
  }
  return slotAllowedServices(slot).some((name) => serviceMatches(name, svc));
}

/**
 * @param {string} result
 * @param {string} code
 */
function messageForBookingUrlOutcome(result, code) {
  const r = String(result || "").trim();
  const c = String(code || "").trim();
  if (r === "email_verified") {
    return t("booking.resultEmailVerified");
  }
  if (r === "confirmed") {
    return t("booking.resultConfirmed");
  }
  if (r === "rejected") {
    return t("booking.resultRejected");
  }
  if (r === "cancelled") {
    return t("booking.resultCancelled");
  }
  if (r === "already_cancelled") {
    return t("booking.resultAlreadyCancelled");
  }
  if (r === "error") {
    if (c === "EXPIRED_VERIFICATION") {
      return t("booking.expiredVerification");
    }
    if (c === "TOKEN_USED") {
      return t("booking.tokenUsed");
    }
    if (c === "INVALID_TOKEN") {
      return t("booking.invalidToken");
    }
    if (c === "SLOT_TAKEN") {
      return t("booking.slotTaken");
    }
    if (c === "CONFIG") {
      return t("booking.serverConfig");
    }
    if (c === "BUSY") {
      return t("booking.errBusy");
    }
    if (c === "MAIL_ERROR") {
      return t("booking.mailError");
    }
    return t("booking.resultLinkError");
  }
  return t("booking.resultLinkError");
}

/**
 * @param {HTMLElement | null} resultEl
 * @param {string} result
 * @param {string} code
 */
function renderBookingOutcomeBanner(resultEl, result, code) {
  if (!resultEl) {
    return;
  }
  const r = String(result || "").trim();
  resultEl.textContent = messageForBookingUrlOutcome(result, code);
  resultEl.classList.remove("hidden", "is-error", "is-success");
  resultEl.dataset.bookingResult = r;
  resultEl.dataset.bookingCode = String(code || "").trim();
  if (r === "error" || r === "rejected") {
    resultEl.classList.add("is-error");
  } else if (r) {
    resultEl.classList.add("is-success");
  }
}

/**
 * @param {HTMLElement | null} resultEl
 */
function consumeBookingUrlParams_(resultEl) {
  if (!resultEl) {
    return;
  }
  try {
    const u = new URL(window.location.href);
    const br = u.searchParams.get("bookingResult");
    if (!br) {
      return;
    }
    const bc = u.searchParams.get("bookingCode") || "";
    u.searchParams.delete("bookingResult");
    u.searchParams.delete("bookingCode");
    const qs = u.searchParams.toString();
    const clean = u.pathname + (qs ? `?${qs}` : "") + u.hash;
    window.history.replaceState({}, "", clean);
    renderBookingOutcomeBanner(resultEl, br, bc);
  } catch {
    /* ignore */
  }
}

/**
 * @param {string | undefined} code
 */
function toastForReservationErrorCode(code) {
  const c = String(code || "").trim();
  switch (c) {
    case "TAKEN":
      return t("booking.slotTaken");
    case "SERVICE_MISMATCH":
      return t("booking.serviceMismatch");
    case "NOT_FOUND":
      return t("booking.notFound");
    case "CONFIG":
      return t("booking.serverConfig");
    case "MAIL_ERROR":
      return t("booking.mailError");
    case "EXPIRED_VERIFICATION":
      return t("booking.expiredVerification");
    case "TOKEN_USED":
      return t("booking.tokenUsed");
    case "INVALID_TOKEN":
      return t("booking.invalidToken");
    default:
      return "";
  }
}

export function initSheetBooking() {
  if (!CONFIG.useSheetBooking) {
    document.getElementById("booking")?.classList.add("hidden");
    for (const a of document.querySelectorAll('a[href="#booking"], a[href="booking.html"]')) {
      a.setAttribute("href", `${pagePath("home", getLang())}#contact`);
      if (a.dataset.i18n === "intro.book") {
        a.dataset.i18n = "nav.contact";
      }
    }
    document.querySelector('nav.site-nav a[data-i18n="nav.booking"]')?.remove();
    applyTranslations();
    return;
  }

  const section = document.getElementById("booking");
  const statusEl = document.getElementById("booking-slots-status");
  const slotsEl = document.getElementById("booking-slots");
  const form = document.getElementById("booking-form");
  const slotIdInput = document.getElementById("booking-slot-id");
  const serviceSelect = document.getElementById("booking-service");
  const submitBtn = form?.querySelector('button[type="submit"]');
  const calRoot = document.getElementById("booking-calendar");
  const calMonthEl = document.getElementById("booking-cal-month");
  const calPrev = document.getElementById("booking-cal-prev");
  const calNext = document.getElementById("booking-cal-next");
  const calWeekdays = document.getElementById("booking-cal-weekdays");
  const calGrid = document.getElementById("booking-cal-grid");
  const bookingPicker = document.getElementById("booking-picker");
  const calendarLoadingEl = document.getElementById("booking-calendar-loading");

  const resultBanner = document.getElementById("booking-action-result");

  if (!section || !statusEl || !slotsEl || !form || !slotIdInput || !submitBtn || !serviceSelect) {
    return;
  }

  consumeBookingUrlParams_(resultBanner);
  if (!CONFIG.bookingScriptUrl?.trim()) {
    statusEl.textContent = t("booking.configNeeded");
    form.classList.add("hidden");
    return;
  }

  /** All slots from API (unfiltered). */
  let allSlotsRaw = [];
  /** @type {Set<string>} */
  let datesWithSlots = new Set();
  let viewYear = new Date().getFullYear();
  let viewMonth = new Date().getMonth();
  /** @type {string | null} */
  let selectedDateKey = null;

  let selectedSlotId = "";
  let isLoadingSlots = false;
  let isEntryWarming = false;

  function setCalendarLoading(loading) {
    isLoadingSlots = loading;
    calRoot?.classList.toggle("is-loading", loading);
    calRoot?.setAttribute("aria-busy", loading ? "true" : "false");
    bookingPicker?.setAttribute("aria-busy", loading ? "true" : "false");
    calendarLoadingEl?.classList.toggle("hidden", !loading);
    calendarLoadingEl?.setAttribute("aria-hidden", loading ? "false" : "true");
    if (loading && getSelectedService()) {
      statusEl.textContent = t("booking.slotsLoading");
    }
    updatePickerVisibility();
    renderCalendar();
  }

  function showEntryWarmShell() {
    isEntryWarming = true;
    statusEl.textContent = t("booking.chooseServiceFirst");
    bookingPicker?.classList.remove("hidden");
    setCalendarLoading(true);
  }

  function clearEntryWarmShell() {
    if (!isEntryWarming) {
      return;
    }
    isEntryWarming = false;
    if (!getSelectedService()) {
      setCalendarLoading(false);
      bookingPicker?.classList.add("hidden");
      statusEl.textContent = t("booking.chooseServiceFirst");
    }
  }

  function hydrateSlotsFromCache() {
    const cached = getCachedAvailability();
    if (!cached?.ok || !Array.isArray(cached.slots)) {
      return false;
    }
    allSlotsRaw = cached.slots.filter((s) => normalizeDateKey(s.date));
    return allSlotsRaw.length > 0;
  }

  function renderIdleState() {
    statusEl.textContent = t("booking.chooseServiceFirst");
    slotsEl.innerHTML = "";
    setSelected("");
    bookingPicker?.classList.add("hidden");
    calRoot?.classList.add("hidden");
  }

  function getSelectedService() {
    return String(serviceSelect.value ?? "").trim();
  }

  function filteredSlots() {
    const svc = getSelectedService();
    if (!svc) {
      return [];
    }
    return allSlotsRaw.filter(
      (s) => normalizeDateKey(s.date) && slotAllowsService(s, svc),
    );
  }

  function setSelected(slotId) {
    selectedSlotId = slotId;
    slotIdInput.value = slotId;

    for (const btn of slotsEl.querySelectorAll(".booking-slot-chip")) {
      const id = btn.getAttribute("data-slot-id");
      const isSelected = id === slotId;
      btn.classList.toggle("is-selected", isSelected);
      btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
    }
  }

  function slotsForSelectedDay() {
    if (!selectedDateKey) {
      return [];
    }
    return sortSlotsByTime(
      filteredSlots().filter((s) => normalizeDateKey(s.date) === selectedDateKey),
    );
  }

  function renderSlotChips() {
    const list = slotsForSelectedDay();
    slotsEl.innerHTML = "";
    const locale = getDateLocale();

    for (const slot of list) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "booking-slot-chip";
      btn.setAttribute("data-slot-id", slot.slotId);
      btn.setAttribute("aria-pressed", "false");
      btn.textContent = formatSlotTimeOnly(slot.time, locale);
      btn.addEventListener("click", () => {
        setSelected(slot.slotId);
      });
      slotsEl.append(btn);
    }
  }

  function updatePickerVisibility() {
    const svc = getSelectedService();
    bookingPicker?.classList.toggle("hidden", !(svc || isEntryWarming));
  }

  function renderWaitingForSlots() {
    updatePickerVisibility();
    slotsEl.innerHTML = "";
    setSelected("");
    setCalendarLoading(true);
  }

  function renderSlotsForDay() {
    if (!getSelectedService()) {
      statusEl.textContent = t("booking.chooseServiceFirst");
      slotsEl.innerHTML = "";
      setSelected("");
      return;
    }

    if (!allSlotsRaw.length) {
      statusEl.textContent = t("booking.slotsEmpty");
      setSelected("");
      return;
    }

    if (!filteredSlots().length) {
      statusEl.textContent = t("booking.noSlotsForService");
      slotsEl.innerHTML = "";
      setSelected("");
      return;
    }

    if (!selectedDateKey) {
      statusEl.textContent = t("booking.pickDate");
      slotsEl.innerHTML = "";
      setSelected("");
      return;
    }

    const list = slotsForSelectedDay();
    if (!list.length) {
      statusEl.textContent = t("booking.noSlotsThisDay");
      slotsEl.innerHTML = "";
      setSelected("");
      return;
    }

    statusEl.textContent = t("booking.slotsHint");
    renderSlotChips();
  }

  function renderWeekdayLabels() {
    if (!calWeekdays) {
      return;
    }
    calWeekdays.innerHTML = "";
    for (const key of WEEKDAY_KEYS) {
      const span = document.createElement("span");
      span.textContent = t(key);
      calWeekdays.append(span);
    }
  }

  function renderMonthTitle() {
    if (!calMonthEl) {
      return;
    }
    const locale = getDateLocale();
    calMonthEl.textContent = new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
    }).format(new Date(viewYear, viewMonth, 1));
  }

  function renderCalendar() {
    if (!calGrid || !calRoot) {
      renderSlotsForDay();
      return;
    }

    if (!getSelectedService() && !isEntryWarming) {
      calRoot.classList.add("hidden");
      return;
    }

    if (isLoadingSlots) {
      calRoot.classList.remove("hidden");
      renderWeekdayLabels();
      renderMonthTitle();
      calGrid.innerHTML = "";
      for (let i = 0; i < 35; i += 1) {
        const cell = document.createElement("div");
        cell.className = "booking-cal-day booking-cal-day--skeleton";
        cell.setAttribute("aria-hidden", "true");
        calGrid.append(cell);
      }
      return;
    }

    if (!allSlotsRaw.length) {
      calRoot.classList.add("hidden");
      return;
    }

    calRoot.classList.remove("hidden");

    const slots = filteredSlots();
    datesWithSlots = new Set(slots.map((s) => normalizeDateKey(s.date)));

    renderWeekdayLabels();
    renderMonthTitle();

    calGrid.innerHTML = "";
    const first = new Date(viewYear, viewMonth, 1);
    const mondayFirst = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const today = todayDateKey();

    for (let i = 0; i < mondayFirst; i += 1) {
      const pad = document.createElement("div");
      pad.className = "booking-cal-pad";
      pad.setAttribute("aria-hidden", "true");
      calGrid.append(pad);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const key = dateKeyFromParts(viewYear, viewMonth, day);
      const past = compareDateKeys(key, today) < 0;
      const disabled = past;
      const hasAvailability = datesWithSlots.has(key);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "booking-cal-day";
      if (disabled) {
        btn.classList.add("is-disabled");
      }
      if (hasAvailability && !past) {
        btn.classList.add("booking-cal-day--has-slots");
      }
      if (key === selectedDateKey) {
        btn.classList.add("is-selected");
      }
      if (key === today) {
        btn.classList.add("is-today");
      }
      btn.textContent = String(day);
      btn.disabled = disabled;
      btn.setAttribute("aria-pressed", key === selectedDateKey ? "true" : "false");

      if (!disabled) {
        btn.addEventListener("click", () => {
          selectedDateKey = key;
          setSelected("");
          renderCalendar();
          renderSlotsForDay();
        });
      }

      calGrid.append(btn);
    }
  }

  function applyServiceFilter() {
    const now = new Date();
    viewYear = now.getFullYear();
    viewMonth = now.getMonth();
    selectedDateKey = todayDateKey();
    setSelected("");
    updatePickerVisibility();
    renderCalendar();
    renderSlotsForDay();
  }

  function applyAvailabilityData(data) {
    if (!data.ok || !Array.isArray(data.slots)) {
      if (getSelectedService()) {
        statusEl.textContent = data.message || t("booking.slotsError");
        bookingPicker?.classList.remove("hidden");
      }
      allSlotsRaw = [];
      datesWithSlots = new Set();
      selectedDateKey = null;
      calRoot?.classList.add("hidden");
      clearEntryWarmShell();
      return;
    }

    allSlotsRaw = data.slots.filter((s) => normalizeDateKey(s.date));
    clearEntryWarmShell();
    if (getSelectedService()) {
      applyServiceFilter();
    } else {
      renderIdleState();
    }
  }

  async function loadSlots(options = {}) {
    const { forceFresh = false } = options;
    const awaitingService = Boolean(getSelectedService());

    if (awaitingService && !allSlotsRaw.length) {
      renderWaitingForSlots();
    }

    try {
      const data = await fetchAvailability({ forceFresh });
      applyAvailabilityData(data);
    } finally {
      setCalendarLoading(false);
    }
  }

  window.addEventListener("juliamakeup:availability-updated", (event) => {
    const data = event.detail;
    if (!data?.ok || !Array.isArray(data.slots)) {
      return;
    }
    applyAvailabilityData(data);
    setCalendarLoading(false);
  });

  serviceSelect.addEventListener("change", () => {
    const svc = getSelectedService();
    if (!svc) {
      renderIdleState();
      return;
    }
    isEntryWarming = false;
    if (allSlotsRaw.length) {
      applyServiceFilter();
      return;
    }
    renderWaitingForSlots();
    void loadSlots();
  });

  if (calPrev) {
    calPrev.addEventListener("click", () => {
      viewMonth -= 1;
      if (viewMonth < 0) {
        viewMonth = 11;
        viewYear -= 1;
      }
      renderCalendar();
    });
  }

  if (calNext) {
    calNext.addEventListener("click", () => {
      viewMonth += 1;
      if (viewMonth > 11) {
        viewMonth = 0;
        viewYear += 1;
      }
      renderCalendar();
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!selectedSlotId) {
      showToast(t("booking.selectSlot"), "error");
      return;
    }

    const formData = new FormData(form);
    const reservation = {
      slotId: selectedSlotId,
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      service: String(formData.get("service") || "").trim(),
      notes: String(formData.get("notes") || "").trim(),
      website: String(formData.get("website") || "").trim(),
    };

    form.setAttribute("aria-busy", "true");
    bookingPicker?.setAttribute("aria-busy", "true");
    submitBtn.disabled = true;
    submitBtn.classList.add("is-loading");
    submitBtn.textContent = t("booking.sending");

    /** @type {{ ok?: boolean, code?: string, message?: string }} */
    let result = { ok: false };
    try {
      result = await postReservation(reservation);
    } catch {
      showToast(t("booking.error"), "error");
      return;
    } finally {
      form.removeAttribute("aria-busy");
      bookingPicker?.removeAttribute("aria-busy");
      submitBtn.disabled = false;
      submitBtn.classList.remove("is-loading");
      submitBtn.textContent = t("booking.submit");
    }

    if (result.ok) {
      if (result.pendingVerification) {
        showToast(t("booking.successPending"), "success");
      } else {
        showToast(t("booking.success"), "success");
      }
      form.reset();
      slotIdInput.value = "";
      selectedSlotId = "";
      renderIdleState();
      void loadSlots({ forceFresh: true });
      return;
    }

    const mappedErr = toastForReservationErrorCode(result.code);
    if (mappedErr) {
      showToast(mappedErr, "error");
    } else {
      showToast(result.message || t("booking.error"), "error");
    }

    if (result.code === "TAKEN") {
      await loadSlots({ forceFresh: true });
    }
  });

  hydrateSlotsFromCache();
  if (hasAvailabilityCache()) {
    renderIdleState();
  } else {
    showEntryWarmShell();
  }
  warmBookingBackend();

  window.addEventListener("juliamakeup:lang", () => {
    if (!getSelectedService()) {
      statusEl.textContent = t("booking.chooseServiceFirst");
    } else if (isLoadingSlots && !allSlotsRaw.length) {
      statusEl.textContent = t("booking.slotsLoading");
    } else if (!allSlotsRaw.length) {
      statusEl.textContent = t("booking.slotsEmpty");
    } else if (!filteredSlots().length) {
      statusEl.textContent = t("booking.noSlotsForService");
    } else if (!selectedDateKey) {
      statusEl.textContent = t("booking.pickDate");
    } else if (!slotsForSelectedDay().length) {
      statusEl.textContent = t("booking.noSlotsThisDay");
    } else {
      statusEl.textContent = t("booking.slotsHint");
    }

    const locale = getDateLocale();
    for (const btn of slotsEl.querySelectorAll(".booking-slot-chip")) {
      const id = btn.getAttribute("data-slot-id");
      const slot = allSlotsRaw.find((s) => s.slotId === id);
      if (slot) {
        btn.textContent = formatSlotTimeOnly(slot.time, locale);
      }
    }

    renderCalendar();

    if (resultBanner?.dataset.bookingResult) {
      renderBookingOutcomeBanner(
        resultBanner,
        resultBanner.dataset.bookingResult,
        resultBanner.dataset.bookingCode || "",
      );
    }
  });
}
