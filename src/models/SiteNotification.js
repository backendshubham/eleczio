const mongoose = require('mongoose');

const locSchema = new mongoose.Schema(
  {
    en: { type: String, default: '' },
    hi: { type: String, default: '' }
  },
  { _id: false }
);

const siteNotificationSchema = new mongoose.Schema(
  {
    title: locSchema,
    body: locSchema,
    icon_class: { type: String, default: 'fa-solid fa-bullhorn' },
    link_url: { type: String, default: '' },
    is_active: { type: Boolean, default: true },
    sort_order: { type: Number, default: 0 }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('SiteNotification', siteNotificationSchema);
