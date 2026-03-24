const mongoose = require('mongoose');

const locSchema = new mongoose.Schema(
  {
    en: { type: String, default: '' },
    hi: { type: String, default: '' }
  },
  { _id: false }
);

const aboutPointSchema = new mongoose.Schema(
  {
    strong: locSchema,
    span: locSchema,
    icon: { type: String, default: 'fa-solid fa-shield-halved' }
  },
  { _id: false }
);

const whyFeatureSchema = new mongoose.Schema(
  {
    text: locSchema,
    icon: { type: String, default: 'fa-solid fa-check-circle' }
  },
  { _id: false }
);

const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },
    seoTitle: locSchema,
    brandLine1: locSchema,
    brandLine2: locSchema,
    heroBadge: locSchema,
    heroWelcomeLine: locSchema,
    heroPromoLine: locSchema,
    heroTitleLine1: locSchema,
    heroTitleHighlight: locSchema,
    heroTitleLine2: locSchema,
    heroSub: locSchema,
    statYears: { type: String, default: '25+' },
    statYearsLabel: locSchema,
    statVisitCharge: { type: String, default: '₹200' },
    statVisitLabel: locSchema,
    statCustomers: { type: String, default: '500+' },
    statCustomersLabel: locSchema,
    visitBannerMain: locSchema,
    visitBannerSub: locSchema,
    addressShort: locSchema,
    aboutTag: locSchema,
    aboutTitle: locSchema,
    aboutTitleHighlight: locSchema,
    aboutBody: locSchema,
    aboutElecTitle: locSchema,
    aboutElecSub: locSchema,
    aboutEltrTitle: locSchema,
    aboutEltrSub: locSchema,
    aboutHomeTitle: locSchema,
    aboutHomeSub: locSchema,
    aboutPoints: { type: [aboutPointSchema], default: [] },
    servicesSectionTag: locSchema,
    servicesTitle: locSchema,
    servicesTitleHighlight: locSchema,
    servicesTitleSuffix: locSchema,
    servicesSub: locSchema,
    whyTitle: locSchema,
    whySub: locSchema,
    whyFeatures: { type: [whyFeatureSchema], default: [] },
    complaintTag: locSchema,
    complaintTitle: locSchema,
    complaintTitleHighlight: locSchema,
    complaintSub: locSchema,
    formNote: locSchema,
    whatsappE164: { type: String, default: '919826099647' },
    primaryTel: { type: String, default: '9826099647' },
    secondaryTel: { type: String, default: '9827091651' },
    footerBrandSuffix: locSchema,
    footerBlurb: locSchema,
    footerAddress: locSchema,
    copyrightYear: { type: String, default: '2025' },
    footerHeartText: locSchema
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
