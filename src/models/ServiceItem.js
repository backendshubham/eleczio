const mongoose = require('mongoose');

const locSchema = new mongoose.Schema(
  {
    en: { type: String, default: '' },
    hi: { type: String, default: '' }
  },
  { _id: false }
);

const serviceItemSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: locSchema,
    description: locSchema,
    detail: locSchema,
    iconClass: { type: String, default: 'fa-solid fa-plug-circle-bolt' },
    sort_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('ServiceItem', serviceItemSchema);
