const mongoose = require('mongoose');

const locSchema = new mongoose.Schema(
  {
    en: { type: String, default: '' },
    hi: { type: String, default: '' }
  },
  { _id: false }
);

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: locSchema,
    phone: { type: String, required: true },
    phone_display: { type: String, default: '' },
    icon_variant: {
      type: String,
      enum: ['elec', 'eltr'],
      default: 'elec'
    },
    sort_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('TeamMember', teamMemberSchema);
