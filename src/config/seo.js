/**
 * Site-wide SEO: keywords, descriptions, canonical, JSON-LD.
 * Set PUBLIC_SITE_URL (or SITE_URL) in .env — default is https://eleczio.shop.
 * Local dev: PUBLIC_SITE_URL=http://localhost:3000
 */
const { pick } = require('../utils/i18n');

const DEFAULT_PUBLIC_SITE = 'https://eleczio.shop';

function normalizeBase(url) {
  const s = String(url || '').trim();
  if (!s) return DEFAULT_PUBLIC_SITE;
  return s.replace(/\/$/, '');
}

function getBaseUrl() {
  return normalizeBase(
    process.env.PUBLIC_SITE_URL || process.env.SITE_URL || ''
  );
}

/** High-intent & local phrases (Hinglish + English) */
const KEYWORDS_GLOBAL = [
  'Eleczio',
  'Eleczio Khandwa',
  'Khandwa electronic services',
  'Khandwa electronics repair',
  'electrical services Khandwa',
  'electrician Khandwa',
  'Khandwa repairing center',
  'repairing center Khandwa',
  'home electrical repair Khandwa',
  'wiring installation Khandwa',
  'MCB fuse switchboard Khandwa',
  'TV repair Khandwa',
  'AC repair Khandwa',
  'fridge repair Khandwa',
  'fan cooler repair Khandwa',
  'Rajkumar Tiwari Khandwa',
  'Antim Tiwari Khandwa',
  'Lal Chowki Khandwa',
  'Gayatri Colony Khandwa',
  'doorstep electrical service',
  '₹200 visit charge Khandwa',
  'same day electrician Khandwa',
  'electronics service center Khandwa'
].join(', ');

function clip(s, max) {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function pageDescriptions(settings, lang) {
  const addr = pick(settings?.addressShort, lang) || 'Khandwa';
  const visit = settings?.statVisitCharge || '₹200';
  return {
    home: {
      en: `Eleczio — electrical & electronics repair in ${addr}. Doorstep service, ${visit} visit charge. Trusted Khandwa team: wiring, MCB, TV, AC, fridge & more.`,
      hi: `Eleczio — ${addr} me electrical aur electronics repair. Ghar tak service, ${visit} visit charge. Wiring, MCB, TV, AC, fridge — Khandwa me bharosa.`
    },
    about: {
      en: `About Eleczio — experienced electrical & electronics technicians in Khandwa. Fair pricing, quality work, Lal Chowki & Gayatri Colony area.`,
      hi: `Eleczio ke baare mein — Khandwa ke experienced electrical & electronics technicians. Sahi daam, quality kaam.`
    },
    services: {
      en: `All Eleczio services in Khandwa — home electrical, wiring, fans, TV, AC, fridge, pumps & more. Book a visit online.`,
      hi: `Eleczio ki saari services Khandwa me — ghar ki wiring, fan, TV, AC, fridge, pump. Online visit book karein.`
    },
    contact: {
      en: `Contact Eleczio Khandwa — book service, call or complaint form. Fast response for electrical & electronics repair.`,
      hi: `Eleczio Khandwa contact — service book, call ya complaint form. Electrical & electronics repair ke liye jaldi jawab.`
    }
  };
}

function buildJsonLd({ base, settings, lang, path, pageTitle, service }) {
  const tel = settings?.primaryTel || '9826099647';
  const telE164 = `+91${String(tel).replace(/\D/g, '').slice(-10)}`;
  const street =
    pick(settings?.footerAddress, lang) ||
    pick(settings?.addressShort, lang) ||
    'Lal Chowki, Gayatri Colony, Khandwa';

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${base}/#business`,
    name: 'Eleczio',
    alternateName: ['Eleczio Electrical & Electronics', 'Eleczio Khandwa'],
    description: clip(
      pick(settings?.footerBlurb, lang) ||
        pageDescriptions(settings, lang).home[lang],
      300
    ),
    url: base,
    telephone: telE164,
    priceRange: '₹₹',
    image: [`${base}/images/og-default.png`, `${base}/apple-touch-icon.png`],
    address: {
      '@type': 'PostalAddress',
      streetAddress: street,
      addressLocality: 'Khandwa',
      addressRegion: 'Madhya Pradesh',
      postalCode: '450001',
      addressCountry: 'IN'
    },
    areaServed: [
      { '@type': 'City', name: 'Khandwa' },
      { '@type': 'AdministrativeArea', name: 'Madhya Pradesh' }
    ],
    knowsAbout: [
      'Electrical repair',
      'Electronics repair',
      'Home wiring',
      'Khandwa'
    ]
  };

  const graph = [localBusiness];

  if (service && service.slug) {
    const svcName = pick(service.title, lang);
    graph.push({
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${base}/services/${service.slug}#service`,
      name: svcName,
      description: clip(pick(service.description, lang), 200),
      provider: { '@id': `${base}/#business` },
      areaServed: { '@type': 'City', name: 'Khandwa' },
      url: `${base}/services/${service.slug}`
    });
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

/**
 * @param {object} opts
 * @param {object} opts.settings - SiteSettings lean doc
 * @param {'en'|'hi'} opts.lang
 * @param {string} opts.path - pathname e.g. /, /about, /services/foo
 * @param {string} opts.pageTitle - <title> text
 * @param {'home'|'about'|'services'|'contact'|'service'} opts.pageKey
 * @param {object} [opts.service] - service doc for detail page
 */
function buildSeoForPage({ settings, lang, path, pageTitle, pageKey, service }) {
  const base = getBaseUrl();
  const pathNorm = path.startsWith('/') ? path : `/${path}`;
  const canonicalUrl = `${base}${pathNorm}`;

  const descMap = pageDescriptions(settings || {}, lang);
  let metaDescription;

  if (pageKey === 'service' && service) {
    const title = pick(service.title, lang);
    const body = pick(service.description, lang);
    metaDescription = clip(
      `${title} in Khandwa — ${body} Book Eleczio for doorstep repair.`,
      160
    );
  } else {
    metaDescription = (descMap[pageKey] && descMap[pageKey][lang]) || descMap.home[lang];
  }

  metaDescription = clip(metaDescription, 165);

  const jsonLdString = buildJsonLd({
    base,
    settings: settings || {},
    lang,
    path: pathNorm,
    pageTitle,
    service: pageKey === 'service' ? service : null
  });

  const ogImageUrl = `${base}/images/og-default.png`;

  return {
    metaTitle: pageTitle,
    metaDescription,
    metaKeywords: KEYWORDS_GLOBAL,
    canonicalUrl,
    ogType: pageKey === 'service' ? 'article' : 'website',
    ogImageUrl,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    jsonLdString,
    baseUrl: base
  };
}

module.exports = {
  getBaseUrl,
  KEYWORDS_GLOBAL,
  buildSeoForPage
};
