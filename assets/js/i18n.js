/**
 * Site copy: English and Slovak.
 * Bundled strings are defaults; optional Google Sheet overrides (see CONFIG.contentCsvUrls / published id).
 */
import { CONFIG } from "./config.js";
import { getLangFromPath, switchLocaleHref } from "./core/locale-urls.js";
import {
  applySiteImageDeliveryToElement,
  buildSiteImageDelivery,
  driveImageUrl,
  extractGoogleDriveFileId,
  normalizeSiteImageProfile,
  siteImageSrcForProfile,
} from "./site-image-delivery.js";

/** @type {Record<string, Record<string, string>>} */
const BUNDLED_STRINGS = {
  en: {
    "meta.title": "Juliére Beauty | Modern makeup studio",
    "meta.description": "Juliére Beauty an elegant makeup studio.",
    "meta.titleReviews": "Juliére Beauty | Reviews",
    "meta.descriptionReviews": "Client reviews and testimonials  Juliére Beauty makeup studio.",
    "meta.titleBooking": "Juliére Beauty | Book online",
    "meta.descriptionBooking": "Reserve a makeup appointment  choose a service and pick an available time.",
    "meta.titleBookingAction": "Juliére Beauty | Processing booking",
    "meta.descriptionBookingAction": "Processing a booking action from your email link.",
    "meta.titleBridalLanding": "Bridal Makeup Bratislava | Juliére Beauty",
    "meta.descriptionBridalLanding":
      "Professional bridal makeup in Bratislava — tailored looks, long-wear products and optional trial. Book at Juliére Beauty studio.",
    "bridalLanding.faq.q1": "How much does bridal makeup cost in Bratislava?",
    "bridalLanding.faq.a1":
      "Bridal makeup at Juliére Beauty is 45 EUR (about 75 minutes in the studio). A separate trial session is also 45 EUR (about 90 minutes). Travel for on-location work is charged per km — see the full price list on the homepage.",
    "bridalLanding.faq.q2": "When should I book my wedding makeup appointment?",
    "bridalLanding.faq.a2":
      "For popular wedding dates I recommend booking several months ahead. If you want a trial, schedule it roughly 4–8 weeks before the wedding so we have time to adjust the look. The wedding-day slot is planned around your ceremony and photos.",
    "bridalLanding.faq.q3": "Is a bridal makeup trial necessary?",
    "bridalLanding.faq.a3":
      "It is not mandatory, but I recommend it — you will see the exact colours, finish and wear on your skin, and we can fine-tune details without stress on the wedding day.",
    "bridalLanding.faq.q4": "How long does wedding makeup last?",
    "bridalLanding.faq.a4":
      "With professional long-wear products and proper prep, the look is built to last from preparation through the ceremony, photos and celebration. I focus on skin that photographs well and makeup that stays fresh with minimal touch-ups.",
    "bridalLanding.faq.q5": "Do you travel outside Bratislava?",
    "bridalLanding.faq.a5":
      "Yes — I can come to you for on-location bridal makeup when booking makeup for at least four people. Travel is charged per kilometre from the studio on Račianska 66. For individual appointments I welcome you at the Bratislava studio.",
    "bridalLanding.faq.q6": "What products do you use?",
    "bridalLanding.faq.a6":
      "I work with professional brands chosen for longevity, comfort and a natural finish on camera — foundations, powders, setting sprays and pigments suited to long wedding days. Products are selected individually for your skin type and preferences.",
    "home.instagram.eyebrow": "Instagram",
    "home.instagram.h2": "On Instagram",
    "home.instagram.followLink": "Follow @julierebeauty",
    "home.instagram.carouselAria": "Instagram posts — swipe horizontally",
    "home.instagram.embed.1": "https://www.instagram.com/julierebeauty/reel/DZp7beuMw3U/",
    "home.instagram.embed.2": "",
    "home.instagram.embed.3": "",
    "sheet.loading": "Loading…",
    "hero.carouselAria": "Juliére Beauty",
    "hero.slide1.alt": "Portrait  professional makeup look, Juliére Beauty",
    "hero.slide1.caption": "Featured portrait for Juliére Beauty",
    "hero.slide2.alt": "Luxury makeup products  Juliére Beauty studio",
    "hero.slide2.caption": "",
    "hero.slide3.alt": "Portrait  soft glam makeup, Juliére Beauty",
    "hero.slide3.caption": "Portrait with professional makeup look",
    "hero.tagline": "Modern beauty studio",
    "hero.prevSlide": "Previous slide",
    "hero.nextSlide": "Next slide",
    "hero.chooseSlide": "Choose slide",
    "hero.scroll": "Scroll",
    "header.brandAria": "Juliére Beauty home",
    "header.brandPrimary": "Juliére",
    "header.brandSecondary": "Beauty",
    "header.openMenu": "Open menu",
    "header.closeMenu": "Close menu",
    "header.navMain": "Main",
    "nav.about": "About",
    "nav.portfolio": "Portfolio",
    "nav.prices": "Services",
    "nav.reviews": "Reviews",
    "nav.beforeVisit": "Recommendations",
    "nav.contact": "Contact",
    "nav.booking": "Book",
    "nav.faq": "Q&A",
    "intro.text": "Highlight your beauty.",
    "intro.portfolio": "View portfolio",
    "intro.book": "Book a slot",
    "stats.years": "8+ years",
    "stats.yearsDesc": "years of experience",
    "stats.sessions": "",
    "stats.sessionsDesc": "",
    "stats.rating": "Reviews",
    "stats.ratingDesc": "",
    "about.eyebrow": "About me",
    "about.h2": "Minimalist makeup tailored to what makes you unique.",
    "about.statsAria": "About highlights",
    "about.photoAlt": "Julia  Juliére Beauty makeup artist",
    "about.p1": "Welcome! I'm Julia and makeup has been my passion for over 8 years. I specialize in wedding makeup but I can do all the types of occasional glam.  ",
    "about.p2": "I believe every woman is beautiful, and my goal is to gently enhance that beauty so you feel confident and still yourself. I look forward to seeing you!",
    "portfolio.eyebrow": "Portfolio",
    "portfolio.h2": "My work",
    "portfolio.carouselAria": "Portfolio  browse looks",
    "portfolio.bridal.label": "BEFORE & AFTER",
    "portfolio.bridal.p": "Makeup transformations.",
    "portfolio.soft.label": "Brides",
    "portfolio.soft.p": "Bridal makeup.",
    "portfolio.editorial.label": "Statement looks",
    "portfolio.editorial.p": "Bold makeup or Halloween-ready glam.",
    "portfolio.evening.label": "Brow shaping & lamination",
    "portfolio.evening.p": "Finished work.",
    "portfolio.gallery.openSuffix": "Open photo gallery",
    "portfolio.gallery.close": "Close gallery",
    "portfolio.gallery.fullscreenOpen": "Open photo fullscreen",
    "portfolio.gallery.fullscreenClose": "Close fullscreen photo",
    "portfolio.gallery.lightboxAria": "Fullscreen photo",
    "portfolio.gallery.fullscreenPrev": "Previous photo",
    "portfolio.gallery.fullscreenNext": "Next photo",
    "portfolio.gallery.bridal.1": "Bridal makeup  portrait",
    "portfolio.gallery.bridal.2": "Bridal makeup  soft glam portrait",
    "portfolio.gallery.bridal.3": "Professional makeup products used for bridal looks",
    "portfolio.gallery.bridal.4": "",
    "portfolio.gallery.bridal.5": "",
    "portfolio.gallery.bridal.6": "Bridal makeup  portrait finish",
    "portfolio.gallery.soft.1": "Soft glam makeup  portrait",
    "portfolio.gallery.soft.2": "Soft glam  beauty portrait",
    "portfolio.gallery.soft.3": "Makeup products  soft glam session",
    "portfolio.gallery.soft.4": "Soft glam  sculpt and highlight",
    "portfolio.gallery.soft.5": "Portrait finish  camera-ready skin",
    "portfolio.gallery.editorial.1": "Editorial beauty  product flat lay",
    "portfolio.gallery.editorial.2": "Editorial clean  portrait",
    "portfolio.gallery.editorial.3": "Editorial portrait  graphic liner",
    "portfolio.gallery.editorial.4": "Editorial set  texture study",
    "portfolio.gallery.editorial.5": "Studio editorial  luminous skin",
    "portfolio.gallery.evening.1": "Evening makeup  portrait",
    "portfolio.gallery.evening.2": "Evening luxe  beauty portrait",
    "portfolio.gallery.evening.3": "Evening look  products",
    "portfolio.gallery.evening.4": "Evening glam  smoky depth",
    "portfolio.gallery.evening.5": "Night-out makeup  dimensional eyes",
    "portfolio.gallery.bridal.caption1": "Ceremony-ready skin with a soft, luminous finish.",
    "portfolio.gallery.bridal.caption2": "Curated long-wear products chosen for photos and long days.",
    "portfolio.gallery.bridal.caption3": "Romantic definition that stays fresh from vows to the last dance.",
    "portfolio.gallery.bridal.caption4": "Close-up finish that reads beautifully in natural daylight.",
    "portfolio.gallery.bridal.caption5": "Gentle contour and luminous skin for an effortless aisle moment.",
    "portfolio.gallery.bridal.caption6": "Soft definition and a natural glow that photographs beautifully all day.",
    "portfolio.gallery.soft.caption1": "Balanced soft glam  polished in person, stunning on camera.",
    "portfolio.gallery.soft.caption2": "Even light and gentle contour for a refined everyday glow.",
    "portfolio.gallery.soft.caption3": "Texture and tone matched to your skin and the occasion.",
    "portfolio.gallery.soft.caption4": "Precision placement with a feather-light, wearable balance.",
    "portfolio.gallery.soft.caption5": "Evening-ready polish that still feels soft and natural.",
    "portfolio.gallery.editorial.caption1": "Clean editorial mood  texture and light kept intentional.",
    "portfolio.gallery.editorial.caption2": "Modern minimal beauty with understated luxury.",
    "portfolio.gallery.editorial.caption3": "Graphic liner and negative space for a sharp editorial frame.",
    "portfolio.gallery.editorial.caption4": "Controlled texture and matte-meets-glow for print-ready contrast.",
    "portfolio.gallery.editorial.caption5": "Skin-forward editorial with sculptural cheek and lip.",
    "portfolio.gallery.evening.caption1": "Defined eyes and glowing skin for after-dark events.",
    "portfolio.gallery.evening.caption2": "Sculpted complexion with a long-wear evening finish.",
    "portfolio.gallery.evening.caption3": "Products selected for flash photography and hours of wear.",
    "portfolio.gallery.evening.caption4": "Smoky depth with balanced lid space for low-light venues.",
    "portfolio.gallery.evening.caption5": "High-impact eyes with skin that stays velvet through the night.",
    "portfolio.gallery.bridal.tag1": "@nina.m",
    "portfolio.gallery.bridal.tag2": "@elena.k",
    "portfolio.gallery.bridal.tag3": "@sophia",
    "portfolio.gallery.bridal.tag4": "@lucia.p",
    "portfolio.gallery.bridal.tag5": "@tereza.v",
    "portfolio.gallery.bridal.tag6": "@nina.m",
    "portfolio.gallery.soft.tag1": "@tereza.v",
    "portfolio.gallery.soft.tag2": "@lucia.p",
    "portfolio.gallery.soft.tag3": "@nina.m",
    "portfolio.gallery.soft.tag4": "@elena.k",
    "portfolio.gallery.soft.tag5": "@sophia",
    "portfolio.gallery.editorial.tag1": "",
    "portfolio.gallery.editorial.tag2": "@elena.k",
    "portfolio.gallery.editorial.tag3": "@sophia",
    "portfolio.gallery.editorial.tag4": "@nina.m",
    "portfolio.gallery.editorial.tag5": "@tereza.v",
    "portfolio.gallery.evening.tag1": "@sophia",
    "portfolio.gallery.evening.tag2": "",
    "portfolio.gallery.evening.tag3": "",
    "portfolio.gallery.evening.tag4": "@elena.k",
    "portfolio.gallery.evening.tag5": "@julia.studio",
    "prices.eyebrow": "Pricing",
    "prices.h2": "Services",
    "prices.signature.tag": "Most requested",
    "prices.signature.h3": "Event makeup",
    "prices.signature.p":
      "Event makeup is ideal for balls, proms, celebrations and other special occasions.",
    "prices.bridal.h3": "Bridal makeup",
    "prices.bridal.p": "Feel exceptional on your big day!",
    "prices.trial.h3": "Makeup trial",
    "prices.trial.p":
      "Together we'll refine the makeup exactly to your expectations, so on the day you can be sure of a flawless result stress-free.",
    "prices.lesson.h3": "Self-makeup course",
    "prices.lesson.p": "Coming soon",
    "prices.travel.h3": "Travel fee",
    "prices.travel.p": "On location makeup charged by distance from the studio at Račianska 66.",
    "prices.brows.h3": "Brow Shaping & Lamination",
    "prices.brows.p": "Shaped brows, optional tint, and lamination for fuller arches with minimal daily upkeep.",
    "prices.shoot.h3": "Photoshoot Makeup",
    "prices.shoot.p": "Flash-balanced complexion and definition for studio work, branding shots, or portfolio updates.",
    "prices.carouselAria": "Pricing and services  browse packages",
    "reviews.carouselAria": "Client reviews  browse testimonials",
    "beforeVisit.carouselAria": "Before your visit  browse tips",
    "prices.detail.openSuffix": "Open service details",
    "prices.detail.close": "Close details",
    "prices.signature.price": "40 EUR",
    "prices.bridal.price": "45 EUR",
    "prices.trial.price": "45 EUR",
    "prices.lesson.price": "75 EUR",
    "prices.travel.price": "0.25 EUR/km",
    "prices.brows.price": "45 EUR",
    "prices.shoot.price": "85 EUR",
    "prices.signature.duration": "Duration: about 60 minutes",
    "prices.bridal.duration": "Duration: about 75 minutes",
    "prices.trial.duration": "Duration: about 90 minutes",
    "prices.lesson.duration": "Duration: about 4 hours",
    "prices.travel.duration": "Min. 4 people",
    "prices.brows.duration": "Duration: about 50 minutes",
    "prices.shoot.duration": "Duration: about 90 minutes",
    "prices.signature.detail":
      "Event makeup for balls, proms, celebrations and other special occasions  tailored to your outfit, the venue and how long you need it to last. We prep the skin and build a polished, long-wearing look that still feels like you.",
    "prices.bridal.detail":
      "Bridal makeup shaped to your style so you feel exceptional on your big day  refined, long-wearing and camera-ready from ceremony through the evening.",
    "prices.trial.detail":
      "We refine the look together ahead of your event so on the day you're confident in a flawless result no last-minute stress.",
    "prices.lesson.detail": "Coming soon.",
    "prices.travel.detail":
      "Travel is available for on location bookings with a minimum of four people. The fee is calculated from the studio at Račianska 66 to your venue and back.\n\nContact me with the address and headcount before booking so I can confirm the total.",
    "prices.brows.detail":
      "We map your natural brow line, then trim, wax, or tweeze as needed, and finish with a tailored tint or lamination so hairs stay lifted and even for weeks.\n\nBring inspiration photos if you have them  the goal is balance with your features and a clean grow-out.",
    "prices.shoot.detail":
      "Makeup is calibrated for camera sensors and lighting  coverage reads smooth under flash, eyes stay crisp, and lips photograph true to tone.\n\nAllow buffer before call time for tweaks under your photographer’s lights so nothing surprises on the tether.",
    "reviews.eyebrow": "Reviews",
    "reviews.h2": "What clients say",
    "reviews.c1.pill": "Bridal",
    "reviews.c1.h3": "Sophia K.",
    "reviews.c1.p": "Calm, precise, and the makeup lasted perfectly through the whole day and night.",
    "reviews.c2.pill": "Event",
    "reviews.c2.h3": "Nina M.",
    "reviews.c2.p": "Exactly the soft glam I wanted  natural in person, stunning in photos.",
    "reviews.c3.pill": "Lesson",
    "reviews.c3.h3": "Tereza V.",
    "reviews.c3.p": "The 1:1 lesson finally made my everyday routine feel doable and elegant.",
    "reviews.c4.pill": "Trial",
    "reviews.c4.h3": "Lucia P.",
    "reviews.c4.p": "Trial before the wedding gave us time to refine everything  zero stress on the day.",
    "beforeVisit.eyebrow": "Before you arrive",
    "beforeVisit.h2": "A few tips so your appointment goes smoothly",
    "beforeVisit.t1.pill": "Skin",
    "beforeVisit.t1.h3": "Come with a clean face",
    "beforeVisit.t1.p": "Arrive without makeup if you can, and skip heavy creams right before the session.",
    "beforeVisit.t2.pill": "References",
    "beforeVisit.t2.h3": "Bring inspiration",
    "beforeVisit.t2.p": "Save a few photos you like it helps align on tone, intensity, and finish.",
    "beforeVisit.t3.pill": "Outfit",
    "beforeVisit.t3.h3": "Neckline & jewelry",
    "beforeVisit.t3.p": "Wear or bring something close to your event neckline so the look feels cohesive.",
    "beforeVisit.t4.pill": "Timing",
    "beforeVisit.t4.h3": "Plan a little buffer",
    "beforeVisit.t4.p": "Artistry takes time allow a few extra minutes so we never have to rush the details.",
    "faq.eyebrow": "Q&A",
    "faq.h2": "Common questions",
    "faq.q1": "How do I book?",
    "faq.a1":
      "You can book an appointment using the online booking system directly on the website, or you can contact me through my social media channels or by phone. If you use the booking system, please wait for your appointment to be confirmed.",
    "faq.q2": "Can I change or cancel?",
    "faq.a2":
      "Have your plans changed? No problem. If you need to reschedule or cancel your appointment, please let me know as soon as possible and we'll arrange the necessary changes together.\n\nPlease note: If an appointment is cancelled less than 24 hours before the scheduled time, 100% of the makeup service fee will be charged.",
    "faq.q3": "Do I need a trial for bridal makeup?",
    "faq.a3":
      "A trial is recommended so the look is locked in before the big day  but it is optional depending on your timeline.",
    "faq.q4": "Do you travel to clients?",
    "faq.a4":
      "Yes, I do travel to clients, but only for bookings involving a minimum of four people. Travel fees can be found in my price list. Otherwise, I'll be happy to welcome you to my studio at Račianska 66.",
    "service.signature": "Event makeup",
    "service.bridal": "Bridal makeup",
    "service.trial": "Makeup trial",
    "service.lesson": "Self-makeup course",
    "service.brows": "Brow Shaping & Lamination",
    "service.shoot": "Photoshoot Makeup",
    "booking.eyebrow": "Booking",
    "booking.h2": "Choose an available time",
    "booking.intro": "Pick an open slot in the calendar and complete your details below.",
    "booking.rulesTitle": "Reservation rules",
    "booking.ruleStudio": "Reservations made here are for appointments at the studio only. For a custom location, contact us directly.",
    "booking.ruleVerify": "Your reservation is only a request until you verify your email and the studio approves it.",
    "booking.ruleEmailExpiry": "The email verification link expires after 30 minutes.",
    "booking.ruleContact": "Use a real email and phone number so we can confirm details if needed.",
    "booking.ruleCancel": "Confirmed reservations can be cancelled from the email link up to 24 hours before the appointment.",
    "booking.serviceFirst": "Which service do you want?",
    "booking.chooseServiceFirst": "Choose a service to see available dates and times.",
    "booking.noSlotsForService": "There are no open slots for this service yet  try another service or contact us.",
    "booking.configNeeded": "Add your booking web app URL in assets/js/config.js (bookingScriptUrl).",
    "booking.maintenanceEyebrow": "Booking",
    "booking.maintenanceH2": "Online booking is temporarily unavailable",
    "booking.maintenanceLead": "Online booking is temporarily unavailable.",
    "booking.maintenanceBody":
      "Please arrange your appointment directly with the studio — by phone, email, or Instagram.",
    "booking.maintenanceContact": "Contact the studio",
    "booking.slotsLoading": "Loading available times…",
    "booking.slotsEmpty": "No open slots right now  check back soon or contact us directly.",
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
    "booking.name": "Name Surname",
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
    "booking.sending": "Sending reservation…",
    "booking.sendingHint": "This can take up to a minute. Please don’t close the page.",
    "booking.submitFailTitle": "Reservation not sent",
    "booking.selectSlot": "Please choose a time slot first.",
    "booking.success": "Reservation sent. Julia will confirm soon.",
    "booking.successPending": "Check your email and click the verification link within 30 minutes.",
    "booking.submitSuccessTitle": "Reservation sent",
    "booking.submitSuccessVerifyBody":
      "We sent you a verification email. The link is valid for 30 minutes.",
    "booking.dialogOk": "OK",
    "booking.slotTaken": "That slot was just taken. Please pick another time.",
    "booking.error": "Something went wrong. Please try again or contact us.",
    "booking.serviceMismatch": "That slot does not match the selected service.",
    "booking.expiredVerification": "That link has expired. Submit a new request if you still need an appointment.",
    "booking.tokenUsed": "This link was already used or is no longer valid.",
    "booking.invalidToken": "Invalid or unknown link.",
    "booking.serverConfig": "Booking is temporarily unavailable. Please contact the studio.",
    "booking.mailError": "Email could not be sent. Try again later or contact the studio.",
    "booking.errBusy": "Server busy. Try again in a moment.",
    "booking.notFound": "That time slot no longer exists in the calendar.",
    "booking.resultEmailVerified": "Email verified. The studio will review your request.",
    "booking.resultConfirmed": "Booking confirmed. You should receive a confirmation email.",
    "booking.resultRejected": "This reservation request was not approved.",
    "booking.resultCancelled": "Your booking has been cancelled.",
    "booking.resultAlreadyCancelled": "This booking was already cancelled.",
    "booking.resultLinkError": "We could not complete that action from the link.",
    "booking.actionProcessing": "Processing…",
    "booking.actionProcessingBody": "Please wait — finishing the action from your email.",
    "booking.actionProcessingHint": "This can take a few seconds. Don’t close the page.",
    "booking.actionDoneTitle": "Done",
    "booking.actionFailTitle": "Couldn’t complete",
    "booking.actionBackToBooking": "Back to booking",
    "contact.eyebrow": "Contact",
    "contact.h2": "Reach out for bookings and beauty questions",
    "contact.studioTitle": "Studio details",
    "contact.hoursTitle": "Hours",
    "contact.noteTitle": "Booking note",
    "contact.line1": "Račianska 66, Bratislava",
    "contact.email": "info@julierebeauty.com",
    "contact.phone": "+421 944 114 253",
    "contact.hours1": "",
    "contact.hours2": "Mon–Sun: By appointment",
    "contact.hours3": "",
    "contact.noteP": "For wedding dates and group bookings I recommend booking ahead so you can secure your preferred time.",
    "contact.mapHeading": "Studio location",
    "contact.mapTitle": "Map — Juliére Beauty studio, Bratislava",
    "footer.brand": "Juliére Beauty",
    "footer.address": "Račianska 66, 831 02 Bratislava",
    "footer.socialAria": "Social media",
    "footer.socialInstagram": "Instagram",
    "footer.socialFacebook": "Facebook",
    "footer.socialX": "X",
    "footer.socialInstagramUrl": "https://www.instagram.com/julierebeauty/",
    "footer.socialFacebookUrl": "",
    "footer.socialXUrl": "",
    "lang.switchAria": "Language",
    "lang.en": "English",
    "lang.sk": "Slovenčina",
    "toast.dismiss": "Dismiss",
    "carousel.slideOf": "Slide {{n}} of {{total}}",
  },
  sk: {
    "meta.title": "Juliére Beauty | Moderné kozmetické štúdio",
    "meta.titleReviews": "Juliére Beauty | Recenzie",
    "meta.descriptionReviews": "Recenzie a referencie klientov  kozmetické štúdio Juliére Beauty.",
    "meta.titleBooking": "Juliére Beauty | Online rezervácia",
    "meta.descriptionBooking": "Rezervujte si termín na líčenie  zvoľte službu a voľný čas.",
    "meta.titleBookingAction": "Juliére Beauty | Spracovanie rezervácie",
    "meta.descriptionBookingAction": "Spracovanie odkazu z e-mailu rezervácie.",
    "meta.titleBridalLanding": "Svadobné líčenie Bratislava | Juliére Beauty",
    "meta.descriptionBridalLanding":
      "Svadobné líčenie v Bratislave od vizážistky Julia — individuálny look, profesionálna kozmetika a dlhá výdrž. Voliteľná skúška. Štúdio Juliére Beauty, Račianska 66.",
    "bridalLanding.faq.q1": "Koľko stojí svadobné líčenie v Bratislave?",
    "bridalLanding.faq.a1":
      "Svadobné líčenie v štúdiu Juliére Beauty stojí 45 EUR (trvanie približne 75 minút). Samostatná skúška svadobného líčenia je tiež za 45 EUR (cca 90 minút). Pri dojazde k vám sa účtuje cestovné podľa km — kompletný cenník nájdete na hlavnej stránke v sekcii Služby.",
    "bridalLanding.faq.q2": "Kedy si rezervovať termín?",
    "bridalLanding.faq.a2":
      "Pri obľúbených svadobných termínoch odporúčam rezerváciu niekoľko mesiacov vopred. Ak chcete skúšku, naplánujte ju približne 4–8 týždňov pred svadbou, aby sme stihli doladiť detaily. Termín v deň svadby zladíme s prípravou, obradom a fotením.",
    "bridalLanding.faq.q3": "Je skúška svadobného líčenia potrebná?",
    "bridalLanding.faq.a3":
      "Nie je povinná, no odporúčam ju — uvidíte presné odtiene, finiš a výdrž na svojej pleti a v deň D už len doladíme detaily bez zbytočného stresu.",
    "bridalLanding.faq.q4": "Ako dlho vydrží svadobný makeup?",
    "bridalLanding.faq.a4":
      "S profesionálnou dlhotrvácou kozmetikou a správnou prípravou pleti je look nastavený na celý deň — od prípravy cez obrad a fotenie až po večernú zábavu. Dôraz kladiem na pleť, ktorá dobre vyzerá na fotkách, a na líčenie, ktoré zostáva svieže s minimálnymi úpravami.",
    "bridalLanding.faq.q5": "Dochádzate aj mimo Bratislavy?",
    "bridalLanding.faq.a5":
      "Áno — pri líčení minimálne štyroch osôb viem prísť aj k vám. Cestovné sa účtuje podľa vzdialenosti od štúdia na Račianskej 66 v Bratislave. Pri individuálnych termínoch sa teším na vás priamo v štúdiu.",
    "bridalLanding.faq.q6": "Aké produkty používate?",
    "bridalLanding.faq.a6":
      "Pracujem s profesionálnou kozmetikou zameranou na výdrž, komfort a prirodzený vzhľad pred objektívom — podklady, púdra, fixátory a pigmenty vhodné na dlhý svadobný deň. Výber prispôsobím typu pleti a vašim preferenciám.",
    "home.instagram.eyebrow": "Instagram",
    "home.instagram.h2": "Juliére Beauty na Instagrame",
    "home.instagram.followLink": "Sledovať @julierebeauty",
    "home.instagram.carouselAria": "Instagram príspevky — posúvajte vodorovne",
    "home.instagram.embed.1": "https://www.instagram.com/julierebeauty/reel/DZp7beuMw3U/",
    "home.instagram.embed.2": "",
    "home.instagram.embed.3": "",
    "meta.description": "Juliére Beauty  elegantné vizážistické štúdio.",
    "sheet.loading": "Načítavam…",
    "hero.carouselAria": "Juliére Beauty",
    "hero.slide1.alt": "Portrét  profesionálny makeup look, Juliére Beauty",
    "hero.slide1.caption": "Vybraný portrét pre Juliére Beauty",
    "hero.slide2.alt": "Luxusné produkty na líčenie  štúdio Juliére Beauty",
    "hero.slide2.caption": "",
    "hero.slide3.alt": "Portrét  soft glam makeup, Juliére Beauty",
    "hero.slide3.caption": "Portrét s profesionálnym makeup lookom",
    "hero.tagline": "Moderné kozmetické štúdio",
    "hero.prevSlide": "Predchádzajúci snímok",
    "hero.nextSlide": "Ďalší snímok",
    "hero.chooseSlide": "Výber snímku",
    "hero.scroll": "Scroll",
    "header.brandAria": "Domov Juliére Beauty",
    "header.brandPrimary": "Juliére",
    "header.brandSecondary": "Beauty",
    "header.openMenu": "Otvoriť menu",
    "header.closeMenu": "Zavrieť menu",
    "header.navMain": "Hlavná navigácia",
    "nav.about": "O mne",
    "nav.portfolio": "Portfólio",
    "nav.prices": "Služby + Cenník",
    "nav.reviews": "Recenzie",
    "nav.beforeVisit": "Pred termínom",
    "nav.contact": "Kontakt",
    "nav.booking": "Rezervácia",
    "nav.faq": "Q&A",
    "intro.text": "Zvýrazni svoju krásu.",
    "intro.portfolio": "Pozrieť portfólio",
    "intro.book": "Rezervovať termín",
    "stats.years": "8+ rokov",
    "stats.yearsDesc": "skúseností",
    "stats.sessions": "",
    "stats.sessionsDesc": "",
    "stats.rating": "Recenzie",
    "stats.ratingDesc": "",
    "about.eyebrow": "O mne",
    "about.h2": "Minimalistické a prispôsobené Vašej jedinečnosti.",
    "about.statsAria": "Prehľad",
    "about.photoAlt": "Julia  vizážistka Juliére Beauty",
    "about.p1": "Vitajte! Volám sa Julia a makeup je moja vášeň už viac ako 8 rokov. Líčim svadby, plesy, stužkové, fotenia aj špeciálne príležitosti.",
    "about.p2": "Verím, že každá žena je krásna a mojím cieľom je túto krásu len jemne zvýrazniť, aby ste sa cítili sebavedomo a sama sebou. Budem sa na Vás tešiť!",
    "portfolio.eyebrow": "Portfólio",
    "portfolio.h2": "Moja tvorba",
    "portfolio.carouselAria": "Portfólio  prehliadka lookov",
    "portfolio.bridal.label": "PRED&PO",
    "portfolio.bridal.p": "Premeny líčení.",
    "portfolio.soft.label": "Nevesty",
    "portfolio.soft.p": "Svadobné líčenia.",
    "portfolio.editorial.label": "Extravagantné líčenia",
    "portfolio.editorial.p": "Výrazné líčenie či líčenie na Halloween.",
    "portfolio.evening.label": "Úprava a laminácia obočia",
    "portfolio.evening.p": "Hotové práce.",
    "portfolio.gallery.openSuffix": "Otvoriť fotogalériu",
    "portfolio.gallery.close": "Zatvoriť galériu",
    "portfolio.gallery.fullscreenOpen": "Otvoriť fotku na celú obrazovku",
    "portfolio.gallery.fullscreenClose": "Zatvoriť zobrazenie na celú obrazovku",
    "portfolio.gallery.lightboxAria": "Fotografia na celú obrazovku",
    "portfolio.gallery.fullscreenPrev": "Predchádzajúca fotografia",
    "portfolio.gallery.fullscreenNext": "Ďalšia fotografia",
    "portfolio.gallery.bridal.1": "Svadobné líčenie  portrét",
    "portfolio.gallery.bridal.2": "Svadobné líčenie  portrét soft glam",
    "portfolio.gallery.bridal.3": "Profesionálne produkty na svadobné líčenie",
    "portfolio.gallery.bridal.4": "Svadobné líčenie  portrét",
    "portfolio.gallery.bridal.5": "Svadobné líčenie  portrét soft glam",
    "portfolio.gallery.bridal.6": "Svadobné líčenie  portrét",
    "portfolio.gallery.soft.1": "Soft glam  portrét",
    "portfolio.gallery.soft.2": "Soft glam  beauty portrét",
    "portfolio.gallery.soft.3": "Produkty na soft glam",
    "portfolio.gallery.soft.4": "",
    "portfolio.gallery.soft.5": "Soft glam  portrét",
    "portfolio.gallery.editorial.1": "Editoriálna krása  produkty",
    "portfolio.gallery.editorial.2": "Editoriálne čisté líčenie  portrét",
    "portfolio.gallery.editorial.3": "",
    "portfolio.gallery.editorial.4": "",
    "portfolio.gallery.editorial.5": "Extravagantné líčenie  portrét",
    "portfolio.gallery.evening.1": "Večerné líčenie  portrét",
    "portfolio.gallery.evening.2": "Večerný luxus  portrét",
    "portfolio.gallery.evening.3": "Večerný look  produkty",
    "portfolio.gallery.evening.4": "",
    "portfolio.gallery.evening.5": "",
    "portfolio.gallery.bridal.caption1": " ",
    "portfolio.gallery.bridal.caption2": " ",
    "portfolio.gallery.bridal.caption3": "",
    "portfolio.gallery.bridal.caption4": "Detailný finiš, ktorý pôsobí prirodzene v dennom svetle.",
    "portfolio.gallery.bridal.caption5": "Jemná kontúra a žiariaca pleť na pokojný okamih pri oltári.",
    "portfolio.gallery.bridal.caption6": "Jemná definícia a prirodzený lesk, ktorý sa celý deň krásne fotí.",
    "portfolio.gallery.soft.caption1": "",
    "portfolio.gallery.soft.caption2": "",
    "portfolio.gallery.soft.caption3": "",
    "portfolio.gallery.soft.caption4": "Presné nanášanie s ľahkým, nositeľným vyvážením.",
    "portfolio.gallery.soft.caption5": "Večerný šmrnc, ktorý stále pôsobí jemne a prirodzene.",
    "portfolio.gallery.editorial.caption1": "",
    "portfolio.gallery.editorial.caption2": "",
    "portfolio.gallery.editorial.caption3": "Grafická linka a negatívny priestor pre ostrý editoriálny rám.",
    "portfolio.gallery.editorial.caption4": "Kontrolovaná textúra a lesk pre kontrast pripravený na tlač.",
    "portfolio.gallery.editorial.caption5": "Editoriál s dôrazom na pleť a modelované líca a pery.",
    "portfolio.gallery.evening.caption1": "",
    "portfolio.gallery.evening.caption2": "",
    "portfolio.gallery.evening.caption3": "",
    "portfolio.gallery.evening.caption4": "Smoky hĺbka s vyváženým priestorom viečka pri tlmenom svetle.",
    "portfolio.gallery.evening.caption5": "Výrazné oči a zamatová pleť, ktorá vydrží celú noc.",
    "portfolio.gallery.bridal.tag1": "",
    "portfolio.gallery.bridal.tag2": "",
    "portfolio.gallery.bridal.tag3": "",
    "portfolio.gallery.bridal.tag4": "@lucia.p",
    "portfolio.gallery.bridal.tag5": "@tereza.v",
    "portfolio.gallery.bridal.tag6": "@nina.m",
    "portfolio.gallery.soft.tag1": "",
    "portfolio.gallery.soft.tag2": "",
    "portfolio.gallery.soft.tag3": "",
    "portfolio.gallery.soft.tag4": "@elena.k",
    "portfolio.gallery.soft.tag5": "@sophia",
    "portfolio.gallery.editorial.tag1": "",
    "portfolio.gallery.editorial.tag2": "",
    "portfolio.gallery.editorial.tag3": "@sophia",
    "portfolio.gallery.editorial.tag4": "@nina.m",
    "portfolio.gallery.editorial.tag5": "@tereza.v",
    "portfolio.gallery.evening.tag1": "",
    "portfolio.gallery.evening.tag2": "",
    "portfolio.gallery.evening.tag3": "",
    "portfolio.gallery.evening.tag4": "@elena.k",
    "portfolio.gallery.evening.tag5": "@julia.studio",
    "prices.eyebrow": "Cenník",
    "prices.h2": "Služby",
    "prices.signature.tag": "Najžiadanejšie",
    "prices.signature.h3": "Spoločenské líčenie",
    "prices.signature.p": "Spoločenské líčenie je ideálne na plesy, stužkové, oslavy či iné špeciálne príležitosti. ",
    "prices.bridal.h3": "Svadobné líčenie",
    "prices.bridal.p": "Cítťe sa vo svoj veľký deň výnimočne! ",
    "prices.trial.h3": "Skúška líčenia",
    "prices.trial.p": "Spoločne doladíme líčenie presne podľa Vašich predstáv, aby ste v deň udalosti tak mali istotu dokonalého výsledku – bez stresu. ",
    "prices.lesson.h3": "Kurz sebalíčenia",
    "prices.lesson.p": "Coming soon",
    "prices.travel.h3": "Cestovné náklady",
    "prices.travel.p": "Dojazd k vám cena podľa vzdialenosti od salónu na Račianskej 66.",
    "prices.brows.h3": "Úprava obočia a laminácia",
    "prices.brows.p": "Tvarované obočie, voliteľné farbenie a laminácia pre plnší oblúk s minimálnou údržbou.",
    "prices.shoot.h3": "Líčenie na fotenie",
    "prices.shoot.p": "Vyvážená pleť a líčenie pod svetlá a blesk  štúdio, branding alebo portfólio.",
    "prices.carouselAria": "Cenník a služby  prehľad balíčkov",
    "reviews.carouselAria": "",
    "beforeVisit.carouselAria": "Pred termínom  tipy",
    "prices.detail.openSuffix": "Otvoriť podrobnosti služby",
    "prices.detail.close": "Zatvoriť podrobnosti",
    "prices.signature.price": "40 EUR",
    "prices.bridal.price": "45 EUR",
    "prices.trial.price": "45 EUR",
    "prices.lesson.price": "75 EUR",
    "prices.travel.price": "0,25 EUR/km",
    "prices.brows.price": "",
    "prices.shoot.price": "",
    "prices.signature.duration": "Trvanie: cca 60 minút",
    "prices.bridal.duration": "Trvanie: cca 75 minút",
    "prices.trial.duration": "Trvanie: cca 90 minút",
    "prices.lesson.duration": "Trvanie: cca 4 hodiny",
    "prices.travel.duration": "Min. 4 osoby",
    "prices.brows.duration": "",
    "prices.shoot.duration": "",
    "prices.signature.detail": "  ",
    "prices.bridal.detail": "  ",
    "prices.trial.detail": "  ",
    "prices.lesson.detail": "  ",
    "prices.travel.detail":
      "Cestujem za klientkami pri objednávkach minimálne pre 4 osoby. Cestovné sa počíta z môjho salónu na Račianskej 66 k vám a späť.\n\nPred rezerváciou mi napíšte adresu a počet osôb potvrdím celkovú sumu.",
    "prices.brows.detail": "",
    "prices.shoot.detail": "",
    "reviews.eyebrow": "",
    "reviews.h2": "",
    "reviews.c1.pill": "",
    "reviews.c1.h3": "",
    "reviews.c1.p": "",
    "reviews.c2.pill": "",
    "reviews.c2.h3": "",
    "reviews.c2.p": "",
    "reviews.c3.pill": "",
    "reviews.c3.h3": "",
    "reviews.c3.p": "",
    "reviews.c4.pill": "",
    "reviews.c4.h3": "",
    "reviews.c4.p": "",
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
    "beforeVisit.t4.p": "Kvalitná vizáž chce čas  počítajte s pár minútami navyše, aby sme nič nenáhlili.",
    "faq.eyebrow": "Q&A",
    "faq.h2": "Často kladené otázky",
    "faq.q1": "Ako si rezervujem termín?",
    "faq.a1": "Na rezerváciu termínu môžete využiť rezervačný systém priamo na stránke, prípadne ma môžete kontaktovať aj na mojich sociálnych sieťach, či telefonicky. V prípade využitia rezervačného systému počkajte na potvrdenie termínu.",
    "faq.q2": "Môžem zmeniť alebo zrušiť rezerváciu?",
    "faq.a2": "Zmenili sa Vám plány? Nič sa nedeje. Ohľadom zmien v termíne či storna rezervácie ma prosím čím skôr informujte a spolu doladíme úpravy. :)                                             * V prípade storna termínu menej ako 24h pred termínom sa hradí 100% z ceny líčenia. ",
    "faq.q3": "Potrebujem skúšobné líčenie na svadbu?",
    "faq.a3": "Nie je povinný. Odporúčam ho však, aby ste si boli istá, že v deň D prebehne celý proces líčenia podľa Vašich predstáv.",
    "faq.q4": "Cestuješ aj za klientkami?",
    "faq.a4": "Áno, avšak cestujem za klientkami v prípade líčenia minimálne 4 osôb. Cestovné náklady nájdete v mojom cenníku. V opačnom prípade sa na Vás budem tešiť v mojom salóne na Račianskej 66. :)",
    "service.signature": "Spoločenské líčenie",
    "service.bridal": "Svadobné líčenie",
    "service.trial": "Skúška líčenia",
    "service.lesson": "Kurz sebalíčenia",
    "service.brows": "",
    "service.shoot": "",
    "booking.eyebrow": "Rezervácia",
    "booking.h2": "Vyberte voľný termín",
    "booking.intro": "Vyberte voľný termín v kalendári a nižšie doplňte údaje.",
    "booking.rulesTitle": "Pravidlá rezervácie",
    "booking.ruleStudio": "Rezervácie cez tento formulár sú len na termíny v štúdiu. Pre iné miesto nás kontaktujte priamo.",
    "booking.ruleVerify": "Rezervácia je iba žiadosť, kým neoveríte e-mail a štúdio ju neschváli.",
    "booking.ruleEmailExpiry": "Overovací odkaz v e-maile je platný 30 minút.",
    "booking.ruleContact": "Použite skutočný e-mail a telefónne číslo, aby sme vás vedeli kontaktovať.",
    "booking.ruleCancel": "Potvrdenú rezerváciu môžete zrušiť cez odkaz v e-maile najneskôr 24 hodiny pred termínom.",
    "booking.serviceFirst": "Ktorú službu chcete?",
    "booking.chooseServiceFirst": "Vyberte službu, aby sa zobrazili voľné dátumy a časy.",
    "booking.noSlotsForService": "Pre túto službu zatiaľ nie sú voľné termíny  skúste inú službu alebo nás kontaktujte.",
    "booking.configNeeded": "Pridajte URL webovej aplikácie do súboru assets/js/config.js (bookingScriptUrl).",
    "booking.maintenanceEyebrow": "Rezervácia",
    "booking.maintenanceH2": "Online rezervácia je dočasne nedostupná",
    "booking.maintenanceLead": "Online rezervácia je dočasne pozastavená.",
    "booking.maintenanceBody":
      "Termín si dohodnite priamo so štúdiom, telefonicky, e-mailom alebo cez Instagram.",
    "booking.maintenanceContact": "Kontaktovať štúdio",
    "booking.slotsLoading": "Načítavam voľné termíny…",
    "booking.slotsEmpty": "Momentálne nie sú voľné termíny  skúste neskôr alebo nás kontaktujte priamo.",
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
    "booking.name": "Meno Priezvisko",
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
    "booking.sending": "Odosiela sa rezervácia…",
    "booking.sendingHint": "Môže to trvať až minútu. Nezatvárajte stránku.",
    "booking.submitFailTitle": "Rezerváciu sa nepodarilo odoslať",
    "booking.selectSlot": "Najprv vyberte časový slot.",
    "booking.success": "Rezervácia odoslaná. Julia čoskoro potvrdí.",
    "booking.successPending": "Skontrolujte e-mail a do 30 minút kliknite na overovací odkaz.",
    "booking.submitSuccessTitle": "Rezervácia odoslaná",
    "booking.submitSuccessVerifyBody":
      "Poslali sme vám e-mail s overovacím odkazom. Odkaz je platný 30 minút.",
    "booking.dialogOk": "OK",
    "booking.slotTaken": "Tento termín bol práve obsadený. Vyberte iný čas.",
    "booking.error": "Niečo sa nepodarilo. Skúste znova alebo nás kontaktujte.",
    "booking.serviceMismatch": "Tento slot nezodpovedá zvolenej službe.",
    "booking.expiredVerification": "Odkaz expiroval. Ak chcete termín, odošlite novú žiadosť.",
    "booking.tokenUsed": "Tento odkaz bol už použitý alebo nie je platný.",
    "booking.invalidToken": "Neplatný alebo neznámy odkaz.",
    "booking.serverConfig": "Rezervácia je dočasne nedostupná. Kontaktujte štúdio.",
    "booking.mailError": "E-mail sa nepodarilo odoslať. Skúste neskôr alebo kontaktujte štúdio.",
    "booking.errBusy": "Server je zaneprázdnený. Skúste o chvíľu znova.",
    "booking.notFound": "Tento časový slot už v kalendári neexistuje.",
    "booking.resultEmailVerified": "E-mail overený. Štúdio posúdi vašu žiadosť.",
    "booking.resultConfirmed": "Rezervácia potvrdená.",
    "booking.resultRejected": "Táto žiadosť o rezerváciu nebola schválená.",
    "booking.resultCancelled": "Vaša rezervácia bola zrušená.",
    "booking.resultAlreadyCancelled": "Táto rezervácia už bola zrušená.",
    "booking.resultLinkError": "Túto akciu sa nepodarilo dokončiť z odkazu.",
    "booking.actionProcessing": "Spracovávam…",
    "booking.actionProcessingBody": "Čakajte prosím — dokončujem akciu z e-mailu.",
    "booking.actionProcessingHint": "Môže to trvať niekoľko sekúnd. Nezatvárajte stránku.",
    "booking.actionDoneTitle": "Hotovo",
    "booking.actionFailTitle": "Nepodarilo sa dokončiť",
    "booking.actionBackToBooking": "Späť na rezerváciu",
    "contact.eyebrow": "Kontakt",
    "contact.h2": "Ozvite sa ohľadom rezervácií a beauty otázok",
    "contact.studioTitle": "Údaje štúdia",
    "contact.hoursTitle": "Otváracie hodiny",
    "contact.noteTitle": "Poznámka k rezervácii",
    "contact.line1": "Račianska 66, Bratislava",
    "contact.email": "info@julierebeauty.com",
    "contact.phone": "+421 944 114 253",
    "contact.hours1": " ",
    "contact.hours2": "Po - Ne: Na objednávku",
    "contact.hours3": " ",
    "contact.noteP": "Pri svadobných termínoch a skupinových rezerváciách odporúčam, si rezervovať termín v predstihu, aby ste mali preferovaný čas.",
    "contact.mapHeading": "Kde nás nájdete",
    "contact.mapTitle": "Mapa — Juliére Beauty, Bratislava",
    "footer.brand": "Juliére Beauty",
    "footer.address": "Račianska 66, 831 02 Bratislava",
    "footer.socialAria": "Sociálne siete",
    "footer.socialInstagram": "Instagram",
    "footer.socialFacebook": "Facebook",
    "footer.socialX": "X",
    "footer.socialInstagramUrl": "https://www.instagram.com/julierebeauty/",
    "footer.socialFacebookUrl": "",
    "footer.socialXUrl": "",
    "lang.switchAria": "Jazyk",
    "lang.en": "English",
    "lang.sk": "Slovenčina",
    "toast.dismiss": "Zavrieť",
    "carousel.slideOf": "Snímka {{n}} z {{total}}",
  },
};

/** Merged from Google Sheet at load; empty values fall back to bundled copy. */
let sheetOverrides = { en: {}, sk: {} };

/** Optional image URLs from SK sheet column C (`data-site-img` keys, alias targets, and `portfolio.gallery.*` alt keys). */
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
 * Loads copy from published/public Google Sheet tabs (CSV: key, text; SK optional column C = image URLs).
 * SK tab is required when sheet texts are enabled; EN tab is optional (bundled EN strings used if missing).
 */
export async function loadTextsFromGoogleSheet() {
  sheetOverrides = { en: {}, sk: {} };
  sheetImageUrls = {};

  if (!CONFIG.useSheetTexts) {
    return;
  }

  const {
    csvRowsToStringMap,
    parseCsv,
    resolveSiteTextCsvUrls,
    fetchSiteTextCsv,
    siteImgUrlsFromSkCsvRows,
  } = await import("./site-text-csv.js");

  const urls = resolveSiteTextCsvUrls(CONFIG);
  const enUrl = urls.en;
  const skUrl = urls.sk;

  if (!skUrl) {
    return;
  }

  let skText;
  try {
    skText = await fetchSiteTextCsv(skUrl);
  } catch (error) {
    console.warn("[i18n] Could not load SK sheet CSV; using bundled strings.", error);
    return;
  }

  const skRows = parseCsv(skText);
  sheetOverrides.sk = normalizeStringMap(csvRowsToStringMap(skRows));
  sheetImageUrls = normalizeStringMap(siteImgUrlsFromSkCsvRows(skRows));

  if (!enUrl) {
    return;
  }

  try {
    const enText = await fetchSiteTextCsv(enUrl);
    sheetOverrides.en = normalizeStringMap(csvRowsToStringMap(parseCsv(enText)));
  } catch (error) {
    console.warn("[i18n] Could not load EN sheet CSV; using bundled EN strings.", error);
  }
}

export { extractGoogleDriveFileId } from "./site-image-delivery.js";

/**
 * Normalizes Drive share links, `?id=` URLs, or a raw file ID to a browser-usable image URL.
 * Uses `lh3.googleusercontent.com/d/{id}=w{width}`.
 * @param {unknown} input
 * @param {number} [width]
 * @returns {string | null}
 */
export function toDriveImageUrl(input, width) {
  const id = extractGoogleDriveFileId(input);
  if (!id) {
    return null;
  }

  const szToken = String(CONFIG.driveImageThumbnailSz || "w1920").trim() || "w1920";
  const parsed = Number.parseInt(szToken.replace(/^w/i, ""), 10);
  const fallbackWidth = Number.isFinite(parsed) && parsed > 0 ? parsed : 1920;
  const w = width && width > 0 ? width : fallbackWidth;
  return driveImageUrl(id, w);
}

/**
 * Accepts https/http URLs or same-site paths (`assets/...` or `/...`).
 * Rewrites Google Drive values to public image URLs via {@link toDriveImageUrl}.
 * @param {unknown} raw
 * @returns {string | null}
 */
export function resolveSiteImageUrl(raw) {
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

  if (/^\.\.\/assets\//i.test(s)) {
    return `/${s.replace(/^\.\.\//, "")}`;
  }

  if (/^assets\//i.test(s)) {
    return `/${s}`;
  }

  if (s.startsWith("/") && !s.startsWith("//")) {
    return s;
  }

  return null;
}

/**
 * Modal gallery images: when sheet copy is enabled, only SK column C URLs keyed by `altKey`
 * (e.g. `portfolio.gallery.bridal.1`) are used — no JSON fallback. Otherwise JSON `src` is the fallback.
 * @param {string | undefined} altKey
 * @param {string} jsonSrc
 * @returns {string}
 */
export function resolvePortfolioGalleryImageBase(altKey, jsonSrc) {
  const key = String(altKey ?? "").trim();
  if (CONFIG.useSheetTexts) {
    if (!key) {
      return "";
    }
    return resolveSiteImageUrl(sheetImageUrls[key]) ?? "";
  }

  let resolved = "";
  if (key) {
    resolved = resolveSiteImageUrl(sheetImageUrls[key]) ?? "";
  }
  if (!resolved) {
    resolved = resolveSiteImageUrl(jsonSrc) ?? "";
  }
  return resolved;
}

export function resolvePortfolioGalleryImageSrc(altKey, jsonSrc) {
  const resolved = resolvePortfolioGalleryImageBase(altKey, jsonSrc);
  if (!resolved) {
    return "";
  }
  return siteImageSrcForProfile(resolved, "gallery");
}

/** Apply sheet URLs and responsive delivery for elements with `data-site-img`. */
export function applySheetImageUrls() {
  document.querySelectorAll("img[data-site-img]").forEach((img) => {
    if (!(img instanceof HTMLImageElement)) {
      return;
    }

    const key = img.dataset.siteImg?.trim();
    const profile = normalizeSiteImageProfile(img.dataset.siteImgProfile);
    const fromSheet = key ? resolveSiteImageUrl(sheetImageUrls[key]) : null;
    const resolved = fromSheet || resolveSiteImageUrl(img.getAttribute("src") || "");
    if (!resolved) {
      return;
    }

    applySiteImageDeliveryToElement(img, resolved, profile);
  });
}

export { buildSiteImageDelivery, normalizeSiteImageProfile, siteImageSrcForProfile };

/**
 * @returns {"en" | "sk"}
 */
export function getLang() {
  return getLangFromPath();
}

/**
 * @param {"en" | "sk"} lang
 */
export function setLang(lang) {
  if (lang !== "en" && lang !== "sk") {
    return;
  }
  const current = getLangFromPath();
  if (lang === current) {
    document.documentElement.lang = lang === "sk" ? "sk" : "en";
    applyTranslations();
    window.dispatchEvent(new CustomEvent("juliamakeup:lang", { detail: { lang } }));
    return;
  }
  window.location.assign(switchLocaleHref(lang));
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

const HOME_INSTAGRAM_EMBED_KEY_RE = /^home\.instagram\.embed\.(\d+)$/;
const LEGACY_BRIDAL_INSTAGRAM_EMBED_KEY_RE = /^bridalLanding\.instagram\.embed\.(\d+)$/;

/** Post/reel permalinks for homepage Instagram embeds (sheet column B → `home.instagram.embed.N`). */
export function getHomeInstagramEmbedPermalinks() {
  const lang = getLang();
  /** @type {Map<number, string>} */
  const byOrder = new Map();

  const put = (key, raw) => {
    const match = key.match(HOME_INSTAGRAM_EMBED_KEY_RE) ?? key.match(LEGACY_BRIDAL_INSTAGRAM_EMBED_KEY_RE);
    if (!match) {
      return;
    }
    const url = String(raw ?? "").trim();
    if (!url) {
      return;
    }
    byOrder.set(Number(match[1]), url);
  };

  for (const [key, val] of Object.entries(BUNDLED_STRINGS.en ?? {})) {
    put(key, val);
  }
  for (const [key, val] of Object.entries(BUNDLED_STRINGS[lang] ?? {})) {
    put(key, val);
  }
  for (const [key, val] of Object.entries(sheetOverrides[lang] ?? {})) {
    put(key, val);
  }

  return [...byOrder.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, url]) => url);
}

export function getDateLocale() {
  return getLang() === "sk" ? "sk-SK" : "en-GB";
}

function normalizeFooterHref(raw) {
  const s = String(raw ?? "").trim();
  if (!s || s === "#") {
    return "";
  }
  if (/^https?:\/\//i.test(s)) {
    return s;
  }
  if (s.startsWith("mailto:") || (s.startsWith("/") && !s.startsWith("//"))) {
    return s;
  }
  return "";
}

/** Footer `<a href>` from Google Sheet (`sheetOverrides`) → `CONFIG.social` → bundled defaults. */
function applyFooterSocialLinks() {
  const lang = getLang();
  const triples = [
    ["footer-link-instagram", "footer.socialInstagramUrl", CONFIG.social?.instagram],
    ["footer-link-facebook", "footer.socialFacebookUrl", CONFIG.social?.facebook],
    ["footer-link-x", "footer.socialXUrl", CONFIG.social?.x],
  ];
  for (const [id, urlKey, cfgFallback] of triples) {
    const a = document.getElementById(id);
    if (!a) {
      continue;
    }
    const rawSheet = sheetOverrides[lang]?.[urlKey];
    let href = "";
    if (rawSheet !== undefined && String(rawSheet).trim() !== "") {
      href = normalizeFooterHref(rawSheet);
    }
    if (!href) {
      href = normalizeFooterHref(cfgFallback);
    }
    if (!href) {
      href = normalizeFooterHref(BUNDLED_STRINGS[lang]?.[urlKey] ?? BUNDLED_STRINGS.en[urlKey]);
    }
    a.href = href || "#";
  }

  const landingInstagramLink = document.getElementById("home-instagram-profile-link");
  if (landingInstagramLink) {
    const footerInstagram = document.getElementById("footer-link-instagram");
    if (footerInstagram?.href && footerInstagram.href !== "#") {
      landingInstagramLink.href = footerInstagram.href;
    }
  }
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

  applyFooterSocialLinks();
}

/** @type {HTMLElement | null} */
let sheetLoadingOverlayEl = null;

function sheetLoadingLabel() {
  const lang = getLang();
  return BUNDLED_STRINGS[lang]?.["sheet.loading"] ?? BUNDLED_STRINGS.en["sheet.loading"] ?? "Loading…";
}

function hideSheetLoadingOverlay() {
  document.body.classList.remove("is-sheet-loading");
  if (sheetLoadingOverlayEl) {
    sheetLoadingOverlayEl.setAttribute("aria-busy", "false");
    sheetLoadingOverlayEl.classList.remove("is-visible");
  }
}

async function hydrateTextsFromGoogleSheet() {
  if (!CONFIG.useSheetTexts) {
    return;
  }

  const { resolveSiteTextCsvUrls } = await import("./site-text-csv.js");
  const { sk } = resolveSiteTextCsvUrls(CONFIG);
  if (!sk) {
    return;
  }

  /** Only veil the page if the sheet is still loading after a beat — avoids blocking LCP. */
  let overlayTimer = window.setTimeout(() => {
    showSheetLoadingOverlay();
  }, 450);

  try {
    await loadTextsFromGoogleSheet();
    document.documentElement.lang = getLang() === "sk" ? "sk" : "en";
    applyTranslations();
    applySheetImageUrls();
    window.dispatchEvent(
      new CustomEvent("juliamakeup:lang", { detail: { lang: getLang(), source: "sheet" } }),
    );
  } finally {
    window.clearTimeout(overlayTimer);
    hideSheetLoadingOverlay();
  }
}

export function initI18n() {
  const lang = getLangFromPath();
  document.documentElement.lang = lang === "sk" ? "sk" : "en";
  applyTranslations();
  void hydrateTextsFromGoogleSheet();

  document.querySelectorAll("[data-lang-set]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = btn.dataset.langSet;
      if (next === "en" || next === "sk") {
        setLang(next);
      }
    });
  });
}

function showSheetLoadingOverlay() {
  document.body.classList.add("is-sheet-loading");
  if (!sheetLoadingOverlayEl) {
    const root = document.createElement("div");
    root.id = "sheet-loading-overlay";
    root.className = "sheet-loading-overlay";
    root.setAttribute("role", "status");
    root.setAttribute("aria-live", "polite");
    root.setAttribute("aria-busy", "true");

    const ambient = document.createElement("div");
    ambient.className = "sheet-loading-overlay__ambient";
    ambient.setAttribute("aria-hidden", "true");

    const inner = document.createElement("div");
    inner.className = "sheet-loading-overlay__inner";

    const card = document.createElement("div");
    card.className = "sheet-loading-overlay__card";

    const brand = document.createElement("p");
    brand.className = "sheet-loading-overlay__brand";
    brand.setAttribute("aria-hidden", "true");
    const linePrimary = document.createElement("span");
    linePrimary.className = "sheet-loading-overlay__brand-line sheet-loading-overlay__brand-line--primary";
    linePrimary.textContent = "Juliére";
    const lineSecondary = document.createElement("span");
    lineSecondary.className = "sheet-loading-overlay__brand-line sheet-loading-overlay__brand-line--secondary";
    lineSecondary.textContent = "Beauty";
    brand.append(linePrimary, lineSecondary);

    const mark = document.createElement("div");
    mark.className = "sheet-loading-overlay__mark";
    mark.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 3; i += 1) {
      const dot = document.createElement("span");
      dot.className = "sheet-loading-overlay__dot";
      mark.appendChild(dot);
    }

    const rule = document.createElement("span");
    rule.className = "sheet-loading-overlay__rule";
    rule.setAttribute("aria-hidden", "true");

    const label = document.createElement("p");
    label.className = "sheet-loading-overlay__label";

    card.append(brand, mark, rule, label);
    inner.appendChild(card);
    root.append(ambient, inner);
    document.body.appendChild(root);
    sheetLoadingOverlayEl = root;
  }
  const labelEl = sheetLoadingOverlayEl.querySelector(".sheet-loading-overlay__label");
  if (labelEl) {
    labelEl.textContent = sheetLoadingLabel();
  }
  sheetLoadingOverlayEl.classList.add("is-visible");
}

/** Bundled defaults; use `npm run export:site-texts` to regenerate sheet seed CSVs. */
export { BUNDLED_STRINGS };
