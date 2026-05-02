const mongoose = require('mongoose');

const labResultSchema = new mongoose.Schema(
  {
    parameter: { type: String, trim: true, required: true },
    value: { type: String, trim: true, required: true },
    unit: { type: String, trim: true, default: '' },
    referenceRange: { type: String, trim: true, default: '' },
    flag: {
      type: String,
      enum: ['normal', 'low', 'high', 'critical'],
      default: 'normal'
    }
  },
  { _id: false }
);

const labTestSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    orderedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    testName: {
      type: String,
      required: true,
      trim: true
    },
    testCode: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      trim: true,
      default: ''
    },
    priority: {
      type: String,
      enum: ['routine', 'urgent', 'stat'],
      default: 'routine'
    },
    status: {
      type: String,
      enum: ['ordered', 'sample_collected', 'processing', 'resulted', 'verified', 'delivered'],
      default: 'ordered'
    },
    sampleBarcode: {
      type: String,
      trim: true,
      default: ''
    },
    results: {
      type: [labResultSchema],
      default: []
    },
    aiInterpretation: {
      type: String,
      trim: true,
      default: ''
    },
    criticalValueAlerted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LabTest', labTestSchema);
