const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['lecture_video', 'past_paper', 'cat', 'notes', 'youtube_link', 'assignment'],
    required: true
  },
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  unitCode: {
    type: String,
    required: true,
    uppercase: true
  },
  unitName: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 2
  },
  file: {
    url: String,
    publicId: String, // Cloudinary public ID
    originalName: String,
    size: Number,
    mimeType: String
  },
  youtubeUrl: {
    type: String,
    validate: {
      validator: function(v) {
        if (this.type === 'youtube_link') {
          return /^https:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(v);
        }
        return true;
      },
      message: 'Invalid YouTube URL'
    }
  },
  description: String,
  tags: [String],
  isPremium: {
    type: Boolean,
    default: false
  },
  legitimacyStamp: {
    isVerified: {
      type: Boolean,
      default: false
    },
    stampId: String,
    qrCode: String,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String,
  downloadCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
resourceSchema.index({ institution: 1, course: 1, year: 1, semester: 1 });
resourceSchema.index({ type: 1, isPremium: 1 });
resourceSchema.index({ approvalStatus: 1 });
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Generate unique stamp ID before saving
resourceSchema.pre('save', function(next) {
  if (this.legitimacyStamp.isVerified && !this.legitimacyStamp.stampId) {
    this.legitimacyStamp.stampId = `EV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Resource', resourceSchema);
