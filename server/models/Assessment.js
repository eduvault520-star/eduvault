const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['cat', 'exam'],
    required: true
  },
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  unitName: {
    type: String,
    required: true,
    trim: true
  },
  unitCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    trim: true
  },
  instructions: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date,
    required: true,
    index: true
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 1,
    max: 1000
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
    min: 5,
    max: 480 // Max 8 hours
  },
  // Image file information
  imageFile: {
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    }
  },
  // Security settings
  maxViews: {
    type: Number,
    default: function() {
      return this.type === 'cat' ? 3 : 1; // CATs can be viewed 3 times, Exams only once
    }
  },
  // Status and metadata
  status: {
    type: String,
    enum: ['active', 'scheduled', 'completed', 'expired', 'draft'],
    default: function() {
      return this.type === 'cat' ? 'active' : 'scheduled';
    },
    index: true
  },
  // Creator information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdByName: {
    type: String,
    required: true
  },
  // Institution and course context
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution'
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  department: {
    type: String,
    trim: true
  },
  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },
  submissionCount: {
    type: Number,
    default: 0
  },
  // Scheduling
  publishDate: {
    type: Date,
    default: Date.now
  },
  // Visibility settings
  isActive: {
    type: Boolean,
    default: true
  },
  // Additional metadata
  tags: [String],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Indexes for better performance
assessmentSchema.index({ type: 1, status: 1 });
assessmentSchema.index({ createdBy: 1, type: 1 });
assessmentSchema.index({ unitId: 1, type: 1 });
assessmentSchema.index({ dueDate: 1, status: 1 });
assessmentSchema.index({ createdAt: -1 });

// Text search index
assessmentSchema.index({ 
  title: 'text', 
  description: 'text', 
  unitName: 'text',
  unitCode: 'text'
});

// Virtual for secure image URL
assessmentSchema.virtual('imageUrl').get(function() {
  return `/api/secure-images/${this.type}/${this._id}`;
});

// Virtual for time remaining
assessmentSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  const due = new Date(this.dueDate);
  return due - now; // Returns milliseconds remaining (negative if overdue)
});

// Virtual for status display
assessmentSchema.virtual('statusDisplay').get(function() {
  const now = new Date();
  const due = new Date(this.dueDate);
  
  if (this.status === 'draft') return 'Draft';
  if (now > due && this.status !== 'completed') return 'Expired';
  if (this.status === 'scheduled' && now >= this.publishDate) return 'Active';
  
  return this.status.charAt(0).toUpperCase() + this.status.slice(1);
});

// Methods
assessmentSchema.methods.canBeViewedBy = function(userId) {
  // Check if assessment is accessible
  if (!this.isActive) return false;
  if (this.status === 'draft') return false;
  if (new Date() > new Date(this.dueDate) && this.status !== 'completed') return false;
  
  return true;
};

assessmentSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Static methods
assessmentSchema.statics.getActiveByType = function(type, userId = null) {
  const query = { 
    type, 
    isActive: true, 
    status: { $in: ['active', 'scheduled'] },
    dueDate: { $gte: new Date() }
  };
  
  if (userId) {
    query.createdBy = userId;
  }
  
  return this.find(query).sort({ createdAt: -1 });
};

assessmentSchema.statics.getByUnit = function(unitId, type = null) {
  const query = { unitId, isActive: true };
  if (type) query.type = type;
  
  return this.find(query).sort({ dueDate: 1 });
};

// Pre-save middleware
assessmentSchema.pre('save', function(next) {
  // Auto-update status based on dates
  const now = new Date();
  const due = new Date(this.dueDate);
  
  if (now > due && this.status === 'active') {
    this.status = 'expired';
  }
  
  next();
});

// Pre-remove middleware to clean up files
assessmentSchema.pre('remove', function(next) {
  const fs = require('fs');
  const path = require('path');
  
  // Delete the associated image file
  if (this.imageFile && this.imageFile.filePath) {
    const fullPath = path.join(__dirname, '..', this.imageFile.filePath);
    fs.unlink(fullPath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });
  }
  
  next();
});

module.exports = mongoose.model('Assessment', assessmentSchema);
