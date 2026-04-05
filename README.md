# Julia Makeup

Modern one-page presentation website for `juliamakeup` with hero, portfolio, pricing, reviews, contact (with map), account UI, calendar booking, and Google Sheets–ready integration.

## Project layout

```text
juliamakeup/
├── index.html                 # App shell (single-page entry)
├── package.json               # Declares ES modules (for tooling / future scripts)
├── README.md
├── assets/
│   ├── css/
│   │   └── main.css           # Global styles
│   ├── js/
│   │   ├── main.js            # Entry: bootstraps features + i18n
│   │   ├── config.js          # Google URLs, map embed, booking hours (edit here)
│   │   ├── i18n.js            # EN/SK copy + optional Sheet overrides
│   │   ├── core/              # Shared: constants, storage, dates, DOM refs, state
│   │   ├── services/          # Google Sheets API bridge
│   │   ├── ui/                # Cross-cutting UI (e.g. toasts)
│   │   └── features/          # Auth, booking, hero carousel, navigation, map
│   └── img/                   # Images (favicon, photos) — add files here
└── backend/
    └── google-apps-script.gs  # Paste into Google Apps Script (not served to browsers)
```

The site is a **static frontend**: no build step required. Browsers load `index.html`, which pulls CSS from `assets/css/` and the module graph from `assets/js/main.js`.

## Run locally

Use any static server from the project root (ES modules work best over `http://`, not always as `file://`):

```bash
cd /path/to/juliamakeup
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Host on GitHub Pages

This repo is static files only — no build step required.

1. Push the project to a GitHub repository.
2. In the repo: **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch** (or use GitHub Actions if you prefer).
4. Choose the branch (usually `main`) and folder **`/` (root)** so `index.html` is at the site root.

Your site will be:

- **User site:** `https://<username>.github.io/<repo>/` if it is a project repository.
- **Root user site:** `https://<username>.github.io/` only if the repo is named `<username>.github.io`.

Asset paths such as `assets/css/main.css` are **relative** to `index.html`, so they work on both local servers and GitHub Pages (including project URLs with a path prefix).

**Google Apps Script:** Keep the web app deployed with **Who has access: Anyone** (or equivalent) so visitors loading the site from `github.io` can `fetch()` your `/exec` URL. The script already answers with CORS-friendly headers for browser `POST`s.

**Note:** `googleScriptUrl` in `assets/js/config.js` is **visible to anyone** who opens your live site (it is client-side JavaScript). Hosting on GitHub Pages does not change that — it is normal for this architecture. Abuse is mitigated by how you design the script (validation, optional rate limits, not returning private data).

## Passwords in Google Sheets (hashing, not encryption)

For the **Apps Script** backend, passwords are **not saved in plain text**. Each user row stores a random **salt** and a **SHA-256 hash** (salt + optional server secret + password). That is **one-way hashing**: you cannot decrypt the original password from the sheet; login only **recomputes** the hash and compares it.

- **Optional extra secret:** In Apps Script, open **Project settings → Script properties** and add `JULIA_PASSWORD_PEPPER` with a long random string. Hashes then depend on that value (it is **not** stored in the sheet).
- **Stronger than SHA-256 for passwords** (e.g. bcrypt, Argon2) needs a different runtime than plain Apps Script; for high-security production, prefer a dedicated auth service.
- **Existing `Users` tab** with the old column `Password` (plaintext) is still supported for login until you migrate; **new** sign-ups use `Salt` and `Password Hash` columns. Easiest clean break: use a fresh sheet or clear `Users` and redeploy the script.

**Local-only mode** (`useGoogleSheets: false`) still keeps passwords in **browser `localStorage`** as in the demo — that part is not hashed.

## Connect Google Sheets

1. Create a Google Sheet. Tab names **`Users`** and **`Reservations`** are optional — the script creates them if missing (exact spelling/capitalization when it creates them).
2. Add the script in one of these ways (pick one):
   - **Recommended:** Open the **spreadsheet** → **Extensions → Apps Script** → paste `backend/google-apps-script.gs`. This **binds** the script to that file, so `getActiveSpreadsheet()` works.
   - **Standalone project** (`script.google.com`): paste the same code, then in Apps Script go to **Project Settings → Script properties** → add **`SPREADSHEET_ID`** = the spreadsheet ID from the URL  
     `https://docs.google.com/spreadsheets/d/THIS_PART_IS_THE_ID/edit`
3. **Deploy → New deployment** → type **Web app** → set **Execute as** (usually you) and **Who has access** to **Anyone** if the public site should call it. Copy the **Web app URL** — it must end in **`/exec`**. Do **not** use a **Test / dev** URL ending in **`/dev`** in `config.js`; that URL usually only works when you are logged into Google as the script owner, so the public frontend will fail while `curl`/Node from your account might appear to work.
4. After any code change, use **Deploy → Manage deployments → Edit → New version** or the new deployment will not run.
5. In `assets/js/config.js`, set:

```js
export const CONFIG = {
  googleScriptUrl: "YOUR_GOOGLE_APPS_SCRIPT_URL",
  useGoogleSheets: true,
};
```

**Test the web app from the terminal:** `curl` with `-L` often fails on Google’s 302 redirect and returns a Drive error page. Use Node instead:

```bash
npm run test:gas
```

(Uses `fetch` like the browser. Optional: `node scripts/test-gas.mjs "YOUR_EXEC_URL"`.)

## Managing reservations (current behaviour)

- After **sign in**, the **Your reservations** block lists bookings stored in **this browser** where the email matches the account (`accountEmail` or booking `email`).
- **Cancel** removes the row from the sheet (when Google Sheets is enabled) and frees the slot in the local calendar. Paste the latest `backend/google-apps-script.gs` so the `cancelReservation` action exists.
- Bookings created on **another device** are **not** listed until you add a `listReservations` (or similar) API and load them in the UI.

## Expected payloads

The site sends `POST` requests with JSON shaped like:

```json
{
  "action": "register",
  "user": {
    "name": "Client Name",
    "email": "client@example.com",
    "password": "secret123"
  }
}
```

```json
{
  "action": "login",
  "email": "client@example.com",
  "password": "secret123"
}
```

```json
{
  "action": "cancelReservation",
  "accountEmail": "client@example.com",
  "date": "2026-04-15",
  "time": "10:00"
}
```

```json
{
  "action": "reservation",
  "reservation": {
    "name": "Client Name",
    "email": "client@example.com",
    "service": "Bridal Makeup",
    "date": "2026-04-15",
    "time": "10:00",
    "phone": "+421900000000",
    "notes": "Natural glam",
    "createdAt": "2026-04-02T10:00:00.000Z",
    "accountEmail": "client@example.com"
  }
}
```

## Notes

- Without Google Apps Script configured, the site falls back to local browser storage (passwords stored there are demo-only).
- With Sheets + the script, new accounts are stored with **salted hashes** in the `Users` tab.
- For production auth at scale, prefer a real backend or an auth provider.
