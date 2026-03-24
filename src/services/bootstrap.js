const bcrypt = require('bcryptjs');
const { loc } = require('../utils/i18n');
const { slugify, uniqueServiceSlug } = require('../utils/slugify');
const SiteSettings = require('../models/SiteSettings');
const ServiceItem = require('../models/ServiceItem');
const TeamMember = require('../models/TeamMember');
const SiteNotification = require('../models/SiteNotification');
const User = require('../models/User');

function fullSiteDefaults() {
  return {
    key: 'main',
    seoTitle: loc(
      'Eleczio — Electrical & Electronics · Khandwa',
      'Eleczio — Electrical & Electronics · Khandwa'
    ),
    brandLine1: loc('Eleczio', 'Eleczio'),
    brandLine2: loc('Electrical & Electronics', 'Electrical & Electronics'),
    heroBadge: loc(
      "Khandwa's trusted repair service",
      "Khandwa's Trusted Repair Service"
    ),
    heroWelcomeLine: loc('Welcome', 'Welcome'),
    heroPromoLine: loc(
      '₹200 per visit — fast electrical & electronics service in Khandwa',
      '₹200 per visit — Khandwa me fast electrical & electronics service'
    ),
    heroTitleLine1: loc('For your home', 'Aapke Ghar Ki'),
    heroTitleHighlight: loc(
      'Electrical & Electronics',
      'Electrical & Electronics'
    ),
    heroTitleLine2: loc('Solutions you can trust', 'Samasya Ka Samadhan'),
    heroSub: loc(
      'Professional, fast and affordable electrical & electronics repairs — doorstep service in Khandwa.',
      'Professional, fast aur affordable repair service for all your electrical and electronics needs — right at your doorstep in Khandwa.'
    ),
    statYears: '25+',
    statYearsLabel: loc('Years experience', 'Years Experience'),
    statVisitCharge: '₹200',
    statVisitLabel: loc('Per visit charge', 'Per Visit Charge'),
    statCustomers: '500+',
    statCustomersLabel: loc('Happy customers', 'Happy Customers'),
    visitBannerMain: loc('₹200 service charge', '₹200 Service Charge'),
    visitBannerSub: loc(
      'Per visit — no hidden fees',
      'Per Visit — No Hidden Fees'
    ),
    addressShort: loc(
      'Lal Chowki, Gayatri Colony, Khandwa',
      'Lal Chowki, Gayatri Colony, Khandwa'
    ),
    aboutTag: loc('About us', 'About Us'),
    aboutTitle: loc('About us — ', 'Hamare Baare Mein — '),
    aboutTitleHighlight: loc('Trust & experience', 'Bharosa Aur Anubhav'),
    aboutBody: loc(
      'Eleczio is a trusted local team bringing quality electrical and electronics repairs to Khandwa. Experienced technicians fix problems quickly and the right way.',
      'Eleczio ek trusted local business hai jo Khandwa ke logo ko quality electrical aur electronics repair services provide karta hai. Hamare paas experienced technicians hain jo aapke ghar ki samasya ko tez aur sahi tarike se suljhate hain.'
    ),
    aboutElecTitle: loc('Electrical', 'Electrical'),
    aboutElecSub: loc('Experts', 'Experts'),
    aboutEltrTitle: loc('Electronics', 'Electronics'),
    aboutEltrSub: loc('Repair', 'Repair'),
    aboutHomeTitle: loc('Home', 'Home'),
    aboutHomeSub: loc('Services', 'Services'),
    aboutPoints: [
      {
        strong: loc('Guaranteed quality', 'Guaranteed Quality Work'),
        span: loc(
          'Quality materials and dependable workmanship.',
          'Har repair me quality materials use hoti hai aur kaam guarantee ke saath hota hai.'
        ),
        icon: 'fa-solid fa-shield-halved'
      },
      {
        strong: loc('Same-day service', 'Same Day Service'),
        span: loc(
          'Quick visits so you wait less.',
          'Jaldi aur time pe service — aapko zyada wait nahi karna padta.'
        ),
        icon: 'fa-solid fa-clock'
      },
      {
        strong: loc('Fair pricing', 'Affordable Pricing'),
        span: loc(
          'Only ₹200 per visit — clear, honest pricing.',
          'Sirf ₹200 per visit — budget-friendly aur transparent pricing.'
        ),
        icon: 'fa-solid fa-wallet'
      }
    ],
    servicesSectionTag: loc('Our services', 'Our Services'),
    servicesTitle: loc('What we ', 'Kya Kya '),
    servicesTitleHighlight: loc('repair', 'Repair'),
    servicesTitleSuffix: loc('?', ' Karte Hain?'),
    servicesSub: loc(
      'One place for home electrical & electronics needs.',
      'Har ghar ki electrical aur electronics zaroorat ke liye — ek hi jagah solution.'
    ),
    whyTitle: loc('Why choose us?', 'Kyun Choose Karein Hume?'),
    whySub: loc(
      "Khandwa's trusted electrical & electronics experts",
      'Khandwa ke sabse trusted electrical & electronics experts'
    ),
    whyFeatures: [
      {
        text: loc('Experienced technicians', 'Experienced Technicians'),
        icon: 'fa-solid fa-check-circle'
      },
      {
        text: loc('Doorstep service', 'Doorstep Service'),
        icon: 'fa-solid fa-check-circle'
      },
      {
        text: loc('₹200 fixed visit charge', '₹200 Fixed Visit Charge'),
        icon: 'fa-solid fa-check-circle'
      },
      {
        text: loc('Same-day response', 'Same Day Response'),
        icon: 'fa-solid fa-check-circle'
      }
    ],
    complaintTag: loc('Book service', 'Add Complaint'),
    complaintTitle: loc('Book ', 'Service '),
    complaintTitleHighlight: loc('service', 'Book Karein'),
    complaintSub: loc(
      'Describe your issue — we will contact you soon.',
      'Apni problem describe karein — hum jald hi aapse contact karenge aur service fix karenge.'
    ),
    formNote: loc(
      'Service charge only ₹200 per visit — no hidden fees.',
      'Service charge sirf ₹200 per visit — koi hidden fee nahi.'
    ),
    whatsappE164: '919826099647',
    primaryTel: '9826099647',
    secondaryTel: '9827091651',
    footerBrandSuffix: loc('— Khandwa', '— Khandwa'),
    footerBlurb: loc(
      'Trusted electrical & electronics repairs in Khandwa — fast, professional and affordable.',
      'Khandwa ka trusted electrical aur electronics repair service provider. Professional, fast aur affordable — aapke ghar tak.'
    ),
    footerAddress: loc(
      'Lal Chowki, Gayatri Colony, Gali No. 2, Khandwa – 450001',
      'Lal Chowki, Gayatri Colony, Gali No. 2, Khandwa – 450001'
    ),
    copyrightYear: '2025',
    footerHeartText: loc('Made with ♥ for Khandwa', 'Made with ♥ for Khandwa')
  };
}

/** Legacy hero stat showed "10+"; normalize to 25+ */
function shouldUpgradeStatYearsTo25(v) {
  const compact = String(v ?? '')
    .trim()
    .replace(/\s/g, '');
  return compact === '10+' || compact === '10';
}

const defaultServices = [
  {
    slug: 'home-electrical-repair',
    title: loc('Home electrical repair', 'Home Electrical Repair'),
    description: loc(
      'Short circuits, switchboards, fuses, MCBs, power points — fixed professionally at home.',
      'Short circuit, switch board, fuse, MCB, power point installation — sab kuch ghar pe fix hota hai.'
    ),
    detail: loc(
      [
        'From loose switches to full distribution board faults, we troubleshoot wiring safely at your location. Our technicians carry common parts so many repairs finish in a single visit.',
        'We clearly explain what failed — fuse, MCB trip, neutral issue, or socket overload — before we start work. Transparent pricing: ₹200 visit charge plus parts if required.',
        'Common jobs include replacing MCBs, rewiring burnt holders, earthing checks, tube-light and LED retrofitting, and stabiliser or inverter input wiring.',
        'Serving Lal Chowki, Gayatri Colony and wider Khandwa with tidy workmanship and respect for your home. For urgent shorts or sparking, call immediately — we prioritise safety first.'
      ].join('\n\n'),
      [
        'Loose switch se leke DB (distribution board) tak ki problem ko hum ghar pe safe trike se check karte hain. Common spare parts saath me le jaate hain taaki ek hi visit me kaam ho jaye.',
        'Hum pehle clearly batate hain kya kharabi hai — fuse, MCB trip, neutral ya overload — phir kaam start karte hain. Pricing clear: ₹200 visit charge, parts alag.',
        'MCB change, jal chuka holder, earthing check, tube/LED fitting, stabiliser–inverter wiring — yeh sab regular kaam hain.',
        'Lal Chowki, Gayatri Colony aur pure Khandwa me neat kaam aur ghar ki respect ke sath. Sparking ya short circuit ho to turant call karein — safety humari priority.'
      ].join('\n\n')
    ),
    iconClass: 'fa-solid fa-plug-circle-bolt',
    sort_order: 1
  },
  {
    slug: 'wiring-installation',
    title: loc('Wiring & installation', 'Wiring & Installation'),
    description: loc(
      'New wiring, rewiring and panel work — done safely and neatly.',
      'Naye ghar ki wiring, rewiring, panel installation — professional tarike se, safely.'
    ),
    detail: loc(
      [
        'Whether new construction or an older home that needs safer wiring, we plan cable routes, load calculation and MCB selection for long-term reliability.',
        'We use quality insulation practices, proper looping, and neat chasing or conduit where needed — not a temporary “jugaad” that fails in monsoon.',
        'Add-on points, AC circuits, inverter/UPS dedicated lines, and three-phase sub-panels are all in scope. We can coordinate with your architect or contractor.',
        'After install we test insulation, polarity and tripping behaviour so your family gets peace of mind — documentation of changes available on request.'
      ].join('\n\n'),
      [
        'Naya ghar ho ya purane ghar me safe wiring chahiye — hum load, cable size aur MCB ka plan banate hain taaki wiring lambe samay tak reliable rahe.',
        'Proper joint, insulation aur jahan zarurat ho neat conduit / chasing — aise kaam jo barsaat me kharab na ho.',
        'Extra points, AC line, inverter/UPS ki alag wiring, three-phase kaam — sab kar sakte hain. Aapke contractor ke sath coordinate bhi ho sakta hai.',
        'Kaam ke baad testing: polarity, earthing, MCB trip — taaki family ko tension na ho. Zarurat ho to hum changes ki short list de sakte hain.'
      ].join('\n\n')
    ),
    iconClass: 'fa-solid fa-network-wired',
    sort_order: 2
  },
  {
    slug: 'fan-cooler-repair',
    title: loc('Fan & cooler repair', 'Fan / Cooler Repair'),
    description: loc(
      'Ceiling & table fans, desert coolers — motor, speed and winding issues.',
      'Ceiling fan, table fan, desert cooler — motor repair, speed control, winding sab hota hai.'
    ),
    detail: loc(
      [
        'Slow fans, noise, wobble or speed not changing — usually bush, capacitor or regulator. We diagnose without unnecessary part swaps.',
        'Desert coolers: motor humming, pump not lifting water, pad replacement guidance, and wiring to outdoor points — all handled at home.',
        'Ceiling fan balancing and safe mounting after shifting rooms; table and pedestal fans for study or shop corners.',
        'Summer peak in Khandwa means we keep slots flexible — book early on very hot days. We also advise when replacement is cheaper than repeated repairs.'
      ].join('\n\n'),
      [
        'Fan slow hai, awaaz karti hai, speed control kaam nahi karti — aksar capacitor ya bush issue. Bina extra parts ke unnecessary change ke diagnose karte hain.',
        'Desert cooler: motor jam, pump ka pani nahi chadh raha, pad change ki salah, outdoor socket wiring — ghar pe.',
        'Ceiling fan ko shift karne ke baad safe fitting, table/pedestal fan shop ya study ke liye.',
        'Garmi me slots jaldi full ho jaate hain — early book karein. Kabhi naya fan sasta padta hai repeat repair se, woh bhi honestly batate hain.'
      ].join('\n\n')
    ),
    iconClass: 'fa-solid fa-fan',
    sort_order: 3
  },
  {
    slug: 'tv-electronics-repair',
    title: loc('TV & electronics repair', 'TV / Electronics Repair'),
    description: loc(
      'LED/LCD TVs, set-top boxes — display, sound and power problems.',
      'LED TV, LCD, CRT, set-top box — display, sound, power issues — experienced technician se repair.'
    ),
    detail: loc(
      [
        'Power LED blinking, no backlight, half screen, colour lines or audio but no picture — we work board-level where economical and recommend panel replacement only when justified.',
        'Set-top box power supplies, HDMI handshake issues with basic cabling help — we don’t upsell boxes you don’t need.',
        'Small electronics like DVD players, soundbars or stabilisers often share similar power faults; bring details on WhatsApp for a quick feasibility check.',
        'Workshop backup for deep soldering is available for complex TV boards; home visit still preferred when safe to transport isn’t possible.'
      ].join('\n\n'),
      [
        'Blinking LED, backlight off, half display, colour line, awaaz hai picture nahi — jahan board repair sasta ho wahan karte hain; panel tabhi suggest jab justified ho.',
        'STB ki power issue, basic HDMI/cable salah — extra box bechne ka kaam nahi.',
        'DVD, soundbar, stabiliser jaise chhote electronics bhi similar fault me aate hain — pehle WhatsApp pe detail bhej sakte hain.',
        'Gehri soldering ke liye backup workshop hai; TV transport mushkil ho to ghar pe visit prefer.'
      ].join('\n\n')
    ),
    iconClass: 'fa-solid fa-tv',
    sort_order: 4
  },
  {
    slug: 'ac-refrigerator-service',
    title: loc('AC & refrigerator service', 'AC & Refrigerator Service'),
    description: loc(
      'Cooling issues, gas and compressor faults — home service available.',
      'Cooling problem, gas refilling, compressor issue — AC aur fridge repair at your doorstep.'
    ),
    detail: loc(
      [
        'Split and window AC: gas top-up only after leak check philosophy, filter and coil cleaning for efficiency, sensor and PCB faults where accessible.',
        'Refrigerator not cooling, excess ice, compressor cutting too often — we check thermostat behaviour, defrost circuits and door sealing basics.',
        'We explain warranty-safe tips (like correct temperature dial) so your electricity bill improves after service.',
        'Heavy compressor or sealed-system jobs may need follow-up visits — we quote scope honestly before you commit.'
      ].join('\n\n'),
      [
        'Split/window AC: sirf tab gas jab leak check ke baad justified ho, coil/filter cleaning se bill kam ho sakta hai, sensor/PCB jahan tak safe ho.',
        'Fridge thanda nahi, zyada barf, compressor baar-baar trip — thermostat, defrost, door seal basic check.',
        'Bill kam karne ke liye simple tips (temperature dial, spacing) bhi batate hain.',
        'Compressor ya sealed-system ka kaam kabhi dobara visit maang sakta hai — pehle scope clear, phir commitment.'
      ].join('\n\n')
    ),
    iconClass: 'fa-solid fa-snowflake',
    sort_order: 5
  },
  {
    slug: 'other-home-services',
    title: loc('Other home services', 'Other Home Services'),
    description: loc(
      'Water pump, geyser, inverter, UPS — we handle more electrical & electronic jobs.',
      'Water pump, geyser, inverter, UPS — jo bhi electrical ya electronics problem ho, hum hain na!'
    ),
    detail: loc(
      [
        'Monoblock and submersible pump starters, geyser thermostat and element checks, inverter/UPS battery string health — one team for mixed electrical loads.',
        'Holiday light strings, motor auto-switch panels for overhead tanks, and apartment DB add-ons — tell us the brand and symptom for faster diagnosis.',
        'We coordinate with plumbers when a leak and electrical point overlap so you don’t pay twice.',
        'Not sure if it fits our scope? Text a photo on WhatsApp — we’ll advise before you book a visit.'
      ].join('\n\n'),
      [
        'Water pump starter, geyser thermostat/element, inverter–UPS battery check — electrical mix load ka ek hi team.',
        'Tank motor auto panel, chhoti DB extension, festival lighting — brand aur symptom batao to jaldi diagnose.',
        'Plumber ke sath mil ke kaam jahan leak + point overlap ho — do baar paisa na jaye.',
        'Confirm nahi ki hum karenge? WhatsApp pe photo bhejo — visit se pehle salah mil jayegi.'
      ].join('\n\n')
    ),
    iconClass: 'fa-solid fa-screwdriver-wrench',
    sort_order: 6
  }
];

const defaultMembers = [
  {
    name: 'Rajkumar Tiwari',
    role: loc('Electrical expert', 'Electricals Expert'),
    phone: '9826099647',
    phone_display: '98260 99647',
    icon_variant: 'elec',
    sort_order: 1
  },
  {
    name: 'Antim Tiwari',
    role: loc('Electronics expert', 'Electronics Expert'),
    phone: '9827091651',
    phone_display: '98270 91651',
    icon_variant: 'eltr',
    sort_order: 2
  }
];

function settingsNeedsMigration(doc) {
  if (!doc) return false;
  const hb = doc.heroBadge;
  if (hb == null) return true;
  if (typeof hb === 'string') return true;
  if (typeof hb === 'object' && hb.en == null && hb.hi == null) return true;
  return false;
}

function mergeLegacyIntoDefaults(legacy) {
  const fresh = fullSiteDefaults();
  const scalars = [
    'key',
    'whatsappE164',
    'primaryTel',
    'secondaryTel',
    'copyrightYear',
    'statYears',
    'statVisitCharge',
    'statCustomers',
    '_id',
    'created_at',
    'updated_at',
    '__v'
  ];
  for (const k of Object.keys(fresh)) {
    if (scalars.includes(k)) continue;
    if (k === 'aboutPoints' || k === 'whyFeatures') continue;
    const old = legacy[k];
    if (old && typeof old === 'object' && !Array.isArray(old)) {
      if ('en' in old || 'hi' in old) {
        fresh[k] = {
          en: old.en != null ? String(old.en) : fresh[k].en,
          hi: old.hi != null ? String(old.hi) : fresh[k].hi
        };
      }
    } else if (typeof old === 'string') {
      const def = fresh[k];
      if (def && typeof def === 'object' && 'en' in def) {
        fresh[k] = { en: def.en, hi: old };
      }
    }
  }
  if (Array.isArray(legacy.aboutPoints) && legacy.aboutPoints.length) {
    fresh.aboutPoints = legacy.aboutPoints.map((p, i) => {
      if (p.strong && typeof p.strong === 'object' && ('en' in p.strong || 'hi' in p.strong)) {
        return {
          strong: {
            en: p.strong.en || fresh.aboutPoints[i]?.strong?.en || '',
            hi: p.strong.hi || fresh.aboutPoints[i]?.strong?.hi || ''
          },
          span: {
            en: p.span?.en || fresh.aboutPoints[i]?.span?.en || '',
            hi: p.span?.hi || fresh.aboutPoints[i]?.span?.hi || ''
          },
          icon: p.icon || 'fa-solid fa-circle-check'
        };
      }
      return {
        strong: {
          en: fresh.aboutPoints[i]?.strong?.en || String(p.strong || ''),
          hi: String(p.strong || '')
        },
        span: {
          en: fresh.aboutPoints[i]?.span?.en || String(p.span || ''),
          hi: String(p.span || '')
        },
        icon: p.icon || 'fa-solid fa-circle-check'
      };
    });
  }
  if (Array.isArray(legacy.whyFeatures) && legacy.whyFeatures.length) {
    fresh.whyFeatures = legacy.whyFeatures.map((f, i) => {
      if (f.text && typeof f.text === 'object') {
        return {
          text: {
            en: f.text.en || fresh.whyFeatures[i]?.text?.en || '',
            hi: f.text.hi || fresh.whyFeatures[i]?.text?.hi || ''
          },
          icon: f.icon || 'fa-solid fa-check-circle'
        };
      }
      return {
        text: {
          en: fresh.whyFeatures[i]?.text?.en || String(f.text || ''),
          hi: String(f.text || '')
        },
        icon: f.icon || 'fa-solid fa-check-circle'
      };
    });
  }
  fresh.whatsappE164 = legacy.whatsappE164 || fresh.whatsappE164;
  fresh.primaryTel = legacy.primaryTel || fresh.primaryTel;
  fresh.secondaryTel = legacy.secondaryTel || fresh.secondaryTel;
  fresh.statYears = legacy.statYears || fresh.statYears;
  if (shouldUpgradeStatYearsTo25(fresh.statYears)) fresh.statYears = '25+';
  fresh.statVisitCharge = legacy.statVisitCharge || fresh.statVisitCharge;
  fresh.statCustomers = legacy.statCustomers || fresh.statCustomers;
  fresh.copyrightYear = legacy.copyrightYear || fresh.copyrightYear;
  return fresh;
}

function locHasShubham(loc) {
  if (!loc || typeof loc !== 'object') return false;
  return (
    String(loc.en || '')
      .toLowerCase()
      .includes('shubham') ||
    String(loc.hi || '')
      .toLowerCase()
      .includes('shubham')
  );
}

const ELECZIO_BRAND_LOCALE_KEYS = [
  'seoTitle',
  'brandLine1',
  'brandLine2',
  'heroBadge',
  'heroTitleLine1',
  'heroTitleHighlight',
  'heroTitleLine2',
  'heroSub',
  'statYearsLabel',
  'statVisitLabel',
  'statCustomersLabel',
  'visitBannerMain',
  'visitBannerSub',
  'addressShort',
  'aboutTag',
  'aboutTitle',
  'aboutTitleHighlight',
  'aboutBody',
  'aboutElecTitle',
  'aboutElecSub',
  'aboutEltrTitle',
  'aboutEltrSub',
  'aboutHomeTitle',
  'aboutHomeSub',
  'servicesSectionTag',
  'servicesTitle',
  'servicesTitleHighlight',
  'servicesTitleSuffix',
  'servicesSub',
  'whyTitle',
  'whySub',
  'complaintTag',
  'complaintTitle',
  'complaintTitleHighlight',
  'complaintSub',
  'formNote',
  'footerBrandSuffix',
  'footerBlurb',
  'footerAddress',
  'footerHeartText'
];

function applyEleczioBrandRename(doc) {
  const d = fullSiteDefaults();
  let changed = false;
  for (const key of ELECZIO_BRAND_LOCALE_KEYS) {
    if (locHasShubham(doc[key])) {
      doc[key] = { en: d[key].en, hi: d[key].hi };
      changed = true;
    }
  }
  if (Array.isArray(doc.aboutPoints)) {
    doc.aboutPoints.forEach((pt, i) => {
      if (locHasShubham(pt.strong) || locHasShubham(pt.span)) {
        const def = d.aboutPoints[i];
        if (def) {
          pt.strong = { en: def.strong.en, hi: def.strong.hi };
          pt.span = { en: def.span.en, hi: def.span.hi };
        } else {
          pt.strong = {
            en: String(pt.strong?.en || '').replace(/shubham/gi, 'Eleczio'),
            hi: String(pt.strong?.hi || '').replace(/shubham/gi, 'Eleczio')
          };
          pt.span = {
            en: String(pt.span?.en || '').replace(/shubham/gi, 'Eleczio'),
            hi: String(pt.span?.hi || '').replace(/shubham/gi, 'Eleczio')
          };
        }
        changed = true;
      }
    });
  }
  if (Array.isArray(doc.whyFeatures)) {
    doc.whyFeatures.forEach((f, i) => {
      if (locHasShubham(f.text)) {
        const def = d.whyFeatures[i];
        if (def) {
          f.text = { en: def.text.en, hi: def.text.hi };
        } else {
          f.text = {
            en: String(f.text?.en || '').replace(/shubham/gi, 'Eleczio'),
            hi: String(f.text?.hi || '').replace(/shubham/gi, 'Eleczio')
          };
        }
        changed = true;
      }
    });
  }
  if (
    doc.brandLine2?.en === '& Electricals' &&
    doc.brandLine2?.hi === '& Electricals'
  ) {
    doc.brandLine2 = { en: d.brandLine2.en, hi: d.brandLine2.hi };
    changed = true;
  }
  if (
    doc.footerBrandSuffix?.en === '& Electricals — Khandwa' &&
    doc.footerBrandSuffix?.hi === '& Electricals — Khandwa'
  ) {
    doc.footerBrandSuffix = {
      en: d.footerBrandSuffix.en,
      hi: d.footerBrandSuffix.hi
    };
    changed = true;
  }
  return changed;
}

async function ensureSiteSettings() {
  const raw = await SiteSettings.findOne({ key: 'main' }).lean();
  if (!raw) {
    await SiteSettings.create(fullSiteDefaults());
  } else if (settingsNeedsMigration(raw)) {
    const merged = mergeLegacyIntoDefaults(raw);
    applyEleczioBrandRename(merged);
    if (shouldUpgradeStatYearsTo25(merged.statYears)) merged.statYears = '25+';
    await SiteSettings.replaceOne({ key: 'main' }, merged);
  } else {
    let changed = false;
    const doc = await SiteSettings.findOne({ key: 'main' });
    if (applyEleczioBrandRename(doc)) changed = true;
    if (shouldUpgradeStatYearsTo25(doc.statYears)) {
      doc.statYears = '25+';
      changed = true;
    }
    if (!doc.aboutPoints?.length) {
      doc.aboutPoints = fullSiteDefaults().aboutPoints;
      changed = true;
    }
    if (!doc.whyFeatures?.length) {
      doc.whyFeatures = fullSiteDefaults().whyFeatures;
      changed = true;
    }
    const d = fullSiteDefaults();
    if (!doc.aboutElecTitle?.en && !doc.aboutElecTitle?.hi) {
      doc.aboutElecTitle = d.aboutElecTitle;
      doc.aboutElecSub = d.aboutElecSub;
      doc.aboutEltrTitle = d.aboutEltrTitle;
      doc.aboutEltrSub = d.aboutEltrSub;
      doc.aboutHomeTitle = d.aboutHomeTitle;
      doc.aboutHomeSub = d.aboutHomeSub;
      changed = true;
    }
    const emptyLoc = (x) =>
      !x ||
      (!String(x.en || '').trim() && !String(x.hi || '').trim());
    if (emptyLoc(doc.heroWelcomeLine)) {
      doc.heroWelcomeLine = d.heroWelcomeLine;
      changed = true;
    }
    if (emptyLoc(doc.heroPromoLine)) {
      doc.heroPromoLine = d.heroPromoLine;
      changed = true;
    }
    if (changed) await doc.save();
  }
}

async function migrateServiceItemsShape() {
  const items = await ServiceItem.find().lean();
  for (const s of items) {
    if (typeof s.title === 'string') {
      await ServiceItem.updateOne(
        { _id: s._id },
        {
          $set: {
            title: { en: s.title, hi: s.title },
            description: { en: s.description, hi: s.description }
          }
        }
      );
    }
  }
}

async function migrateTeamMembersShape() {
  const rows = await TeamMember.find().lean();
  for (const m of rows) {
    if (typeof m.role === 'string') {
      await TeamMember.updateOne(
        { _id: m._id },
        { $set: { role: { en: m.role, hi: m.role } } }
      );
    }
  }
}

async function migrateNotificationsShape() {
  const rows = await SiteNotification.find().lean();
  for (const n of rows) {
    if (typeof n.title === 'string') {
      await SiteNotification.updateOne(
        { _id: n._id },
        {
          $set: {
            title: { en: n.title, hi: n.title },
            body: {
              en: n.body || '',
              hi: n.body || ''
            }
          }
        }
      );
    }
  }
}

async function migrateServiceSlugsAndDetails() {
  const items = await ServiceItem.find().sort({ sort_order: 1 });
  for (const s of items) {
    const updates = {};
    const titleEn =
      typeof s.title === 'string' ? s.title : String(s.title?.en || '').trim();
    const titleHi =
      typeof s.title === 'string' ? s.title : String(s.title?.hi || '').trim();

    if (!s.slug || !String(s.slug).trim()) {
      const base = slugify(titleEn || titleHi || 'service');
      updates.slug = await uniqueServiceSlug(ServiceItem, base, s._id);
    }

    const dEn = s.detail && s.detail.en;
    const dHi = s.detail && s.detail.hi;
    if (!String(dEn || '').trim() && !String(dHi || '').trim()) {
      const match = defaultServices.find(
        (d) =>
          d.title.en === titleEn ||
          d.title.hi === titleHi ||
          (titleEn && slugify(d.title.en) === slugify(titleEn))
      );
      if (match && match.detail) {
        updates.detail = match.detail;
      } else {
        const desc =
          typeof s.description === 'string'
            ? { en: s.description, hi: s.description }
            : s.description || {};
        updates.detail = {
          en: `${String(desc.en || '').trim()}\n\nFor service in Khandwa, call or book online — we try for same-day visits when workload allows.`,
          hi: `${String(desc.hi || '').trim()}\n\nKhandwa me service ke liye call ya online book karein — workload ke hisaab se same-day visit ki koshish.`
        };
      }
    }

    if (Object.keys(updates).length) {
      await ServiceItem.updateOne({ _id: s._id }, { $set: updates });
    }
  }
}

async function ensureServices() {
  const n = await ServiceItem.countDocuments();
  if (n === 0) {
    await ServiceItem.insertMany(defaultServices);
  } else {
    await migrateServiceItemsShape();
    await migrateServiceSlugsAndDetails();
  }
}

async function ensureMembers() {
  const n = await TeamMember.countDocuments();
  if (n === 0) {
    await TeamMember.insertMany(defaultMembers);
  } else {
    await migrateTeamMembersShape();
  }
}

async function migrateNotificationShubhamToEleczio() {
  const rows = await SiteNotification.find().lean();
  const re = /shubham\s*electronics(?:\s*(?:&|and)\s*electricals)?/gi;
  for (const n of rows) {
    const $set = {};
    for (const key of ['title', 'body']) {
      const v = n[key];
      if (v && typeof v === 'object' && ('en' in v || 'hi' in v)) {
        const en = String(v.en || '').replace(re, 'Eleczio');
        const hi = String(v.hi || '').replace(re, 'Eleczio');
        if (en !== v.en || hi !== v.hi) {
          $set[key] = { en, hi };
        }
      }
    }
    if (Object.keys($set).length) {
      await SiteNotification.updateOne({ _id: n._id }, { $set });
    }
  }
}

async function ensureSampleNotification() {
  const n = await SiteNotification.countDocuments();
  if (n === 0) {
    await SiteNotification.create({
      title: loc('Book a visit', 'Visit book karein'),
      body: loc(
        'Contact page — describe the fault; we reply on call / WhatsApp.',
        'Contact page par complaint likhein — hum call / WhatsApp se jawab denge.'
      ),
      icon_class: 'fa-solid fa-clipboard-list',
      is_active: true,
      sort_order: 1
    });
  } else {
    await migrateNotificationsShape();
    await migrateNotificationShubhamToEleczio();
  }
}

async function ensureAdminUser() {
  const count = await User.countDocuments();
  if (count > 0) return;

  const email =
    process.env.ADMIN_EMAIL || 'admin@eleczio.local';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const name = process.env.ADMIN_NAME || 'Admin';

  const password_hash = await bcrypt.hash(password, 10);
  await User.create({
    name,
    email: email.toLowerCase(),
    password_hash,
    role: 'admin'
  });
  console.log(
    `[bootstrap] Admin created: ${email} (change ADMIN_PASSWORD in .env)`
  );
}

async function bootstrapData() {
  await ensureSiteSettings();
  await ensureServices();
  await ensureMembers();
  await ensureSampleNotification();
  await ensureAdminUser();
}

module.exports = { bootstrapData, ensureSiteSettings };
