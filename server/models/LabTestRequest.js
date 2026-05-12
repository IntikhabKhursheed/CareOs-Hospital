const mongoose = require('mongoose');

const labTestRequestSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestCatalog',
    required: true
  },
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referrerName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  urgency: {
    type: String,
    enum: ['routine', 'urgent', 'stat'],
    default: 'routine'
  },
  sampleCollected: {
    type: Boolean,
    default: false
  },
  sampleCollectedAt: {
    type: Date
  },
  sampleCollectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  results: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  resultEnteredAt: {
    type: Date
  },
  resultEnteredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  assignedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
labTestRequestSchema.index({ patient: 1, status: 1 });
labTestRequestSchema.index({ test: 1, status: 1 });
labTestRequestSchema.index({ referrer: 1 });
labTestRequestSchema.index({ status: 1, urgency: 1 });

module.exports = mongoose.model('LabTestRequest', labTestRequestSchema);
