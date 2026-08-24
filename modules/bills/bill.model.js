const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      unique: true,
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: String,
      enum: ["ERP_ON_CLOUD", "RMS", "FAIRWOOD"],
      required: true,
    },
    specifications: [
      {
        key: String,
        value: String,
      },
    ],
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
      enum: ["draft", "pending_approval", "approved", "correction"],
      default: "draft",
    },
    reminderSent: {
      type: [String], // Array to track which reminders were sent
      default: []
    },
    renewalAlertsStopped: {
      type: Boolean,
      default: false
    },
    renewalAlertsStoppedAt: {
      type: Date
    },
    clientRenewed: {
      type: Boolean,
      default: false
    },
    clientRenewedAt: {
      type: Date
    },
    renewed: {
      type: Boolean,
      default: false
    },
    renewedAt: {
      type: Date
    },
    parentBill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill"
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    correctionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    correctionAt: {
      type: Date,
    },
    correctionReason: {
      type: String,
    },
    emailSentAt: {
      type: Date,
    },
    proformaSentAt: {
      type: Date,
    },

    proformaSentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    tallyStatus: {
      type: String,
      enum: ["not_pushed", "pending", "pushed", "failed"],
      default: "not_pushed",
    },
    tallyPushedAt: Date,
    tallyConfirmedAt: { type: Date },
    tallyError: { type: String },
    tallyVoucherId: { type: String },
  },
  {
    timestamps: true,
  },
);

billSchema.index({
  renewalDate: 1,
  status: 1,
  createdBy: 1,
});

module.exports = mongoose.model("Bill", billSchema);
