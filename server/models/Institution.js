const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  shortName: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: [
      'public_university', 
      'private_university', 
      'medical_college', 
      'polytechnic', 
      'teachers_college', 
      'technical_institute',
      'university', // Keep for backward compatibility
      'technical_college', // Keep for backward compatibility
      'other'
    ],
    required: true
  },
  location: {
    county: {
      type: String,
      required: true
    },
    town: {
      type: String,
      required: true
    },
    address: String
  },
  logo: {
    url: String,
    publicId: String // Cloudinary public ID
  },
  colors: {
    primary: {
      type: String,
      default: '#1976d2'
    },
    secondary: {
      type: String,
      default: '#dc004e'
    }
  },
  contact: {
    email: String,
    phone: String,
    website: String
  },
  website: String, // Additional website field for compatibility
  description: String, // Institution description
  studentCapacity: Number, // Maximum student capacity
  isActive: {
    type: Boolean,
    default: true
  },
  establishedYear: Number,
  accreditation: {
    body: String,
    status: {
      type: String,
      enum: ['accredited', 'provisional', 'pending'],
      default: 'accredited'
    }
  }
}, {
  timestamps: true
});

// Index for search functionality
institutionSchema.index({ name: 'text', shortName: 'text' });

module.exports = mongoose.model('Institution', institutionSchema);
