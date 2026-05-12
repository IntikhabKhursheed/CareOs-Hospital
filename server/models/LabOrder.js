const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestCatalog',
    required: true
  },
  priority: {
    type: String,
    enum: ['routine', 'urgent', 'stat'],
    default: 'routine'
  },
  clinicalNotes: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['ordered', 'sample_collected', 'partial', 'completed'],
    default: 'ordered'
  },
  results: [{
    parameter: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      trim: true
    },
    normalRange: {
      type: String,
      trim: true
    },
    flag: {
      type: String,
      enum: ['normal', 'low', 'high', 'critical_low', 'critical_high'],
      default: 'normal'
    }
  }],
  aiInterpretation: {
    type: String,
    trim: true
  },
  resultEnteredAt: {
    type: Date
  },
  resultEnteredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const labOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
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
  referredBy: {
    type: String,
    trim: true
  },
  tests: [testResultSchema],
  overallStatus: {
    type: String,
    enum: ['ordered', 'partial', 'completed', 'cancelled'],
    default: 'ordered'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  criticalValueAlerted: {
    type: Boolean,
    default: false
  },
  sampleCollectedAt: Date,
  sampleCollectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Auto-generate order number before save
labOrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${year + 1}-01-01`)
      }
    });
    this.orderNumber = `ORD-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Calculate total amount from test prices
labOrderSchema.methods.calculateTotalAmount = function() {
  this.totalAmount = this.tests.reduce((total, test) => {
    return total + (test.test?.price || 0);
  }, 0);
};

// Update overall status based on test statuses
labOrderSchema.methods.updateOverallStatus = function() {
  const testStatuses = this.tests.map(test => test.status);
  
  if (testStatuses.every(status => status === 'completed')) {
    this.overallStatus = 'completed';
  } else if (testStatuses.some(status => status === 'completed')) {
    this.overallStatus = 'partial';
  } else {
    this.overallStatus = 'ordered';
  }
};

// Index for better query performance
labOrderSchema.index({ orderNumber: 1 });
labOrderSchema.index({ patient: 1 });
labOrderSchema.index({ orderedBy: 1 });
labOrderSchema.index({ overallStatus: 1 });
labOrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('LabOrder', labOrderSchema);
