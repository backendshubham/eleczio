const mongoose = require('mongoose');
const { slugify, uniqueServiceSlug } = require('../utils/slugify');
const SiteSettings = require('../models/SiteSettings');
const ServiceItem = require('../models/ServiceItem');
const TeamMember = require('../models/TeamMember');
const SiteNotification = require('../models/SiteNotification');
const ServiceRequest = require('../models/ServiceRequest');
const {
  buildCustomerVisitWhatsAppText,
  visitDateToYmd
} = require('../utils/customerVisitMessage');

const SETTING_LOC_KEYS = [
  'seoTitle',
  'brandLine1',
  'brandLine2',
  'heroBadge',
  'heroWelcomeLine',
  'heroPromoLine',
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

function pickLoc(body, key) {
  return {
    en: (body[`${key}_en`] || '').trim(),
    hi: (body[`${key}_hi`] || '').trim()
  };
}

function buildAboutPoints(body) {
  const out = [];
  for (let i = 0; i < 8; i++) {
    const strong = pickLoc(body, `ap_s_${i}`);
    const span = pickLoc(body, `ap_t_${i}`);
    const icon = (body[`ap_i_${i}`] || '').trim() || 'fa-solid fa-circle-check';
    if (strong.en || strong.hi || span.en || span.hi) {
      out.push({ strong, span, icon });
    }
  }
  return out;
}

function buildWhyFeatures(body) {
  const out = [];
  for (let i = 0; i < 8; i++) {
    const text = pickLoc(body, `why_${i}`);
    if (text.en || text.hi) {
      out.push({ text, icon: 'fa-solid fa-check-circle' });
    }
  }
  return out;
}

exports.dashboard = async (req, res) => {
  const newRequests = await ServiceRequest.countDocuments({ status: 'new' });
  const totalRequests = await ServiceRequest.countDocuments();
  const servicesCount = await ServiceItem.countDocuments({ is_active: true });
  const notificationsCount = await SiteNotification.countDocuments({
    is_active: true
  });

  res.render('admin/dashboard', {
    layout: 'layouts/admin',
    title: 'Dashboard',
    stats: {
      newRequests,
      totalRequests,
      servicesCount,
      notificationsCount
    }
  });
};

exports.getSettings = async (req, res) => {
  let settings = await SiteSettings.findOne({ key: 'main' }).lean();
  if (!settings) {
    const { ensureSiteSettings } = require('../services/bootstrap');
    await ensureSiteSettings();
    settings = await SiteSettings.findOne({ key: 'main' }).lean();
  }
  res.render('admin/settings', {
    layout: 'layouts/admin',
    title: 'Site Settings',
    settings,
    settingFieldLabels: {
      seoTitle: 'Browser tab title',
      brandLine1: 'Brand line 1',
      brandLine2: 'Brand line 2 (navbar)',
      heroBadge: 'Hero badge',
      heroWelcomeLine: 'Home hero — Welcome line',
      heroPromoLine: 'Home hero — ₹200 / Khandwa promo (main line)',
      heroTitleLine1: 'Hero title line 1',
      heroTitleHighlight: 'Hero title highlight',
      heroTitleLine2: 'Hero title line 2',
      heroSub: 'Hero subtitle',
      statYearsLabel: 'Stat: years label',
      statVisitLabel: 'Stat: visit charge label',
      statCustomersLabel: 'Stat: customers label',
      visitBannerMain: 'About box: charge main',
      visitBannerSub: 'About box: charge sub',
      addressShort: 'Short address (about visual)',
      aboutTag: 'About section tag',
      aboutTitle: 'About title (before highlight)',
      aboutTitleHighlight: 'About title highlight',
      aboutBody: 'About body',
      aboutElecTitle: 'About card — Electrical line 1',
      aboutElecSub: 'About card — Electrical line 2',
      aboutEltrTitle: 'About card — Electronics line 1',
      aboutEltrSub: 'About card — Electronics line 2',
      aboutHomeTitle: 'About card — Home line 1',
      aboutHomeSub: 'About card — Home line 2',
      servicesSectionTag: 'Services section tag',
      servicesTitle: 'Services title (before highlight)',
      servicesTitleHighlight: 'Services title highlight',
      servicesTitleSuffix: 'Services title (after highlight)',
      servicesSub: 'Services subtitle',
      whyTitle: 'Why us title',
      whySub: 'Why us subtitle',
      complaintTag: 'Complaint section tag',
      complaintTitle: 'Complaint title (before highlight)',
      complaintTitleHighlight: 'Complaint title highlight',
      complaintSub: 'Complaint subtitle',
      formNote: 'Form note under submit',
      footerBrandSuffix: 'Footer brand suffix',
      footerBlurb: 'Footer blurb',
      footerAddress: 'Footer address',
      footerHeartText: 'Footer bottom line'
    },
    saved: req.query.saved === '1',
    settingLocKeys: SETTING_LOC_KEYS
  });
};

exports.postSettings = async (req, res) => {
  const b = req.body;
  const $set = {};
  for (const key of SETTING_LOC_KEYS) {
    $set[key] = pickLoc(b, key);
  }
  $set.aboutPoints = buildAboutPoints(b);
  $set.whyFeatures = buildWhyFeatures(b);
  $set.statYears = (b.statYears || '').trim();
  $set.statVisitCharge = (b.statVisitCharge || '').trim();
  $set.statCustomers = (b.statCustomers || '').trim();
  $set.whatsappE164 =
    String(b.whatsappE164 || '919826099647').replace(/\D/g, '') ||
    '919826099647';
  $set.primaryTel = (b.primaryTel || '').trim();
  $set.secondaryTel = (b.secondaryTel || '').trim();
  $set.copyrightYear = (b.copyrightYear || '').trim();

  await SiteSettings.findOneAndUpdate(
    { key: 'main' },
    { $set },
    { upsert: true, new: true }
  );
  res.redirect('/admin/settings?saved=1');
};

exports.getServices = async (req, res) => {
  const services = await ServiceItem.find().sort({ sort_order: 1 }).lean();
  res.render('admin/services', {
    layout: 'layouts/admin',
    title: 'Services',
    services
  });
};

exports.postServiceCreate = async (req, res) => {
  const { iconClass, sort_order } = req.body;
  const title = pickLoc(req.body, 'title');
  let slug = String(req.body.slug || '').trim().toLowerCase();
  if (!slug) slug = slugify(title.en || title.hi || 'service');
  slug = await uniqueServiceSlug(ServiceItem, slug, null);
  const detail = pickLoc(req.body, 'detail');
  if (!detail.en && !detail.hi) {
    detail.en = pickLoc(req.body, 'description').en;
    detail.hi = pickLoc(req.body, 'description').hi;
  }
  await ServiceItem.create({
    slug,
    title,
    description: pickLoc(req.body, 'description'),
    detail,
    iconClass: (iconClass || 'fa-solid fa-plug-circle-bolt').trim(),
    sort_order: Number(sort_order) || 0,
    is_active: true
  });
  res.redirect('/admin/services');
};

exports.getServiceEdit = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.redirect('/admin/services');
  const service = await ServiceItem.findById(id).lean();
  if (!service) return res.redirect('/admin/services');
  res.render('admin/service-edit', {
    layout: 'layouts/admin',
    title: 'Edit Service',
    service
  });
};

exports.postServiceUpdate = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.redirect('/admin/services');
  const { iconClass, sort_order, is_active } = req.body;
  let slug = String(req.body.slug || '').trim().toLowerCase();
  const title = pickLoc(req.body, 'title');
  if (!slug) slug = slugify(title.en || title.hi || 'service');
  slug = await uniqueServiceSlug(ServiceItem, slug, id);
  await ServiceItem.findByIdAndUpdate(id, {
    slug,
    title,
    description: pickLoc(req.body, 'description'),
    detail: pickLoc(req.body, 'detail'),
    iconClass: (iconClass || '').trim(),
    sort_order: Number(sort_order) || 0,
    is_active: is_active === 'on'
  });
  res.redirect('/admin/services');
};

exports.postServiceDelete = async (req, res) => {
  const { id } = req.params;
  if (mongoose.isValidObjectId(id)) {
    await ServiceItem.findByIdAndDelete(id);
  }
  res.redirect('/admin/services');
};

exports.getMembers = async (req, res) => {
  const members = await TeamMember.find().sort({ sort_order: 1 }).lean();
  res.render('admin/members', {
    layout: 'layouts/admin',
    title: 'Team / Contacts',
    members
  });
};

exports.postMemberCreate = async (req, res) => {
  const { name, phone, phone_display, icon_variant, sort_order } = req.body;
  await TeamMember.create({
    name: (name || '').trim(),
    role: pickLoc(req.body, 'role'),
    phone: (phone || '').replace(/\D/g, ''),
    phone_display: (phone_display || '').trim(),
    icon_variant: icon_variant === 'eltr' ? 'eltr' : 'elec',
    sort_order: Number(sort_order) || 0,
    is_active: true
  });
  res.redirect('/admin/members');
};

exports.getMemberEdit = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.redirect('/admin/members');
  const member = await TeamMember.findById(id).lean();
  if (!member) return res.redirect('/admin/members');
  res.render('admin/member-edit', {
    layout: 'layouts/admin',
    title: 'Edit Member',
    member
  });
};

exports.postMemberUpdate = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.redirect('/admin/members');
  const { name, phone, phone_display, icon_variant, sort_order, is_active } =
    req.body;
  await TeamMember.findByIdAndUpdate(id, {
    name: (name || '').trim(),
    role: pickLoc(req.body, 'role'),
    phone: (phone || '').replace(/\D/g, ''),
    phone_display: (phone_display || '').trim(),
    icon_variant: icon_variant === 'eltr' ? 'eltr' : 'elec',
    sort_order: Number(sort_order) || 0,
    is_active: is_active === 'on'
  });
  res.redirect('/admin/members');
};

exports.postMemberDelete = async (req, res) => {
  const { id } = req.params;
  if (mongoose.isValidObjectId(id)) {
    await TeamMember.findByIdAndDelete(id);
  }
  res.redirect('/admin/members');
};

exports.getNotifications = async (req, res) => {
  const notifications = await SiteNotification.find()
    .sort({ sort_order: 1 })
    .lean();
  res.render('admin/notifications', {
    layout: 'layouts/admin',
    title: 'Notifications',
    notifications
  });
};

exports.postNotificationCreate = async (req, res) => {
  const { icon_class, link_url, sort_order } = req.body;
  await SiteNotification.create({
    title: pickLoc(req.body, 'title'),
    body: pickLoc(req.body, 'body'),
    icon_class: (icon_class || 'fa-solid fa-bullhorn').trim(),
    link_url: (link_url || '').trim(),
    sort_order: Number(sort_order) || 0,
    is_active: true
  });
  res.redirect('/admin/notifications');
};

exports.getNotificationEdit = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.redirect('/admin/notifications');
  const notification = await SiteNotification.findById(id).lean();
  if (!notification) return res.redirect('/admin/notifications');
  res.render('admin/notification-edit', {
    layout: 'layouts/admin',
    title: 'Edit Notification',
    notification
  });
};

exports.postNotificationUpdate = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.redirect('/admin/notifications');
  const { icon_class, link_url, sort_order, is_active } = req.body;
  await SiteNotification.findByIdAndUpdate(id, {
    title: pickLoc(req.body, 'title'),
    body: pickLoc(req.body, 'body'),
    icon_class: (icon_class || '').trim(),
    link_url: (link_url || '').trim(),
    sort_order: Number(sort_order) || 0,
    is_active: is_active === 'on'
  });
  res.redirect('/admin/notifications');
};

exports.postNotificationDelete = async (req, res) => {
  const { id } = req.params;
  if (mongoose.isValidObjectId(id)) {
    await SiteNotification.findByIdAndDelete(id);
  }
  res.redirect('/admin/notifications');
};

const REQUEST_STATUS_VALUES = ['new', 'contacted', 'closed', 'declined'];
const REQUESTS_PER_PAGE = 15;

function requestStatusLabel(code) {
  const m = {
    new: 'Nayi request',
    contacted: 'Connected',
    closed: 'Closed',
    declined: 'Declined'
  };
  return m[code] || code;
}

exports.getRequests = async (req, res) => {
  const q = req.query.status;
  const raw =
    q === undefined || q === null || String(q).trim() === ''
      ? 'new'
      : String(q).toLowerCase().trim();
  const statusFilter =
    raw === 'all'
      ? 'all'
      : REQUEST_STATUS_VALUES.includes(raw)
        ? raw
        : 'new';
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const filter = statusFilter === 'all' ? {} : { status: statusFilter };

  const total = await ServiceRequest.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / REQUESTS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const skip = (safePage - 1) * REQUESTS_PER_PAGE;

  const requests = await ServiceRequest.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(REQUESTS_PER_PAGE)
    .lean();

  res.render('admin/requests', {
    layout: 'layouts/admin',
    title: 'Service Requests',
    requests,
    visitDateToYmd,
    requestStatusLabel,
    statusFilter,
    currentPage: safePage,
    totalPages,
    total,
    perPage: REQUESTS_PER_PAGE
  });
};

exports.getRequestDetail = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.redirect('/admin/requests');
  const request = await ServiceRequest.findById(id).lean();
  if (!request) return res.redirect('/admin/requests');

  const visitYmd = visitDateToYmd(request.visitDate);
  let previewMessage = '';
  let customerWhatsAppUrl = '';
  if (visitYmd && String(request.visitTime || '').trim()) {
    previewMessage = buildCustomerVisitWhatsAppText({
      customerName: request.name,
      visitYmd,
      visitTime: request.visitTime,
      brandLine: 'Eleczio'
    });
    const mob = String(request.phone).replace(/\D/g, '').slice(-10);
    if (mob.length === 10) {
      customerWhatsAppUrl = `https://wa.me/91${mob}?text=${encodeURIComponent(previewMessage)}`;
    }
  }

  res.render('admin/request-detail', {
    layout: 'layouts/admin',
    title: 'Request detail',
    request,
    visitYmd,
    previewMessage,
    customerWhatsAppUrl,
    saved: req.query.saved === '1',
    sentFlag: req.query.sent === '1',
    requestStatusLabel
  });
};

exports.postRequestSchedule = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.redirect('/admin/requests');
  const visit_date = String(req.body.visit_date || '').trim();
  const visit_time = String(req.body.visit_time || '').trim();
  if (visit_date && /^\d{4}-\d{2}-\d{2}$/.test(visit_date)) {
    const [y, m, d] = visit_date.split('-').map(Number);
    await ServiceRequest.findByIdAndUpdate(id, {
      visitDate: new Date(Date.UTC(y, m - 1, d)),
      visitTime: visit_time
    });
  } else {
    await ServiceRequest.findByIdAndUpdate(id, {
      $unset: { visitDate: '', visitTime: '' }
    });
  }
  res.redirect(`/admin/requests/${id}?saved=1`);
};

exports.postRequestMarkSent = async (req, res) => {
  const { id } = req.params;
  if (mongoose.isValidObjectId(id)) {
    await ServiceRequest.findByIdAndUpdate(id, {
      customerMessageSentAt: new Date(),
      status: 'contacted' // Connected (label)
    });
  }
  res.redirect(`/admin/requests/${id}?sent=1`);
};

exports.postRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (
    mongoose.isValidObjectId(id) &&
    REQUEST_STATUS_VALUES.includes(status)
  ) {
    await ServiceRequest.findByIdAndUpdate(id, { status });
  }
  if (req.query.next === 'detail') {
    return res.redirect(`/admin/requests/${id}`);
  }
  let sq = String(req.query.status || 'all');
  if (sq !== 'all' && !REQUEST_STATUS_VALUES.includes(sq)) sq = 'all';
  const pg = Math.max(1, parseInt(req.query.page, 10) || 1);
  return res.redirect(
    `/admin/requests?status=${encodeURIComponent(sq)}&page=${encodeURIComponent(String(pg))}`
  );
};
