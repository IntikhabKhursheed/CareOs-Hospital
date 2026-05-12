const mongoose = require('mongoose');

const departmentOptions = [
  'General Medicine',
  'Surgery',
  'Pediatrics',
  'Gynecology',
  'Cardiology',
  'Orthopedics',
  'ENT',
  'Ophthalmology',
  'Dermatology',
  'Psychiatry',
  'Neurology',
  'Urology',
  'Emergency'
];

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: String,
    default: ''
  },
  endTime: {
    type: String,
    default: ''
  }
});

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  pmdcNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  department: {
    type: String,
    enum: departmentOptions,
    required: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  consultationFee: {
    type: Number,
    required: true,
    min: 0
  },
  availability: [availabilitySchema],
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to ensure availability days are unique
doctorSchema.pre('save', function(next) {
  const days = this.availability.map(avail => avail.day);
  const uniqueDays = [...new Set(days)];
  if (days.length !== uniqueDays.length) {
    const error = new Error('Duplicate availability days are not allowed');
    return next(error);
  }
  next();
});

module.exports = mongoose.model('Doctor', doctorSchema);
