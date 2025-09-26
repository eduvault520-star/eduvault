const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  amount: {
    type: Number,
    required: true,
    default: 100 // 100 KSH
  },
  currency: {
    type: String,
    default: 'KSH'
  },
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'card', 'bank'],
    default: 'mpesa'
  },
  mpesaTransactionId: {
    type: String,
    sparse: true
  },
  mpesaReceiptNumber: {
    type: String,
    sparse: true
  },
  phoneNumber: {
    type: String,
    required: function() {
      return this.paymentMethod === 'mpesa';
    }
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'expired', 'cancelled'],
    default: 'pending'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  paymentDate: {
    type: Date
  },
  features: {
    notesDownload: {
      type: Boolean,
      default: true
    },
    premiumContent: {
      type: Boolean,
      default: true
    },
    examAccess: {
      type: Boolean,
      default: true
    }
  },
  metadata: {
    courseName: String,
    institutionName: String,
    userEmail: String,
    userName: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
subscriptionSchema.index({ userId: 1, courseId: 1, year: 1 });
subscriptionSchema.index({ expiryDate: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ mpesaTransactionId: 1 }, { sparse: true });

// Virtual for checking if subscription is currently active
subscriptionSchema.virtual('isCurrentlyActive').get(function() {
  return this.isActive && 
         this.status === 'completed' && 
         new Date() < this.expiryDate;
});

// Method to activate subscription
subscriptionSchema.methods.activate = function() {
  this.isActive = true;
  this.status = 'completed';
  this.paymentDate = new Date();
  return this.save();
};

// Method to expire subscription
subscriptionSchema.methods.expire = function() {
  this.isActive = false;
  this.status = 'expired';
  return this.save();
};

// Static method to check if user has active subscription for specific course/year
subscriptionSchema.statics.hasActiveSubscription = async function(userId, courseId, year) {
  const subscription = await this.findOne({
    userId,
    courseId,
    year,
    isActive: true,
    status: 'completed',
    expiryDate: { $gt: new Date() }
  });
  
  return !!subscription;
};

// Static method to get user's subscription for specific course/year
subscriptionSchema.statics.getUserSubscription = async function(userId, courseId, year) {
  return await this.findOne({
    userId,
    courseId,
    year,
    isActive: true,
    status: 'completed',
    expiryDate: { $gt: new Date() }
  }).populate('courseId', 'name code');
};

// Pre-save middleware to set expiry date (1 month from start)
subscriptionSchema.pre('save', function(next) {
  if (this.isNew && !this.expiryDate) {
    const startDate = this.startDate || new Date();
    this.expiryDate = new Date(startDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
  }
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
