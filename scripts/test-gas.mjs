/**
 * Reliable POST test for the Apps Script web app (curl -L often breaks on Google's 302).
 * Usage from repo root: node scripts/test-gas.mjs
 * Or: node scripts/test-gas.mjs "https://script.google.com/macros/s/.../exec"
 */
import { CONFIG } from "../assets/js/config.js";

const url = process.argv[2] || CONFIG.googleScriptUrl;

if (!url) {
  console.error("No URL: set googleScriptUrl in assets/js/config.js or pass URL as argv.");
  process.exit(1);
}

const body = JSON.stringify({
  action: "register",
  user: {
    name: "CLI Test",
    email: `cli-test-${Date.now()}@example.com`,
    password: "TestPass123!",
  },
});

const response = await fetch(url, {
  method: "POST",
  redirect: "follow",
  headers: { "Content-Type": "text/plain;charset=utf-8" },
  body,
});

const text = await response.text();
console.log("HTTP", response.status);
console.log(text);
