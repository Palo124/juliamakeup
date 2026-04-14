# Site texts spreadsheet template

Use **one Google Spreadbook** only for public website copy. Create **two worksheets** (tabs):

| Tab name | Locale | Maps to `lang` in code |
|----------|--------|-------------------------|
| **ENG**  | English | `en` |
| **SK**   | Slovak  | `sk` |
| **IMG**  | Image URLs (optional) | not localized — one URL per hero slide key |

Names are **case-sensitive** (`ENG`, not `eng` or `English`). The **IMG** tab can be omitted if you only use files bundled in the repo.

## Layout (both tabs identical structure)

| | **A** | **B** | **C** (optional) |
|---|--------|--------|------------------|
| **1** | `key` | `text` | `notes` *(ignored by script; for your team)* |
| **2+** | `nav.about` | `About` | e.g. main nav |
| **3+** | `intro.text` | `Soft glam…` | hero band |
| … | … | … | … |

- **Column A (`key`)** must match the keys used in `assets/js/i18n.js` (`data-i18n` attributes reference the same ids).
- **Column B (`text`)** is what visitors see. Use `{{name}}`, `{{date}}`, `{{time}}`, `{{n}}`, `{{total}}` where the site expects placeholders (same as in bundled strings).
- **Empty B** → the site falls back to the bundled default for that key.
- **Rows with empty A** or **keys starting with `#`** are skipped (handy for comments).

## IMG tab (picture URLs)

| | **A** | **B** | **C** (optional) |
|---|--------|--------|------------------|
| **1** | `key` | `url` | `notes` |
| **2** | `hero.slide1` | `https://cdn.example.com/hero1.jpg` | first carousel slide |
| **3** | `hero.slide2` | | leave empty → keep default `src` from `index.html` |
| **4** | `hero.slide3` | `assets/img/IMG_7567.jpeg` | same-origin path allowed |

Keys must match **`data-site-img`** on each `<img>` in `index.html` (`hero.slide1` … `hero.slide3`).

**Allowed values in column B**

- `https://…` or `http://…` (CDN, etc.)
- **Google Drive:** paste a share link (`…/file/d/FILE_ID/view?…`), a link with `?id=FILE_ID`, or the **raw file ID**. The site normalizes to `https://drive.google.com/thumbnail?id=FILE_ID&sz=…` (default **`w1920`** in `assets/js/config.js` → `driveImageThumbnailSz`; small values like **`w256`** are previews and look blurry full-width). Sharing must allow **Anyone with the link → Viewer** (or the thumbnail request fails).
- `assets/…` — path relative to the site root (same as bundled files)
- `/path/…` — absolute path on your domain  
- **Empty** — browser keeps the default `src` from HTML.

## First-time fill

From the repo root:

```bash
npm run export:site-texts
```

This writes `seed-ENG.tsv`, `seed-SK.tsv`, and `seed-IMG.tsv` next to this file. In Google Sheets: **File → Import** each into the matching tab (replace data starting row 1), or paste after opening the TSV in a text editor.

## Apps Script

1. In the spreadsheet: **Extensions → Apps Script**.
2. Paste `Code.gs` from this folder (replace default `Code.gs`).
3. **Save**, then **Deploy → New deployment → Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone** (required for the public site to read copy without login).
   - Do **not** choose *Anyone with Google account* — that causes **HTTP 403** for visitors (and for `node scripts/test-site-text-gas.mjs`) who are not signed in.
4. Copy the **Web app URL** into `assets/js/config.js`:

   ```js
   contentScriptUrl: "https://script.google.com/macros/s/…/exec",
   useSheetTexts: true,
   ```

5. **Important:** use a **different** deployment URL than your booking/reservations script.
