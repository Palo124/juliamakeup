import {
  compareDateKeys,
  dateKeyFromParts,
  formatSlotTimeOnly,
  normalizeDateKey,
  sortSlotsByTime,
  todayDateKey,
} from "../core/booking-dates.js";
import { CONFIG } from "../config.js";
import { applyTranslations, getDateLocale, t } from "../i18n.js";
import { fetchAvailability, postReservation } from "../services/booking-api.js";
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
 * @param {{ service?: string, label?: string }} slot
 */
function slotService(slot) {
  return String(slot.service ?? slot.label ?? "").trim();
}

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

export function initSheetBooking() {
  if (!CONFIG.useSheetBooking) {
    document.getElementById("booking")?.classList.add("hidden");
    for (const a of document.querySelectorAll('a[href="#booking"]')) {
      a.setAttribute("href", "#contact");
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

  if (!section || !statusEl || !slotsEl || !form || !slotIdInput || !submitBtn || !serviceSelect) {
    return;
  }

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

  function getSelectedService() {
    return String(serviceSelect.value ?? "").trim();
  }

  function filteredSlots() {
    const svc = getSelectedService();
    if (!svc) {
      return [];
    }
    return allSlotsRaw.filter(
      (s) => normalizeDateKey(s.date) && serviceMatches(slotService(s), svc),
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
    const hasData = allSlotsRaw.length > 0;
    const svc = getSelectedService();
    bookingPicker?.classList.toggle("hidden", !hasData || !svc);
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

    if (!allSlotsRaw.length) {
      calRoot.classList.add("hidden");
      return;
    }

    if (!getSelectedService()) {
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

  async function loadSlots() {
    statusEl.textContent = t("booking.slotsLoading");
    slotsEl.innerHTML = "";
    setSelected("");
    if (calGrid) {
      calGrid.innerHTML = "";
    }

    const data = await fetchAvailability();

    if (!data.ok || !Array.isArray(data.slots)) {
      statusEl.textContent = data.message || t("booking.slotsError");
      allSlotsRaw = [];
      datesWithSlots = new Set();
      selectedDateKey = null;
      updatePickerVisibility();
      renderCalendar();
      renderSlotsForDay();
      return;
    }

    allSlotsRaw = data.slots.filter((s) => normalizeDateKey(s.date));
    applyServiceFilter();
  }

  serviceSelect.addEventListener("change", () => {
    applyServiceFilter();
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
      showToast(t("booking.success"), "success");
      form.reset();
      slotIdInput.value = "";
      selectedSlotId = "";
      await loadSlots();
      return;
    }

    if (result.code === "TAKEN") {
      showToast(t("booking.slotTaken"), "error");
      await loadSlots();
      return;
    }

    showToast(result.message || t("booking.error"), "error");
  });

  void loadSlots();

  window.addEventListener("juliamakeup:lang", () => {
    if (!getSelectedService()) {
      statusEl.textContent = t("booking.chooseServiceFirst");
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
  });
}
