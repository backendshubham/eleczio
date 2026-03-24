const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    key: { type: String, required: true }
  },
  { _id: false }
);

const serviceRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    problem: { type: String, required: true },
    images: { type: [imageSchema], default: [] },
    status: {
      type: String,
      enum: ['new', 'contacted', 'closed', 'declined'],
      default: 'new'
    },
    /** Admin-set visit (calendar date stored as UTC midnight) */
    visitDate: { type: Date },
    visitTime: { type: String, default: '' },
    customerMessageSentAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
