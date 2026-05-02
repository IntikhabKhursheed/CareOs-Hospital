const mongoose = require('mongoose');

const medicineItemSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true
    },
    dosage: {
      type: String,
      required: true,
      trim: true
    },
    frequency: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: String,
      required: true,
      trim: true
    },
    instructions: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    visit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visit'
    },
    medicines: {
      type: [medicineItemSchema],
      default: []
    },
    status: {
      type: String,
      enum: ['pending', 'dispensed', 'partial'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
