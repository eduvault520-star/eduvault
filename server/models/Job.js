const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    logo: {
      url: String,
      publicId: String
    },
    website: String,
    location: {
      county: String,
      town: String,
      isRemote: {
        type: Boolean,
        default: false
      }
    }
  },
  description: {
    type: String,
    required: true
  },
  requirements: [String],
  responsibilities: [String],
  benefits: [String],
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'KSH'
    },
    period: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'],
      default: 'monthly'
    }
  },
  employmentType: {
    type: String,
    enum: ['full_time', 'part_time', 'contract', 'internship', 'volunteer'],
    required: true
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'junior', 'mid', 'senior', 'executive'],
    required: true
  },
  relatedCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  skills: [String],
  applicationDeadline: {
    type: Date,
    required: true
  },
  applicationMethod: {
    email: String,
    website: String,
    phone: String,
    instructions: String
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: true // Jobs require payment to unlock full details
  },
  unlockPrice: {
    type: Number,
    default: 200 // 200 KSH
  },
  viewCount: {
    type: Number,
    default: 0
  },
  unlockCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
jobSchema.index({ relatedCourses: 1 });
jobSchema.index({ employmentType: 1, experienceLevel: 1 });
jobSchema.index({ applicationDeadline: 1 });
jobSchema.index({ isActive: 1, isPremium: 1 });
jobSchema.index({ title: 'text', 'company.name': 'text', description: 'text', skills: 'text' });

module.exports = mongoose.model('Job', jobSchema);
