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
      "Juliere Beauty — elegant makeup studio with portfolio, pricing, online booking, and contact.",
    "meta.titleReviews": "Juliere Beauty | Reviews",
    "meta.descriptionReviews":
      "Client reviews and testimonials — Juliere Beauty makeup studio.",
    "meta.titleBooking": "Juliere Beauty | Book online",
    "meta.descriptionBooking":
      "Reserve a makeup appointment — choose a service and pick an available time.",

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
    "header.brandPrimary": "Juliere",
    "header.brandSecondary": "Beauty",
    "header.openMenu": "Open menu",
    "header.closeMenu": "Close menu",
    "header.navMain": "Main",

    "nav.about": "About",
    "nav.portfolio": "Portfolio",
    "nav.prices": "Prices & services",
    "nav.reviews": "Reviews",
    "nav.beforeVisit": "Before your appointment",
    "nav.contact": "Contact",
    "nav.booking": "Book",
    "nav.faq": "Q&A",

    "intro.text":
      "Soft glam, timeless bridal looks, and polished beauty experiences — get in touch to plan your visit.",
    "intro.portfolio": "View portfolio",
    "intro.book": "Book a slot",

    "stats.years": "8+ years",
    "stats.yearsDesc": "professional artistry experience",
    "stats.sessions": "300+",
    "stats.sessionsDesc": "beauty sessions completed",
    "stats.rating": "4.9/5",
    "stats.ratingDesc": "average from client reviews",

    "about.eyebrow": "About Julia",
    "about.h2": "About me",
    "about.statsAria": "About highlights",
    "about.photoAlt": "Julia — Juliere Beauty makeup artist",
    "about.p1":
      "Julia is a makeup artist focused on fresh skin, elegant detail, and makeup that looks as beautiful in person as it does in photos. Every appointment is tailored to the client, from subtle everyday polish to full bridal glam.",
    "about.p2":
      "Browse services and pricing, then reach out — from first message to your appointment, everything stays clear and calm.",

    "portfolio.eyebrow": "Portfolio",
    "portfolio.h2": "Recent beauty work",
    "portfolio.carouselAria": "Portfolio — browse looks",
    "portfolio.bridal.label": "Bridal glow",
    "portfolio.bridal.p":
      "Radiant skin, soft shimmer, and romantic definition for a timeless wedding finish.",
    "portfolio.soft.label": "Soft glam",
    "portfolio.soft.p": "Balanced glam with polished brows, sculpted complexion, and diffused eyes.",
    "portfolio.editorial.label": "Editorial clean",
    "portfolio.editorial.p": "Fresh, modern beauty with intentional texture and understated luxury.",
    "portfolio.evening.label": "Evening luxe",
    "portfolio.evening.p": "Defined eyes, glowing skin, and long-wear artistry for special events.",

    "portfolio.gallery.openSuffix": "Open photo gallery",
    "portfolio.gallery.close": "Close gallery",
    "portfolio.gallery.bridal.1": "Bridal makeup — portrait",
    "portfolio.gallery.bridal.2": "Bridal makeup — soft glam portrait",
    "portfolio.gallery.bridal.3": "Professional makeup products used for bridal looks",
    "portfolio.gallery.soft.1": "Soft glam makeup — portrait",
    "portfolio.gallery.soft.2": "Soft glam — beauty portrait",
    "portfolio.gallery.soft.3": "Makeup products — soft glam session",
    "portfolio.gallery.editorial.1": "Editorial beauty — product flat lay",
    "portfolio.gallery.editorial.2": "Editorial clean — portrait",
    "portfolio.gallery.evening.1": "Evening makeup — portrait",
    "portfolio.gallery.evening.2": "Evening luxe — beauty portrait",
    "portfolio.gallery.evening.3": "Evening look — products",

    "portfolio.gallery.bridal.caption1": "Ceremony-ready skin with a soft, luminous finish.",
    "portfolio.gallery.bridal.caption2": "Curated long-wear products chosen for photos and long days.",
    "portfolio.gallery.bridal.caption3": "Romantic definition that stays fresh from vows to the last dance.",

    "portfolio.gallery.soft.caption1": "Balanced soft glam — polished in person, stunning on camera.",
    "portfolio.gallery.soft.caption2": "Even light and gentle contour for a refined everyday glow.",
    "portfolio.gallery.soft.caption3": "Texture and tone matched to your skin and the occasion.",

    "portfolio.gallery.editorial.caption1": "Clean editorial mood — texture and light kept intentional.",
    "portfolio.gallery.editorial.caption2": "Modern minimal beauty with understated luxury.",

    "portfolio.gallery.evening.caption1": "Defined eyes and glowing skin for after-dark events.",
    "portfolio.gallery.evening.caption2": "Sculpted complexion with a long-wear evening finish.",
    "portfolio.gallery.evening.caption3": "Products selected for flash photography and hours of wear.",

    "portfolio.gallery.bridal.tag1": "@nina.m",
    "portfolio.gallery.bridal.tag2": "@elena.k",
    "portfolio.gallery.bridal.tag3": "@sophia",

    "portfolio.gallery.soft.tag1": "@tereza.v",
    "portfolio.gallery.soft.tag2": "@lucia.p",
    "portfolio.gallery.soft.tag3": "@nina.m",

    "portfolio.gallery.editorial.tag1": "@julia.studio",
    "portfolio.gallery.editorial.tag2": "@elena.k",

    "portfolio.gallery.evening.tag1": "@sophia",
    "portfolio.gallery.evening.tag2": "@tereza.v",
    "portfolio.gallery.evening.tag3": "@lucia.p",

    "prices.eyebrow": "Pricing & services",
    "prices.h2": "Packages tailored to your occasion",
    "prices.signature.tag": "Most requested",
    "prices.signature.h3": "Signature Makeup",
    "prices.signature.p": "Perfect for events, dinners, celebrations, and polished day-to-night beauty.",
    "prices.bridal.h3": "Bridal Makeup",
    "prices.bridal.p": "Includes consultation, long-wear application, and bridal-day beauty planning.",
    "prices.trial.h3": "Trial Session",
    "prices.trial.p": "Test and refine your preferred look before a major event or wedding day.",
    "prices.lesson.h3": "1:1 Makeup Lesson",
    "prices.lesson.p": "Personalized product guidance and a step-by-step routine tailored to you.",
    "prices.carouselAria": "Pricing and services — browse packages",
    "reviews.carouselAria": "Client reviews — browse testimonials",
    "beforeVisit.carouselAria": "Before your visit — browse tips",
    "prices.detail.openSuffix": "Open service details",
    "prices.detail.close": "Close details",
    "prices.signature.price": "65 EUR",
    "prices.bridal.price": "120 EUR",
    "prices.trial.price": "80 EUR",
    "prices.lesson.price": "95 EUR",
    "prices.signature.duration": "Duration: about 75 minutes",
    "prices.bridal.duration": "Duration: about 90–120 minutes",
    "prices.trial.duration": "Duration: about 90 minutes",
    "prices.lesson.duration": "Duration: about 2 hours",
    "prices.signature.detail":
      "Signature makeup is a full-face look designed for real life and photos: even skin, balanced color, and finishes that stay polished through the evening.\n\nWe start with skin prep and tailor coverage, eyes, and lips to your outfit and lighting. Bring references if you like — the goal is a refined, confident version of you.",
    "prices.bridal.detail":
      "Bridal makeup includes a dedicated consultation, a long-wear application, and a clear plan for the wedding day timeline so you feel calm and camera-ready.\n\nWe cover trial options, touch-ups, and how the look pairs with your dress, veil, and photography. On the day, the focus is luminous skin, lasting definition, and a finish that feels true to you.",
    "prices.trial.detail":
      "A trial is the best way to lock in your look before a big event or wedding — we test colors, intensity, and wear time without rushing.\n\nYou’ll leave with notes on what worked and small adjustments for the final appointment. If you’re deciding between styles, we can explore more than one direction in the same session when time allows.",
    "prices.lesson.detail":
      "This one-to-one lesson is built around your skin, products, and goals — from quick everyday polish to a more defined evening routine.\n\nWe go step by step: tools, order of application, and how to fix common issues. You’ll get a simple routine you can repeat at home and suggestions for products that fit your budget.",

    "reviews.eyebrow": "Reviews",
    "reviews.h2": "What clients say",
    "reviews.c1.pill": "Bridal",
    "reviews.c1.h3": "Sophia K.",
    "reviews.c1.p": "Calm, precise, and the makeup lasted perfectly through the whole day and night.",
    "reviews.c2.pill": "Event",
    "reviews.c2.h3": "Nina M.",
    "reviews.c2.p": "Exactly the soft glam I wanted — natural in person, stunning in photos.",
    "reviews.c3.pill": "Lesson",
    "reviews.c3.h3": "Tereza V.",
    "reviews.c3.p": "The 1:1 lesson finally made my everyday routine feel doable and elegant.",
    "reviews.c4.pill": "Trial",
    "reviews.c4.h3": "Lucia P.",
    "reviews.c4.p": "Trial before the wedding gave us time to refine everything — zero stress on the day.",

    "beforeVisit.eyebrow": "Before you arrive",
    "beforeVisit.h2": "A few tips so your appointment goes smoothly",
    "beforeVisit.t1.pill": "Skin",
    "beforeVisit.t1.h3": "Come with a clean face",
    "beforeVisit.t1.p": "Arrive without makeup if you can, and skip heavy creams right before the session.",
    "beforeVisit.t2.pill": "References",
    "beforeVisit.t2.h3": "Bring inspiration",
    "beforeVisit.t2.p": "Save a few photos you like — it helps align on tone, intensity, and finish.",
    "beforeVisit.t3.pill": "Outfit",
    "beforeVisit.t3.h3": "Neckline & jewelry",
    "beforeVisit.t3.p": "Wear or bring something close to your event neckline so the look feels cohesive.",
    "beforeVisit.t4.pill": "Timing",
    "beforeVisit.t4.h3": "Plan a little buffer",
    "beforeVisit.t4.p": "Artistry takes time — allow a few extra minutes so we never have to rush the details.",

    "faq.eyebrow": "Q&A",
    "faq.h2": "Common questions",
    "faq.q1": "How do I book?",
    "faq.a1":
      "Use the booking page to pick an open slot, or reach out by email or phone. Julia will confirm the details.",
    "faq.q2": "Can I change or cancel?",
    "faq.a2":
      "Contact the studio as soon as your plans shift and we will adjust the appointment together.",
    "faq.q3": "Do I need a trial for bridal makeup?",
    "faq.a3":
      "A trial is recommended so the look is locked in before the big day — but it is optional depending on your timeline.",
    "faq.q4": "What if I have sensitive skin?",
    "faq.a4":
      "Mention it when you reach out. Julia uses professional products and can adjust the routine to your needs.",

    "service.signature": "Signature Makeup",
    "service.bridal": "Bridal Makeup",
    "service.trial": "Trial Session",
    "service.lesson": "1:1 Makeup Lesson",

    "booking.eyebrow": "Booking",
    "booking.h2": "Choose an available time",
    "booking.intro":
      "First choose a service, then pick a date and time. Your booking is saved and that slot is marked busy for others.",
    "booking.serviceFirst": "Which service do you want?",
    "booking.chooseServiceFirst": "Choose a service to see available dates and times.",
    "booking.noSlotsForService": "There are no open slots for this service yet — try another service or contact us.",
    "booking.configNeeded": "Add your booking web app URL in assets/js/config.js (bookingScriptUrl).",
    "booking.slotsLoading": "Loading available times…",
    "booking.slotsEmpty": "No open slots right now — check back soon or contact us directly.",
    "booking.slotsError": "Could not load availability. Try again later.",
    "booking.slotsHint": "Choose a time for the selected day.",
    "booking.pickDate": "Select a date.",
    "booking.noSlotsThisDay": "No available slots for this day.",
    "booking.slotsGroupAria": "Available time slots",
    "booking.calPrev": "Previous month",
    "booking.calNext": "Next month",
    "booking.calGridAria": "Choose a day",
    "booking.calMo": "Mon",
    "booking.calTu": "Tue",
    "booking.calWe": "Wed",
    "booking.calTh": "Thu",
    "booking.calFr": "Fri",
    "booking.calSa": "Sat",
    "booking.calSu": "Sun",
    "booking.name": "Name",
    "booking.email": "Email",
    "booking.phone": "Phone",
    "booking.service": "Service",
    "booking.notes": "Notes",
    "booking.phName": "Your name",
    "booking.phEmail": "you@example.com",
    "booking.phPhone": "+421…",
    "booking.phNotes": "Occasion, style, or preferences",
    "booking.selectService": "Select a service",
    "booking.submit": "Send reservation",
    "booking.sending": "Sending…",
    "booking.selectSlot": "Please choose a time slot first.",
    "booking.success": "Reservation sent. Julia will confirm soon.",
    "booking.slotTaken": "That slot was just taken. Please pick another time.",
    "booking.error": "Something went wrong. Please try again or contact us.",

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
    "contact.mapHeading": "Studio location",
    "contact.mapTitle": "Google Map — studio location",

    "footer.brand": "Juliere Beauty",
    "footer.socialAria": "Social media",
    "footer.socialInstagram": "Instagram",
    "footer.socialFacebook": "Facebook",
    "footer.socialX": "X",

    "lang.switchAria": "Language",
    "lang.en": "English",
    "lang.sk": "Slovenčina",

    "toast.dismiss": "Dismiss",
    "carousel.slideOf": "Slide {{n}} of {{total}}",
  },
  sk: {
    "meta.title": "Juliere Beauty | Moderné kozmetické štúdio",
    "meta.titleReviews": "Juliere Beauty | Recenzie",
    "meta.descriptionReviews":
      "Recenzie a referencie klientov — kozmetické štúdio Juliere Beauty.",
    "meta.titleBooking": "Juliere Beauty | Online rezervácia",
    "meta.descriptionBooking":
      "Rezervujte si termín na líčenie — zvoľte službu a voľný čas.",
    "meta.description":
      "Juliere Beauty — elegantné vizážistické štúdio s portfóliom, cenníkom, online rezerváciou a kontaktom.",

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
    "header.brandPrimary": "Juliere",
    "header.brandSecondary": "Beauty",
    "header.openMenu": "Otvoriť menu",
    "header.closeMenu": "Zavrieť menu",
    "header.navMain": "Hlavná navigácia",

    "nav.about": "O mne",
    "nav.portfolio": "Portfólio",
    "nav.prices": "Cenník a služby",
    "nav.reviews": "Recenzie",
    "nav.beforeVisit": "Pred termínom",
    "nav.contact": "Kontakt",
    "nav.booking": "Rezervácia",
    "nav.faq": "Q&A",

    "intro.text":
      "Soft glam, nadčasové svadobné líčenia a prémiové beauty zážitky — ozvite sa a dohodnite si vizitku.",
    "intro.portfolio": "Pozrieť portfólio",
    "intro.book": "Rezervovať termín",

    "stats.years": "8+ rokov",
    "stats.yearsDesc": "profesionálnej praxe",
    "stats.sessions": "300+",
    "stats.sessionsDesc": "dokončených vizáží",
    "stats.rating": "4,9/5",
    "stats.ratingDesc": "priemer z recenzií klientov",

    "about.eyebrow": "O Julii",
    "about.h2": "O mne",
    "about.statsAria": "Prehľad",
    "about.photoAlt": "Julia — vizážistka Juliere Beauty",
    "about.p1":
      "Julia je vizážistka zameraná na sviežu pleť, elegantné detaily a líčenie, ktoré je krásne naživo aj na fotkách. Každá vizitka je šitá na mieru — od jemného denného líčenia až po plný svadobný glam.",
    "about.p2":
      "Prezrite si služby a cenník, potom sa ozvite — od prvej správy až po vizitku je všetko prehľadné a pokojné.",

    "portfolio.eyebrow": "Portfólio",
    "portfolio.h2": "Nedávna tvorba",
    "portfolio.carouselAria": "Portfólio — prehliadka lookov",
    "portfolio.bridal.label": "Svadobný rozžiarený look",
    "portfolio.bridal.p":
      "Žiariaca pleť, jemný trblietavý efekt a romantická definícia pre nadčasový svadobný finiš.",
    "portfolio.soft.label": "Soft glam",
    "portfolio.soft.p": "Vyvážený glam s upravenými obočiami, modelovanou pleťou a rozostrenými očami.",
    "portfolio.editorial.label": "Editoriálne čisté",
    "portfolio.editorial.p": "Svieža moderná krása s úmyselnou textúrou a decentným luxusom.",
    "portfolio.evening.label": "Večerný luxus",
    "portfolio.evening.p": "Definované oči, žiariaca pleť a dlhotrvajúca vizáž na špeciálne príležitosti.",

    "portfolio.gallery.openSuffix": "Otvoriť fotogalériu",
    "portfolio.gallery.close": "Zatvoriť galériu",
    "portfolio.gallery.bridal.1": "Svadobné líčenie — portrét",
    "portfolio.gallery.bridal.2": "Svadobné líčenie — portrét soft glam",
    "portfolio.gallery.bridal.3": "Profesionálne produkty na svadobné líčenie",
    "portfolio.gallery.soft.1": "Soft glam — portrét",
    "portfolio.gallery.soft.2": "Soft glam — beauty portrét",
    "portfolio.gallery.soft.3": "Produkty na soft glam",
    "portfolio.gallery.editorial.1": "Editoriálna krása — produkty",
    "portfolio.gallery.editorial.2": "Editoriálne čisté líčenie — portrét",
    "portfolio.gallery.evening.1": "Večerné líčenie — portrét",
    "portfolio.gallery.evening.2": "Večerný luxus — portrét",
    "portfolio.gallery.evening.3": "Večerný look — produkty",

    "portfolio.gallery.bridal.caption1": "Pleť pripravená na obrad so sviežim, jemne žiariacim finišom.",
    "portfolio.gallery.bridal.caption2": "Dlhotrvajúce produkty vybrané na fotky aj celý deň.",
    "portfolio.gallery.bridal.caption3": "Romantická definícia, ktorá vydrží od sľubu po posledný tanec.",

    "portfolio.gallery.soft.caption1": "Vyvážený soft glam — upravený naživo, výrazný na fotkách.",
    "portfolio.gallery.soft.caption2": "Jemné svetlo a decentná kontúra pre jemný denný lesk.",
    "portfolio.gallery.soft.caption3": "Textúra a tón prispôsobené pleti a príležitosti.",

    "portfolio.gallery.editorial.caption1": "Čistý editoriálny nádych — textúra a svetlo úmyselne.",
    "portfolio.gallery.editorial.caption2": "Moderná minimalistická krása s decentným luxusom.",

    "portfolio.gallery.evening.caption1": "Definované oči a žiariaca pleť na večerné udalosti.",
    "portfolio.gallery.evening.caption2": "Modelovaná pleť s dlhotrvajúcim večerným finišom.",
    "portfolio.gallery.evening.caption3": "Produkty vybrané na fotenie s bleskom a dlhé nosenie.",

    "portfolio.gallery.bridal.tag1": "@nina.m",
    "portfolio.gallery.bridal.tag2": "@elena.k",
    "portfolio.gallery.bridal.tag3": "@sophia",

    "portfolio.gallery.soft.tag1": "@tereza.v",
    "portfolio.gallery.soft.tag2": "@lucia.p",
    "portfolio.gallery.soft.tag3": "@nina.m",

    "portfolio.gallery.editorial.tag1": "@julia.studio",
    "portfolio.gallery.editorial.tag2": "@elena.k",

    "portfolio.gallery.evening.tag1": "@sophia",
    "portfolio.gallery.evening.tag2": "@tereza.v",
    "portfolio.gallery.evening.tag3": "@lucia.p",

    "prices.eyebrow": "Cenník a služby",
    "prices.h2": "Balíčky podľa príležitosti",
    "prices.signature.tag": "Najžiadanejšie",
    "prices.signature.h3": "Signature makeup",
    "prices.signature.p": "Ideálne na akcie, večere, oslavy a vybrané líčenie od dňa po večer.",
    "prices.bridal.h3": "Svadobné líčenie",
    "prices.bridal.p": "Zahŕňa konzultáciu, dlhotrvajúcu aplikáciu a plánovanie beauty looku na svadobný deň.",
    "prices.trial.h3": "Skúšobné líčenie",
    "prices.trial.p": "Otestujte a doladte preferovaný look pred veľkou udalosťou alebo svadbou.",
    "prices.lesson.h3": "Individuálna lekcia líčenia 1:1",
    "prices.lesson.p": "Osobné odporúčania produktov a postup kroku za krokom na mieru.",
    "prices.carouselAria": "Cenník a služby — prehľad balíčkov",
    "reviews.carouselAria": "Recenzie klientok — prehľad",
    "beforeVisit.carouselAria": "Pred termínom — tipy",
    "prices.detail.openSuffix": "Otvoriť podrobnosti služby",
    "prices.detail.close": "Zatvoriť podrobnosti",
    "prices.signature.price": "65 EUR",
    "prices.bridal.price": "120 EUR",
    "prices.trial.price": "80 EUR",
    "prices.lesson.price": "95 EUR",
    "prices.signature.duration": "Trvanie: cca 75 minút",
    "prices.bridal.duration": "Trvanie: cca 90–120 minút",
    "prices.trial.duration": "Trvanie: cca 90 minút",
    "prices.lesson.duration": "Trvanie: cca 2 hodiny",
    "prices.signature.detail":
      "Signature makeup je kompletný look na bežný život aj fotky: súmerná pleť, vyvážená farba a finiš, ktorý vydrží večer.\n\nZačíname prípravou pleti a prispôsobíme krytie, oči a pery outfitu a svetlu. Môžete priniesť inšpiráciu — cieľ je sebavedomá, upravená verzia vás.",
    "prices.bridal.detail":
      "Svadobné líčenie zahŕňa konzultáciu, dlhotrvajúcu aplikáciu a jasný plán časového harmonogramu na svadobný deň, aby ste boli pokojné a pripravené na fotenie.\n\nPreberieme skúšky, dotieranie a ladenie s šatami, závojom a fotografom. V deň D ide o žiariacu pleť, výdrž a výraz, ktorý je vám vlastný.",
    "prices.trial.detail":
      "Skúška je najlepší spôsob, ako pred veľkou udalosťou alebo svadbou doladiť look — farby, intenzitu a výdrž bez náhlenia.\n\nOdídete s poznámkami, čo fungovalo, a drobnými úpravami na finálnu vizitku. Ak váhate medzi štýlmi, vieme v rámci času vyskúšať viac smerov.",
    "prices.lesson.detail":
      "Lekcia 1:1 je postavená na vašej pleti, produktoch a cieľoch — od rýchleho denného líčenia po výraznejší večerný postup.\n\nIdeme krok za krokom: nástroje, poradie aplikácie a ako rýchlo opraviť typické problémy. Získate jednoduchú rutinu na doma a tipy na produkty podľa rozpočtu.",

    "reviews.eyebrow": "Recenzie",
    "reviews.h2": "Čo hovoria klientky",
    "reviews.c1.pill": "Svadba",
    "reviews.c1.h3": "Sophia K.",
    "reviews.c1.p": "Pokojná, precízna práca a líčenie vydržalo celý deň aj noc.",
    "reviews.c2.pill": "Udalosť",
    "reviews.c2.h3": "Nina M.",
    "reviews.c2.p": "Presne taký soft glam som chcela — prirodzené naživo, krásne na fotkách.",
    "reviews.c3.pill": "Lekcia",
    "reviews.c3.h3": "Tereza V.",
    "reviews.c3.p": "Lekcia 1:1 mi konečne dala zrozumiteľný každodenný postup.",
    "reviews.c4.pill": "Skúška",
    "reviews.c4.h3": "Lucia P.",
    "reviews.c4.p": "Skúška pred svadbou nám dala čas všetko doladiť — v deň D žiadny stres.",

    "beforeVisit.eyebrow": "Pred termínom",
    "beforeVisit.h2": "Pár tipov, nech všetko prebehne hladko",
    "beforeVisit.t1.pill": "Pleť",
    "beforeVisit.t1.h3": "Príďte s čistou tvárou",
    "beforeVisit.t1.p": "Ak sa dá, bez mejkapu a bez ťažkých krémov tesne pred vizitou.",
    "beforeVisit.t2.pill": "Inšpirácia",
    "beforeVisit.t2.h3": "Vezmite referencie",
    "beforeVisit.t2.p": "Pár obľúbených fotiek pomôže zladiť intenzitu, tón a finiš.",
    "beforeVisit.t3.pill": "Oblečenie",
    "beforeVisit.t3.h3": "Výstrih a doplnky",
    "beforeVisit.t3.p": "Oblečte sa alebo vezmite niečo blízke outfitu z udalosti, nech ladí líčenie.",
    "beforeVisit.t4.pill": "Čas",
    "beforeVisit.t4.h3": "Rezerva navyše",
    "beforeVisit.t4.p": "Kvalitná vizáž chce čas — počítajte s pár minútami navyše, aby sme nič nenáhlili.",

    "faq.eyebrow": "Q&A",
    "faq.h2": "Často kladené otázky",
    "faq.q1": "Ako si rezervujem termín?",
    "faq.a1":
      "Na stránke rezervácie vyberte voľný termín, alebo sa ozvite e-mailom alebo telefónom. Julia potvrdí podrobnosti.",
    "faq.q2": "Môžem zmeniť alebo zrušiť rezerváciu?",
    "faq.a2":
      "Čo najskôr napíšte štúdiu a spoločne upravíme termín.",
    "faq.q3": "Potrebujem skúšobné líčenie na svadbu?",
    "faq.a3":
      "Odporúčame ho, aby bol look pred veľkým dňom doladený — podľa časových možností však môže byť aj voliteľné.",
    "faq.q4": "Čo ak mám citlivú pleť?",
    "faq.a4":
      "Uveďte to pri kontakte. Julia používa profesionálne produkty a postup prispôsobí vašim potrebám.",

    "service.signature": "Signature makeup",
    "service.bridal": "Svadobné líčenie",
    "service.trial": "Skúšobné líčenie",
    "service.lesson": "Individuálna lekcia 1:1",

    "booking.eyebrow": "Rezervácia",
    "booking.h2": "Vyberte voľný termín",
    "booking.intro":
      "Najprv zvoľte službu, potom dátum a čas. Rezervácia sa uloží a termín sa pre ostatných označí ako obsadený.",
    "booking.serviceFirst": "Ktorú službu chcete?",
    "booking.chooseServiceFirst": "Vyberte službu, aby sa zobrazili voľné dátumy a časy.",
    "booking.noSlotsForService": "Pre túto službu zatiaľ nie sú voľné termíny — skúste inú službu alebo nás kontaktujte.",
    "booking.configNeeded": "Pridajte URL webovej aplikácie do súboru assets/js/config.js (bookingScriptUrl).",
    "booking.slotsLoading": "Načítavam voľné termíny…",
    "booking.slotsEmpty": "Momentálne nie sú voľné termíny — skúste neskôr alebo nás kontaktujte priamo.",
    "booking.slotsError": "Nepodarilo sa načítať dostupnosť. Skúste znova neskôr.",
    "booking.slotsHint": "Vyberte čas pre zvolený deň.",
    "booking.pickDate": "Vyberte dátum.",
    "booking.noSlotsThisDay": "Pre tento deň nie sú voľné termíny.",
    "booking.slotsGroupAria": "Voľné časové sloty",
    "booking.calPrev": "Predchádzajúci mesiac",
    "booking.calNext": "Ďalší mesiac",
    "booking.calGridAria": "Výber dňa",
    "booking.calMo": "Po",
    "booking.calTu": "Ut",
    "booking.calWe": "St",
    "booking.calTh": "Št",
    "booking.calFr": "Pi",
    "booking.calSa": "So",
    "booking.calSu": "Ne",
    "booking.name": "Meno",
    "booking.email": "E-mail",
    "booking.phone": "Telefón",
    "booking.service": "Služba",
    "booking.notes": "Poznámky",
    "booking.phName": "Vaše meno",
    "booking.phEmail": "vas@email.sk",
    "booking.phPhone": "+421…",
    "booking.phNotes": "Príležitosť, štýl alebo preferencie",
    "booking.selectService": "Vyberte službu",
    "booking.submit": "Odoslať rezerváciu",
    "booking.sending": "Odosiela sa…",
    "booking.selectSlot": "Najprv vyberte časový slot.",
    "booking.success": "Rezervácia odoslaná. Julia čoskoro potvrdí.",
    "booking.slotTaken": "Tento termín bol práve obsadený. Vyberte iný čas.",
    "booking.error": "Niečo sa nepodarilo. Skúste znova alebo nás kontaktujte.",

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
    "contact.mapHeading": "Kde nás nájdete",
    "contact.mapTitle": "Google mapa — poloha štúdia",

    "footer.brand": "Juliere Beauty",
    "footer.socialAria": "Sociálne siete",
    "footer.socialInstagram": "Instagram",
    "footer.socialFacebook": "Facebook",
    "footer.socialX": "X",

    "lang.switchAria": "Jazyk",
    "lang.en": "English",
    "lang.sk": "Slovenčina",

    "toast.dismiss": "Zavrieť",
    "carousel.slideOf": "Snímka {{n}} z {{total}}",
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

const DRIVE_FILE_ID_RE = /^[a-zA-Z0-9_-]+$/;

/**
 * Extracts a Google Drive file ID from a share URL, `?id=…` link, or a raw ID string.
 * @param {unknown} input
 * @returns {string | null}
 */
export function extractGoogleDriveFileId(input) {
  const s = String(input).trim();
  if (!s) {
    return null;
  }

  // Raw file ID: no URL markers (colon slash query)
  if (!/[\/:?#]/.test(s) && DRIVE_FILE_ID_RE.test(s) && s.length >= 10) {
    return s;
  }

  let u;
  try {
    u = new URL(s);
  } catch {
    try {
      u = new URL(s.startsWith("http") ? s : `https://${s}`);
    } catch {
      u = null;
    }
  }

  if (u) {
    const host = u.hostname.replace(/^www\./i, "");
    const isDriveHost = host === "drive.google.com" || host === "docs.google.com";

    const filePath = u.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (filePath) {
      return filePath[1];
    }

    const idParam = u.searchParams.get("id");
    if (idParam && DRIVE_FILE_ID_RE.test(idParam) && isDriveHost) {
      return idParam;
    }
  }

  if (/drive\.google\.com|docs\.google\.com/i.test(s)) {
    const q = s.match(/[?&#]id=([a-zA-Z0-9_-]+)/i);
    if (q) {
      return q[1];
    }
  }

  return null;
}

/**
 * Normalizes Drive share links, `?id=` URLs, or a raw file ID to a browser-usable image URL.
 * @param {unknown} input
 * @returns {string | null}
 */
export function toDriveImageUrl(input) {
  const id = extractGoogleDriveFileId(input);
  if (!id) {
    return null;
  }

  const sz = (CONFIG.driveImageThumbnailSz || "w1920").trim() || "w1920";
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=${encodeURIComponent(sz)}`;
}

/**
 * Accepts https/http URLs or same-site paths (`assets/...` or `/...`).
 * Rewrites Google Drive values to thumbnail URLs via {@link toDriveImageUrl}.
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

  const driveThumb = toDriveImageUrl(s);
  if (driveThumb) {
    return driveThumb;
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
      if (resolved.includes("drive.google.com/")) {
        img.referrerPolicy = "no-referrer";
      }

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
    const titleKey = titleEl.dataset.pageTitleI18n || "meta.title";
    titleEl.textContent = t(titleKey);
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
