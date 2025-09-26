const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['subscription', 'job_unlock'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'KSH'
  },
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'card', 'bank_transfer'],
    default: 'mpesa'
  },
  mpesaDetails: {
    phoneNumber: String,
    transactionId: String,
    checkoutRequestId: String,
    merchantRequestId: String,
    resultCode: String,
    resultDesc: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  reference: {
    type: String,
    unique: true,
    required: true
  },
  description: String,
  metadata: {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    subscriptionMonths: Number,
    ipAddress: String,
    userAgent: String
  },
  processedAt: Date,
  failureReason: String
}, {
  timestamps: true
});

// Generate unique reference before saving
paymentSchema.pre('save', function(next) {
  if (!this.reference) {
    this.reference = `EV-${this.type.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  next();
});

// Indexes for efficient querying
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ reference: 1 }, { unique: true });
paymentSchema.index({ 'mpesaDetails.transactionId': 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
