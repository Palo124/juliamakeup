# Google Sheet + Apps Script — site texts only

This folder documents a **second** integration: editable website copy in Google Sheets, served by its **own** Apps Script web app.

- **Booking / users / reservations** → your existing spreadsheet + `CONFIG.googleScriptUrl`
- **Headings, nav, paragraphs, toasts, etc.** → this spreadsheet + `CONFIG.contentScriptUrl`

## Quick setup

1. Create a new Google Spreadsheet (e.g. “Juliere site texts”).
2. Add tabs **`ENG`**, **`SK`**, and optionally **`IMG`** (see TEMPLATE.md for image URLs).
3. In ENG/SK, set row 1: `key` | `text` (optional `notes` in C). In IMG: `key` | `url`.
4. Import seeds: `seed-ENG.tsv`, `seed-SK.tsv`, `seed-IMG.tsv` (`npm run export:site-texts`).
5. Bind **Code.gs** (Extensions → Apps Script) and deploy as a **Web app** with access **Anyone**.
6. Set `contentScriptUrl` and `useSheetTexts: true` in `assets/js/config.js`.


Details and column rules: **TEMPLATE.md**.

## Testing the web app

```bash
node scripts/test-site-text-gas.mjs "https://script.google.com/macros/s/YOUR_ID/exec"
```

You should see JSON with `"ok":true`, `"en":{...}`, `"sk":{...}`.

## HTTP 403 or HTML “Access denied”

That response is from **Google**, not your script: the request never reaches `doPost` / `doGet`.

1. **Deploy → Manage deployments** → edit the **Web app** deployment:
   - **Execute as:** Me  
   - **Who has access:** **Anyone** (public, no sign-in)  
   - Do **not** use *Anyone with Google account* for this site — `fetch` from the browser without a Google session and tools like `node scripts/test-site-text-gas.mjs` will get **403**.

2. After changing access, **Deploy → New version** (or update deployment) and copy the **`/exec`** URL again.

3. Sanity check: open the **`/exec`** link in an **incognito** window. You should see raw JSON. If you see a login page or “access denied”, the deployment is still too restricted.

4. Use **`/exec`**, not **`/dev`** (`/dev` only works when you’re logged in as the script owner).

5. On **Google Workspace**, admins can disable “Anyone” web apps; you may need an admin exception or a different hosting approach for the API.
