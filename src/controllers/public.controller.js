const { pick } = require('../utils/i18n');
const SiteSettings = require('../models/SiteSettings');
const ServiceItem = require('../models/ServiceItem');
const TeamMember = require('../models/TeamMember');
const SiteNotification = require('../models/SiteNotification');
const ServiceRequest = require('../models/ServiceRequest');
const {
  isS3Configured,
  uploadComplaintImage
} = require('../services/s3Upload');
const { buildSeoForPage } = require('../config/seo');

function withSeo(ctx, { path, pageTitle, pageKey, service }) {
  return {
    ...ctx,
    seo: buildSeoForPage({
      settings: ctx.settings,
      lang: ctx.lang,
      path,
      pageTitle,
      pageKey,
      service
    })
  };
}

function siteLang(req) {
  const lang = req.cookies?.site_lang;
  return lang === 'hi' ? 'hi' : 'en';
}

/** Orange ticker: welcome + promo from settings, DB notifications (deduped), static extras */
function buildTickerSegments(settings, notifications, lang) {
  const T = (loc) => (loc ? pick(loc, lang) : '').trim();
  const out = [];

  const welcomeLine = settings?.heroWelcomeLine ? T(settings.heroWelcomeLine) : '';
  const promoLine = settings?.heroPromoLine ? T(settings.heroPromoLine) : '';
  if (welcomeLine) {
    out.push({ icon: 'fa-solid fa-star', text: welcomeLine });
  }
  if (promoLine) {
    out.push({ icon: 'fa-solid fa-indian-rupee-sign', text: promoLine });
  }

  for (const n of notifications) {
    const title = n.title ? T(n.title) : '';
    const body = n.body ? T(n.body) : '';
    if (welcomeLine && title === welcomeLine) continue;
    const line = body ? `${title} — ${body}` : title;
    if (!line) continue;
    out.push({
      icon: (n.icon_class || 'fa-solid fa-bullhorn').trim(),
      text: line,
      link: (n.link_url || '').trim()
    });
  }

  const extras =
    lang === 'en'
      ? [
          { icon: 'fa-solid fa-shield-halved', text: '25+ years experience · trusted in Khandwa' },
          { icon: 'fa-solid fa-truck-fast', text: 'Doorstep electrical & electronics repair' },
          { icon: 'fa-solid fa-clock', text: 'Same-day response when possible' },
          { icon: 'fa-solid fa-phone-volume', text: 'Call now for urgent faults & safety checks' }
        ]
      : [
          { icon: 'fa-solid fa-shield-halved', text: '25+ saal experience · Khandwa me bharosa' },
          { icon: 'fa-solid fa-truck-fast', text: 'Ghar tak electrical & electronics repair' },
          { icon: 'fa-solid fa-clock', text: 'Jaldi response — same day jahan ho sake' },
          { icon: 'fa-solid fa-phone-volume', text: 'Urgent fault / safety ke liye turant call' }
        ];
  extras.forEach((e) => out.push(e));

  return out;
}

async function loadPublicContext(req, res) {
  let settings = await SiteSettings.findOne({ key: 'main' }).lean();
  if (!settings) {
    const { ensureSiteSettings } = require('../services/bootstrap');
    await ensureSiteSettings();
    settings = await SiteSettings.findOne({ key: 'main' }).lean();
  }
  const services = await ServiceItem.find({ is_active: true })
    .sort({ sort_order: 1 })
    .lean();
  const members = await TeamMember.find({ is_active: true })
    .sort({ sort_order: 1 })
    .lean();
  const notifications = await SiteNotification.find({ is_active: true })
    .sort({ sort_order: 1 })
    .lean();

  const lang = siteLang(req);
  const title = pick(settings?.seoTitle, lang) || 'Eleczio';
  const tickerSegments = buildTickerSegments(settings, notifications, lang);
  const showTicker = tickerSegments.length > 0;

  return {
    settings: settings || {},
    services,
    members,
    notifications,
    tickerSegments,
    showTicker,
    lang,
    title,
    uiJson: JSON.stringify(res.locals.ui).replace(/</g, '\\u003c')
  };
}

exports.getHome = async (req, res) => {
  const ctx = await loadPublicContext(req, res);
  const pageTitle = ctx.title;
  const merged = withSeo(ctx, {
    path: '/',
    pageTitle,
    pageKey: 'home'
  });
  res.render('shubham/home', {
    layout: 'layouts/shubham-site',
    pageTitle,
    activePage: 'home',
    includeContactForm: false,
    ...merged
  });
};

exports.getAbout = async (req, res) => {
  const ctx = await loadPublicContext(req, res);
  const lang = ctx.lang;
  const pageTitle =
    lang === 'en'
      ? 'About us — Eleczio'
      : 'Hamare baare mein — Eleczio';
  res.render('shubham/about', {
    layout: 'layouts/shubham-site',
    pageTitle,
    activePage: 'about',
    includeContactForm: false,
    ...ctx
  });
};

exports.getServicesPage = async (req, res) => {
  const ctx = await loadPublicContext(req, res);
  const lang = ctx.lang;
  const pageTitle =
    lang === 'en' ? 'Our services — Eleczio' : 'Hamari services — Eleczio';
  const merged = withSeo(ctx, {
    path: '/services',
    pageTitle,
    pageKey: 'services'
  });
  res.render('shubham/services-list', {
    layout: 'layouts/shubham-site',
    pageTitle,
    activePage: 'services',
    includeContactForm: false,
    ...merged
  });
};

exports.getServiceBySlug = async (req, res) => {
  const ctx = await loadPublicContext(req, res);
  const slug = String(req.params.slug || '').trim().toLowerCase();
  if (!slug || slug === 'services') {
    return res.status(404).render('errors/404', {
      layout: false,
      title: 'Page Not Found'
    });
  }
  const service = await ServiceItem.findOne({ slug, is_active: true }).lean();
  if (!service) {
    return res.status(404).render('errors/404', {
      layout: false,
      title: 'Page Not Found'
    });
  }
  const lang = ctx.lang;
  const name = pick(service.title, lang);
  const pageTitle =
    lang === 'en'
      ? `${name} — Eleczio`
      : `${name} — Eleczio`;
  const merged = withSeo(ctx, {
    path: `/services/${slug}`,
    pageTitle,
    pageKey: 'service',
    service
  });
  res.render('shubham/service-detail', {
    layout: 'layouts/shubham-site',
    pageTitle,
    activePage: 'service-detail',
    includeContactForm: false,
    service,
    ...merged
  });
};

exports.getContact = async (req, res) => {
  const ctx = await loadPublicContext(req, res);
  const lang = ctx.lang;
  const pageTitle =
    lang === 'en' ? 'Contact & book service — Eleczio' : 'Contact / service book — Eleczio';
  const merged = withSeo(ctx, {
    path: '/contact',
    pageTitle,
    pageKey: 'contact'
  });
  res.render('shubham/contact', {
    layout: 'layouts/shubham-site',
    pageTitle,
    activePage: 'contact',
    includeContactForm: true,
    ...merged
  });
};

exports.postServiceRequest = async (req, res) => {
  const lang = siteLang(req);
  try {
    const { name, phone, address, problem } = req.body;
    const n = (name || '').trim();
    const p = (phone || '').trim().replace(/\D/g, '');
    const a = (address || '').trim();
    const pr = (problem || '').trim();

    if (!n || !p || !a || !pr) {
      const err =
        lang === 'en'
          ? 'Please fill all fields.'
          : 'Sabhi fields zaroori hain.';
      return res.status(400).json({ ok: false, error: err });
    }
    if (p.length !== 10) {
      const err =
        lang === 'en'
          ? 'Enter a valid 10-digit mobile number.'
          : '10-digit mobile number zaroori hai.';
      return res.status(400).json({ ok: false, error: err });
    }

    let files = Array.isArray(req.files) ? req.files : [];
    const warnings = [];
    if (files.length > 3) {
      const err =
        lang === 'en'
          ? 'Maximum 3 photos allowed.'
          : 'Maximum 3 photos.';
      return res.status(400).json({ ok: false, error: err });
    }
    if (files.length && !isS3Configured()) {
      warnings.push(
        lang === 'en'
          ? 'Photos were not uploaded — add AWS keys and BUG_IMAGES_BUCKET (or AWS_S3_BUCKET) in .env, then restart the server.'
          : 'Photos upload nahi hui — .env me AWS keys aur BUG_IMAGES_BUCKET (ya AWS_S3_BUCKET) add karke server restart karein.'
      );
      files = [];
    }

    const images = [];
    for (const file of files) {
      try {
        const up = await uploadComplaintImage(file.buffer, file.mimetype);
        images.push(up);
      } catch (e) {
        console.error('[service-request] S3 upload failed:', e.message);
        const err =
          lang === 'en'
            ? 'Could not upload photos. Try again or submit without photos.'
            : 'Photos upload nahi ho paaye. Dubara try karein ya bina photo bhejein.';
        return res.status(500).json({ ok: false, error: err });
      }
    }

    await ServiceRequest.create({
      name: n,
      phone: p,
      address: a,
      problem: pr,
      images,
      status: 'new'
    });

    return res.json({ ok: true, warnings });
  } catch (e) {
    const err =
      lang === 'en' ? 'Server error. Try again.' : 'Server error — dubara try karein.';
    return res.status(500).json({ ok: false, error: err });
  }
};
