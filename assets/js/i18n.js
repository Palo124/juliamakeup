/**
 * Site copy: English and Slovak.
 * Bundled strings are defaults; optional Google Sheet overrides (see CONFIG.contentScriptUrl).
 */
import { CONFIG } from "./config.js";

const LANG_STORAGE_KEY = "juliamakeup-lang";

/** @type {Record<string, Record<string, string>>} */
const BUNDLED_STRINGS = {
  en: {
    "meta.title": "Juliere Beauty | Modern Beauty Studio",
    "meta.description":
      "Juliere Beauty — elegant makeup studio with portfolio, pricing, booking, and reservations.",

    "hero.carouselAria": "Juliere Beauty",
    "hero.slide1.alt": "Portrait — professional makeup look, Juliere Beauty",
    "hero.slide1.caption": "Featured portrait for Juliere Beauty",
    "hero.slide2.alt": "Luxury makeup products — Juliere Beauty studio",
    "hero.slide2.caption": "Flat lay of professional makeup products",
    "hero.slide3.alt": "Portrait — soft glam makeup, Juliere Beauty",
    "hero.slide3.caption": "Portrait with professional makeup look",
    "hero.tagline": "Modern beauty studio",
    "hero.prevSlide": "Previous slide",
    "hero.nextSlide": "Next slide",
    "hero.chooseSlide": "Choose slide",
    "hero.scroll": "Scroll",

    "header.brandAria": "Juliere Beauty home",
    "header.brandStrong": "Juliere Beauty",
    "header.brandSub": "Makeup artist",
    "header.openMenu": "Open menu",
    "header.closeMenu": "Close menu",
    "header.navMain": "Main",

    "nav.about": "About",
    "nav.portfolio": "Portfolio",
    "nav.prices": "Prices",
    "nav.recommend": "Julia Recommends",
    "nav.account": "Account",
    "nav.bookings": "My bookings",
    "nav.contact": "Contact",
    "nav.book": "Book",

    "intro.text":
      "Soft glam, timeless bridal looks, and polished beauty experiences — reserve your date online.",
    "intro.reserve": "Reserve now",
    "intro.portfolio": "View portfolio",

    "stats.years": "6+ years",
    "stats.yearsDesc": "professional artistry experience",
    "stats.sessions": "300+",
    "stats.sessionsDesc": "beauty sessions completed",
    "stats.rating": "4.9/5",
    "stats.ratingDesc": "average client satisfaction",

    "about.eyebrow": "About Julia",
    "about.h2": "Minimal, refined, and designed around confidence.",
    "about.p1":
      "Julia is a makeup artist focused on fresh skin, elegant detail, and makeup that looks as beautiful in person as it does in photos. Every appointment is tailored to the client, from subtle everyday polish to full bridal glam.",
    "about.p2":
      "The studio experience is intentionally simple: browse services, create an account, reserve a time, and keep everything organized in one place.",

    "portfolio.eyebrow": "Portfolio",
    "portfolio.h2": "Recent beauty work",
    "portfolio.bridal.label": "Bridal glow",
    "portfolio.bridal.p":
      "Radiant skin, soft shimmer, and romantic definition for a timeless wedding finish.",
    "portfolio.soft.label": "Soft glam",
    "portfolio.soft.p": "Balanced glam with polished brows, sculpted complexion, and diffused eyes.",
    "portfolio.editorial.label": "Editorial clean",
    "portfolio.editorial.p": "Fresh, modern beauty with intentional texture and understated luxury.",
    "portfolio.evening.label": "Evening luxe",
    "portfolio.evening.p": "Defined eyes, glowing skin, and long-wear artistry for special events.",

    "prices.eyebrow": "Price Page",
    "prices.h2": "Clear packages with a premium finish",
    "prices.signature.tag": "Most requested",
    "prices.signature.h3": "Signature Makeup",
    "prices.signature.p": "Perfect for events, dinners, celebrations, and polished day-to-night beauty.",
    "prices.bridal.h3": "Bridal Makeup",
    "prices.bridal.p": "Includes consultation, long-wear application, and bridal-day beauty planning.",
    "prices.trial.h3": "Trial Session",
    "prices.trial.p": "Test and refine your preferred look before a major event or wedding day.",
    "prices.lesson.h3": "1:1 Makeup Lesson",
    "prices.lesson.p": "Personalized product guidance and a step-by-step routine tailored to you.",

    "recommend.eyebrow": "Julia Recommends",
    "recommend.h2": "Favorite beauty products",
    "recommend.prep.pill": "Skin prep",
    "recommend.prep.h3": "Hydrating primer",
    "recommend.prep.p": "Creates a smooth, luminous base and helps makeup wear beautifully through the day.",
    "recommend.complexion.pill": "Complexion",
    "recommend.complexion.h3": "Lightweight foundation",
    "recommend.complexion.p": "Buildable coverage with a natural finish for skin that still looks like skin.",
    "recommend.eyes.pill": "Eyes",
    "recommend.eyes.h3": "Neutral shadow palette",
    "recommend.eyes.p": "Soft browns, satins, and warm tones that suit both bridal and everyday looks.",
    "recommend.finish.pill": "Finish",
    "recommend.finish.h3": "Setting spray",
    "recommend.finish.p": "Helps lock the final look in place while keeping the skin finish fresh and refined.",

    "account.eyebrow": "Account & Reservation",
    "account.h2": "Create an account and manage your booking",
    "account.tabsAria": "Account tabs",
    "account.tabRegister": "Register",
    "account.tabLogin": "Login",
    "account.fullName": "Full name",
    "account.email": "Email",
    "account.password": "Password",
    "account.phName": "Julia Client",
    "account.phEmail": "client@example.com",
    "account.phPasswordCreate": "Create password",
    "account.phPasswordEnter": "Enter password",
    "account.createAccount": "Create account",
    "account.signIn": "Sign in",
    "account.signedInPrefix": "Signed in as",
    "account.logout": "Log out",

    "booking.intro": "Pick an open slot on the calendar, then complete your details below.",
    "cal.prevMonth": "Previous month",
    "cal.nextMonth": "Next month",
    "cal.mo": "Mon",
    "cal.tu": "Tue",
    "cal.we": "Wed",
    "cal.th": "Thu",
    "cal.fr": "Fri",
    "cal.sa": "Sat",
    "cal.su": "Sun",
    "cal.noAvailability": "No availability",

    "slots.hintNone": "Select a date to see available times.",
    "slots.hintFor": "Available times for {{date}}",
    "slots.noOpen": "No open slots on this day. Please pick another date.",
    "slots.groupAria": "Available time slots",
    "slots.booked": "Already booked",

    "res.name": "Name",
    "res.email": "Email",
    "res.service": "Service",
    "res.selectService": "Select a service",
    "res.phone": "Phone",
    "res.notes": "Notes",
    "res.phName": "Your name",
    "res.phEmail": "Your email",
    "res.phNotes": "Tell Julia about the occasion, style, or your preferences.",
    "res.submit": "Send reservation",

    "service.signature": "Signature Makeup",
    "service.bridal": "Bridal Makeup",
    "service.trial": "Trial Session",
    "service.lesson": "1:1 Makeup Lesson",

    "integration.title": "Google Sheets ready",
    "integration.pBefore": "This page is prepared for a Google Apps Script backend. Add your script URL in ",
    "integration.pAfter": " to store account and reservation data in Google Sheets.",

    "myRes.title": "Your reservations",
    "myRes.ledeBefore": "Bookings linked to your account on ",
    "myRes.ledeStrong": "this device",
    "myRes.ledeAfter":
      ". You can cancel here to release the slot in the calendar. Bookings made in another browser are not listed until we add a server “list” API.",
    "myRes.listAria": "Your reservations",
    "myRes.empty": "No bookings yet — choose a date and time above.",
    "myRes.bookingFallback": "Booking",
    "myRes.phonePrefix": "Phone:",
    "myRes.cancel": "Cancel booking",

    "contact.eyebrow": "Contact",
    "contact.h2": "Reach out for bookings and beauty questions",
    "contact.studioTitle": "Studio details",
    "contact.hoursTitle": "Hours",
    "contact.noteTitle": "Booking note",
    "contact.line1": "Bratislava, Slovakia",
    "contact.hours1": "Mon - Fri: 09:00 - 18:00",
    "contact.hours2": "Saturday: 09:00 - 14:00",
    "contact.hours3": "Sunday: by request",
    "contact.noteP": "For bridal dates and group bookings, reserve early to secure your preferred time.",

    "footer.brand": "Juliere Beauty",
    "footer.tagline": "Minimal beauty, modern booking, elegant experience.",

    "lang.switchAria": "Language",
    "lang.en": "English",
    "lang.sk": "Slovenčina",

    "toast.dismiss": "Dismiss",
    "carousel.slideOf": "Slide {{n}} of {{total}}",

    "toast.bookingNotFound": "Could not find that booking.",
    "toast.bookingCancelled": "Booking cancelled. The time slot is available again.",
    "toast.accountExists": "An account with this email already exists.",
    "toast.welcome": "Welcome, {{name}}. Your account is ready — you can book a slot below.",
    "toast.wrongLogin": "Wrong email or password.",
    "toast.signedIn": "Signed in as {{name}}. Pick a date and time to reserve.",
    "toast.pickSlot": "Choose a date on the calendar, then select a time slot.",
    "toast.slotTaken": "That slot was just taken. Please pick another time.",
    "toast.reservationSaved": "Reservation saved: {{date}} at {{time}}. Julia will confirm soon.",
    "toast.signedOut": "You have been signed out.",
    "toast.syncFailed": "Failed to sync with Google Sheets.",
    "toast.badResponse":
      "Server returned a non-JSON response. Check the web app URL and Apps Script deployment.",
    "toast.sheetsFailed": "Google Sheets request failed.",
  },
  sk: {
    "meta.title": "Juliere Beauty | Moderné kozmetické štúdio",
    "meta.description":
      "Juliere Beauty — elegantné vizážistické štúdio s portfóliom, cenníkom, rezerváciou a prehľadom termínov.",

    "hero.carouselAria": "Juliere Beauty",
    "hero.slide1.alt": "Portrét — profesionálny makeup look, Juliere Beauty",
    "hero.slide1.caption": "Vybraný portrét pre Juliere Beauty",
    "hero.slide2.alt": "Luxusné produkty na líčenie — štúdio Juliere Beauty",
    "hero.slide2.caption": "Ploché zátišie profesionálnych produktov na líčenie",
    "hero.slide3.alt": "Portrét — soft glam makeup, Juliere Beauty",
    "hero.slide3.caption": "Portrét s profesionálnym makeup lookom",
    "hero.tagline": "Moderné kozmetické štúdio",
    "hero.prevSlide": "Predchádzajúci snímok",
    "hero.nextSlide": "Ďalší snímok",
    "hero.chooseSlide": "Výber snímku",
    "hero.scroll": "Ďalej",

    "header.brandAria": "Domov Juliere Beauty",
    "header.brandStrong": "Juliere Beauty",
    "header.brandSub": "Vizážistka",
    "header.openMenu": "Otvoriť menu",
    "header.closeMenu": "Zavrieť menu",
    "header.navMain": "Hlavná navigácia",

    "nav.about": "O mne",
    "nav.portfolio": "Portfólio",
    "nav.prices": "Cenník",
    "nav.recommend": "Julia odporúča",
    "nav.account": "Účet",
    "nav.bookings": "Moje rezervácie",
    "nav.contact": "Kontakt",
    "nav.book": "Rezervovať",

    "intro.text":
      "Soft glam, nadčasové svadobné líčenia a prémiové beauty zážitky — rezervujte si termín online.",
    "intro.reserve": "Rezervovať teraz",
    "intro.portfolio": "Pozrieť portfólio",

    "stats.years": "6+ rokov",
    "stats.yearsDesc": "profesionálnej praxe",
    "stats.sessions": "300+",
    "stats.sessionsDesc": "dokončených vizáží",
    "stats.rating": "4,9/5",
    "stats.ratingDesc": "priemerná spokojnosť klientov",

    "about.eyebrow": "O Julii",
    "about.h2": "Minimalistické, vyberané a postavené na sebavedomí.",
    "about.p1":
      "Julia je vizážistka zameraná na sviežu pleť, elegantné detaily a líčenie, ktoré je krásne naživo aj na fotkách. Každá vizitka je šitá na mieru — od jemného denného líčenia až po plný svadobný glam.",
    "about.p2":
      "Zážitok v štúdiu je zámerne jednoduchý: prezrite si služby, vytvorte si účet, rezervujte si čas a majte všetko prehľadne na jednom mieste.",

    "portfolio.eyebrow": "Portfólio",
    "portfolio.h2": "Nedávna tvorba",
    "portfolio.bridal.label": "Svadobný rozžiarený look",
    "portfolio.bridal.p":
      "Žiariaca pleť, jemný trblietavý efekt a romantická definícia pre nadčasový svadobný finiš.",
    "portfolio.soft.label": "Soft glam",
    "portfolio.soft.p": "Vyvážený glam s upravenými obočiami, modelovanou pleťou a rozostrenými očami.",
    "portfolio.editorial.label": "Editoriálne čisté",
    "portfolio.editorial.p": "Svieža moderná krása s úmyselnou textúrou a decentným luxusom.",
    "portfolio.evening.label": "Večerný luxus",
    "portfolio.evening.p": "Definované oči, žiariaca pleť a dlhotrvajúca vizáž na špeciálne príležitosti.",

    "prices.eyebrow": "Cenník",
    "prices.h2": "Prehľadné balíčky s prémiovým finišom",
    "prices.signature.tag": "Najžiadanejšie",
    "prices.signature.h3": "Signature makeup",
    "prices.signature.p": "Ideálne na akcie, večere, oslavy a vybrané líčenie od dňa po večer.",
    "prices.bridal.h3": "Svadobné líčenie",
    "prices.bridal.p": "Zahŕňa konzultáciu, dlhotrvajúcu aplikáciu a plánovanie beauty looku na svadobný deň.",
    "prices.trial.h3": "Skúšobné líčenie",
    "prices.trial.p": "Otestujte a doladte preferovaný look pred veľkou udalosťou alebo svadbou.",
    "prices.lesson.h3": "Individuálna lekcia líčenia 1:1",
    "prices.lesson.p": "Osobné odporúčania produktov a postup kroku za krokom na mieru.",

    "recommend.eyebrow": "Julia odporúča",
    "recommend.h2": "Obľúbené produkty",
    "recommend.prep.pill": "Príprava pleti",
    "recommend.prep.h3": "Hydratačná podkladová báza",
    "recommend.prep.p": "Vytvorí hladkú, žiarivú bázu a pomáha, aby líčenie držalo celý deň.",
    "recommend.complexion.pill": "Pleť",
    "recommend.complexion.h3": "Ľahký make-up",
    "recommend.complexion.p": "Vrstviteľné krytie s prirodzeným finišom — pleť stále vyzerá ako pleť.",
    "recommend.eyes.pill": "Oči",
    "recommend.eyes.h3": "Neutrálna paleta očných tieňov",
    "recommend.eyes.p": "Jemné hnedé, satény a teplé tóny vhodné na svadbu aj na bežný deň.",
    "recommend.finish.pill": "Záver",
    "recommend.finish.h3": "Fixačný sprej",
    "recommend.finish.p": "Pomáha uzamknúť finálny look a udržať pleť sviežu a vybranú.",

    "account.eyebrow": "Účet a rezervácia",
    "account.h2": "Vytvorte si účet a spravujte rezerváciu",
    "account.tabsAria": "Karty účtu",
    "account.tabRegister": "Registrácia",
    "account.tabLogin": "Prihlásenie",
    "account.fullName": "Celé meno",
    "account.email": "E-mail",
    "account.password": "Heslo",
    "account.phName": "Julia Klient",
    "account.phEmail": "klient@example.com",
    "account.phPasswordCreate": "Vytvorte heslo",
    "account.phPasswordEnter": "Zadajte heslo",
    "account.createAccount": "Vytvoriť účet",
    "account.signIn": "Prihlásiť sa",
    "account.signedInPrefix": "Prihlásený/á ako",
    "account.logout": "Odhlásiť sa",

    "booking.intro": "Vyberte voľný termín v kalendári a nižšie doplňte údaje.",
    "cal.prevMonth": "Predchádzajúci mesiac",
    "cal.nextMonth": "Ďalší mesiac",
    "cal.mo": "Po",
    "cal.tu": "Ut",
    "cal.we": "St",
    "cal.th": "Št",
    "cal.fr": "Pi",
    "cal.sa": "So",
    "cal.su": "Ne",
    "cal.noAvailability": "Bez voľných termínov",

    "slots.hintNone": "Vyberte dátum a zobrazia sa voľné časy.",
    "slots.hintFor": "Voľné časy na {{date}}",
    "slots.noOpen": "V tento deň nie sú voľné termíny. Vyberte iný dátum.",
    "slots.groupAria": "Voľné časové sloty",
    "slots.booked": "Obsadené",

    "res.name": "Meno",
    "res.email": "E-mail",
    "res.service": "Služba",
    "res.selectService": "Vyberte službu",
    "res.phone": "Telefón",
    "res.notes": "Poznámky",
    "res.phName": "Vaše meno",
    "res.phEmail": "Váš e-mail",
    "res.phNotes": "Napíšte Julii o príležitosti, štýle alebo preferenciách.",
    "res.submit": "Odoslať rezerváciu",

    "service.signature": "Signature makeup",
    "service.bridal": "Svadobné líčenie",
    "service.trial": "Skúšobné líčenie",
    "service.lesson": "Individuálna lekcia 1:1",

    "integration.title": "Pripravené na Google Sheets",
    "integration.pBefore":
      "Táto stránka je pripravená na backend cez Google Apps Script. URL skriptu pridajte do súboru ",
    "integration.pAfter": " — údaje účtov a rezervácií sa uložia do Google Sheets.",

    "myRes.title": "Vaše rezervácie",
    "myRes.ledeBefore": "Rezervácie viazané na váš účet na ",
    "myRes.ledeStrong": "tomto zariadení",
    "myRes.ledeAfter":
      ". Tu môžete zrušiť rezerváciu a uvoľniť slot v kalendári. Rezervácie z iného prehliadača sa nezobrazia, kým nepribudne serverové API na zoznam.",
    "myRes.listAria": "Vaše rezervácie",
    "myRes.empty": "Zatiaľ žiadne rezervácie — vyberte dátum a čas vyššie.",
    "myRes.bookingFallback": "Rezervácia",
    "myRes.phonePrefix": "Tel.:",
    "myRes.cancel": "Zrušiť rezerváciu",

    "contact.eyebrow": "Kontakt",
    "contact.h2": "Ozvite sa ohľadom rezervácií a beauty otázok",
    "contact.studioTitle": "Údaje štúdia",
    "contact.hoursTitle": "Otváracie hodiny",
    "contact.noteTitle": "Poznámka k rezervácii",
    "contact.line1": "Bratislava, Slovensko",
    "contact.hours1": "Po - Pia: 09:00 - 18:00",
    "contact.hours2": "Sobota: 09:00 - 14:00",
    "contact.hours3": "Nedeľa: na vyžiadanie",
    "contact.noteP":
      "Pri svadobných termínoch a skupinových rezerváciách si rezervujte včas, aby ste mali preferovaný čas.",

    "footer.brand": "Juliere Beauty",
    "footer.tagline": "Minimalistická krása, moderná rezervácia, elegantný zážitok.",

    "lang.switchAria": "Jazyk",
    "lang.en": "English",
    "lang.sk": "Slovenčina",

    "toast.dismiss": "Zavrieť",
    "carousel.slideOf": "Snímka {{n}} z {{total}}",

    "toast.bookingNotFound": "Túto rezerváciu sa nepodarilo nájsť.",
    "toast.bookingCancelled": "Rezervácia bola zrušená. Časový slot je opäť voľný.",
    "toast.accountExists": "Účet s týmto e-mailom už existuje.",
    "toast.welcome": "Vitajte, {{name}}. Váš účet je pripravený — nižšie si môžete rezervovať termín.",
    "toast.wrongLogin": "Nesprávny e-mail alebo heslo.",
    "toast.signedIn": "Prihlásený/á ako {{name}}. Vyberte dátum a čas rezervácie.",
    "toast.pickSlot": "Vyberte dátum v kalendári a potom časový slot.",
    "toast.slotTaken": "Tento termín bol práve obsadený. Vyberte iný čas.",
    "toast.reservationSaved": "Rezervácia uložená: {{date}} o {{time}}. Julia čoskoro potvrdí.",
    "toast.signedOut": "Boli ste odhlásený/á.",
    "toast.syncFailed": "Synchronizácia s Google Sheets zlyhala.",
    "toast.badResponse":
      "Server nevrátil platný JSON. Skontrolujte URL webovej aplikácie a nasadenie Apps Script.",
    "toast.sheetsFailed": "Požiadavka do Google Sheets zlyhala.",
  },
};

/** Merged from Google Sheet at load; empty values fall back to bundled copy. */
let sheetOverrides = { en: {}, sk: {} };

/** Optional image URLs from sheet tab IMG (`data-site-img` keys). */
let sheetImageUrls = {};

/**
 * @param {unknown} raw
 * @returns {Record<string, string>}
 */
function normalizeStringMap(raw) {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  /** @type {Record<string, string>} */
  const out = {};

  for (const [k, v] of Object.entries(raw)) {
    const key = k.trim();
    if (!key || key.startsWith("#")) {
      continue;
    }

    out[key] = v === null || v === undefined ? "" : String(v);
  }

  return out;
}

/**
 * Fetches copy from the dedicated Site Texts Apps Script (tabs ENG + SK in the bound sheet).
 */
export async function loadTextsFromGoogleSheet() {
  sheetOverrides = { en: {}, sk: {} };
  sheetImageUrls = {};

  if (!CONFIG.useSheetTexts || !CONFIG.contentScriptUrl?.trim()) {
    return;
  }

  try {
    const response = await fetch(CONFIG.contentScriptUrl.trim(), {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({ action: "getSiteTexts" }),
    });

    const text = await response.text();
    const data = JSON.parse(text);

    if (data?.ok && data.en && data.sk) {
      sheetOverrides.en = normalizeStringMap(data.en);
      sheetOverrides.sk = normalizeStringMap(data.sk);
      sheetImageUrls = normalizeStringMap(data.img || {});
    }
  } catch (error) {
    console.warn("[i18n] Could not load texts from Google Sheet; using bundled strings.", error);
  }
}

/**
 * Accepts https/http URLs or same-site paths (`assets/...` or `/...`).
 * @param {unknown} raw
 * @returns {string | null}
 */
function resolveSiteImageUrl(raw) {
  if (raw === undefined || raw === null) {
    return null;
  }

  const s = String(raw).trim();
  if (!s) {
    return null;
  }

  if (/^https:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      return u.protocol === "https:" ? u.href : null;
    } catch {
      return null;
    }
  }

  if (/^http:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      return u.protocol === "http:" ? u.href : null;
    } catch {
      return null;
    }
  }

  if (/^assets\//i.test(s)) {
    return s;
  }

  if (s.startsWith("/") && !s.startsWith("//")) {
    return s;
  }

  return null;
}

/** Apply `src` from sheet for elements with `data-site-img` (hero and future images). */
export function applySheetImageUrls() {
  document.querySelectorAll("img[data-site-img]").forEach((img) => {
    const key = img.dataset.siteImg?.trim();
    if (!key) {
      return;
    }

    const resolved = resolveSiteImageUrl(sheetImageUrls[key]);
    if (resolved) {
      img.src = resolved;
    }
  });
}

/**
 * @returns {"en" | "sk"}
 */
export function getLang() {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === "sk" || stored === "en") {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return "sk";
}

/**
 * @param {"en" | "sk"} lang
 */
export function setLang(lang) {
  if (lang !== "en" && lang !== "sk") {
    return;
  }
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
  document.documentElement.lang = lang === "sk" ? "sk" : "en";
  applyTranslations();
  window.dispatchEvent(new CustomEvent("juliamakeup:lang", { detail: { lang } }));
}

/**
 * @param {string} key
 * @param {Record<string, string | number>} [vars]
 */
export function t(key, vars) {
  const lang = getLang();
  const fromSheet = sheetOverrides[lang]?.[key];
  const sheetVal = fromSheet !== undefined && String(fromSheet).length > 0 ? String(fromSheet) : null;
  let str =
    sheetVal ??
    BUNDLED_STRINGS[lang]?.[key] ??
    BUNDLED_STRINGS.en[key] ??
    key;
  if (vars && typeof str === "string") {
    for (const [k, v] of Object.entries(vars)) {
      str = str.split(`{{${k}}}`).join(String(v));
    }
  }
  return str;
}

export function getDateLocale() {
  return getLang() === "sk" ? "sk-SK" : "en-GB";
}

export function applyTranslations() {
  const lang = getLang();

  const titleEl = document.getElementById("page-title");
  if (titleEl) {
    titleEl.textContent = t("meta.title");
  }

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (key) {
      el.textContent = t(key);
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    if (key && "placeholder" in el) {
      el.placeholder = t(key);
    }
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.dataset.i18nAria;
    if (key) {
      el.setAttribute("aria-label", t(key));
    }
  });

  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.dataset.i18nTitle;
    if (key) {
      el.title = t(key);
    }
  });

  document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    const key = el.dataset.i18nAlt;
    if (key) {
      el.alt = t(key);
    }
  });

  document.querySelectorAll("meta[data-i18n-content]").forEach((el) => {
    const key = el.dataset.i18nContent;
    if (key) {
      el.setAttribute("content", t(key));
    }
  });

  document.querySelectorAll("option[data-i18n-option]").forEach((opt) => {
    const key = opt.dataset.i18nOption;
    if (key) {
      opt.textContent = t(key);
    }
  });

  document.querySelectorAll("[data-lang-set]").forEach((btn) => {
    const l = btn.dataset.langSet;
    const active = l === lang;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

export async function initI18n() {
  await loadTextsFromGoogleSheet();
  document.documentElement.lang = getLang() === "sk" ? "sk" : "en";
  applyTranslations();
  applySheetImageUrls();
  document.querySelectorAll("[data-lang-set]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = btn.dataset.langSet;
      if (next === "en" || next === "sk") {
        setLang(next);
      }
    });
  });
}

/** Bundled defaults; use `npm run export:site-texts` to regenerate sheet seeds. */
export { BUNDLED_STRINGS };
