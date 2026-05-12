const mongoose = require('mongoose');

const parameterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  normalRangeMale: {
    type: String,
    trim: true,
    default: ''
  },
  normalRangeFemale: {
    type: String,
    trim: true,
    default: ''
  },
  normalRangeChild: {
    type: String,
    trim: true,
    default: ''
  }
});

const testCatalogSchema = new mongoose.Schema({
  testCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  testName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Hematology', 'Biochemistry', 'Microbiology', 'Serology', 'Radiology', 'Cardiology', 'Urine', 'Stool'],
    required: true
  },
  department: {
    type: String,
    enum: ['Laboratory', 'Radiology', 'Cardiology'],
    default: 'Laboratory'
  },
  sampleType: {
    type: String,
    enum: ['Blood', 'Urine', 'Stool', 'Sputum', 'Swab', 'Tissue', 'None'],
    default: 'None'
  },
  parameters: [parameterSchema],
  price: {
    type: Number,
    required: true,
    min: 0
  },
  turnaroundHours: {
    type: Number,
    default: 4,
    min: 1
  },
  preparationInstructions: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to ensure testCode is uppercase
testCatalogSchema.pre('save', function(next) {
  if (this.testCode) {
    this.testCode = this.testCode.toUpperCase();
  }
  next();
});

// Index for better search performance
testCatalogSchema.index({ testCode: 1 });
testCatalogSchema.index({ testName: 1 });
testCatalogSchema.index({ category: 1 });
testCatalogSchema.index({ department: 1 });

module.exports = mongoose.model('TestCatalog', testCatalogSchema);
