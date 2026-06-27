const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billNumber: {
    type: String,
    unique: true,
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  service: {
    type: String,
    enum: ['ERP_ON_CLOUD', 'RMS', 'FAIRWOOD'],
    required: true,
  },
  specifications: [{
    key: String,
    value: String,
  }],
  billingDate: {
    type: Date,
    required: true,
  },
  renewalDate: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'rejected'],
    default: 'draft',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: {
    type: Date,
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  rejectedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
  emailSentAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Bill', billSchema);
