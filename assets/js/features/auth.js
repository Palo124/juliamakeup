import { t } from "../i18n.js";
import { STORAGE_KEYS } from "../core/constants.js";
import { readStorage, writeStorage } from "../core/storage.js";
import { state } from "../core/state.js";
import { elements } from "../core/elements.js";
import { syncAction } from "../services/sheets.js";
import { showToast } from "../ui/toast.js";
import {
  renderMyReservations,
  resetBookingPicker,
  updateAccountUI,
} from "./booking.js";

function switchTab(targetTab) {
  elements.tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === targetTab;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  elements.registerForm.classList.toggle("active", targetTab === "register");
  elements.loginForm.classList.toggle("active", targetTab === "login");
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

function handleLogout() {
  localStorage.removeItem(STORAGE_KEYS.session);
  state.currentUser = null;
  elements.accountPanel.classList.add("hidden");
  elements.reservationForm.reset();
  resetBookingPicker();
  renderMyReservations();
  showToast(t("toast.signedOut"), "info");
}

export function restoreSession() {
  state.currentUser = readStorage(STORAGE_KEYS.session, null);
  updateAccountUI();
}

export function bindAuthEvents() {
  elements.tabButtons.forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  elements.registerForm.addEventListener("submit", handleRegister);
  elements.loginForm.addEventListener("submit", handleLogin);
  elements.logoutButton.addEventListener("click", handleLogout);
}
