/**
 * POST test for the Site Texts Apps Script web app.
 * Usage: node scripts/test-site-text-gas.mjs
 *     or node scripts/test-site-text-gas.mjs "https://script.google.com/macros/s/.../exec"
 */
import { CONFIG } from "../assets/js/config.js";

const url = process.argv[2] || CONFIG.contentScriptUrl;

if (!url) {
  console.error("No URL: set contentScriptUrl in assets/js/config.js or pass URL as argv.");
  process.exit(1);
}

const body = JSON.stringify({ action: "getSiteTexts" });

const headers = {
  "Content-Type": "text/plain;charset=utf-8",
  Accept: "application/json,text/plain,*/*",
  "User-Agent": "juliamakeup-site-texts-test/1.0",
};

async function tryRequest(method) {
  const init =
    method === "GET"
      ? { method: "GET", redirect: "follow", headers: { ...headers } }
      : {
          method: "POST",
          redirect: "follow",
          headers,
          body,
        };

  return fetch(url, init);
}

let response = await tryRequest("POST");
let text = await response.text();

if (response.status === 403 || (!text.trim().startsWith("{") && text.includes("DOCTYPE"))) {
  console.log("HTTP", response.status, "(POST)");
  console.log("\n--- Retrying GET (same deployment) ---\n");
  response = await tryRequest("GET");
  text = await response.text();
}

console.log("HTTP", response.status);

if (response.status === 403 || (text.includes("<!DOCTYPE") && text.includes("html"))) {
  console.error(`
Google returned an HTML error page (403 / access denied). Your script probably never ran.

Fix (Apps Script editor → Deploy → Manage deployments → pencil on Web app):

  • Execute as: Me  (your Google account)
  • Who has access: Anyone        ← required for Node, curl, and anonymous visitors
    NOT "Anyone with Google account" — that blocks unsigned requests (403).

Then Save → use the /exec URL from that deployment.

Also check:
  • URL ends with …/exec (not …/dev).
  • Spreadsheet-bound project: open the script from Extensions → Apps Script on THAT sheet.
  • Google Workspace: admin may block "Anyone" web apps — ask for an exception or host elsewhere.

Quick check: open the /exec URL in a private/incognito window. You should see JSON, not a login wall.
`);
  process.exit(1);
}

try {
  const data = JSON.parse(text);
  const enKeys = data.en ? Object.keys(data.en).length : 0;
  const skKeys = data.sk ? Object.keys(data.sk).length : 0;
  const imgKeys = data.img ? Object.keys(data.img).length : 0;
  console.log(JSON.stringify({ ok: data.ok, enKeys, skKeys, imgKeys, message: data.message }, null, 2));
} catch {
  console.log(text.slice(0, 800));
  process.exit(1);
}
