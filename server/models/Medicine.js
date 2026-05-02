const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    genericName: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      trim: true,
      default: ''
    },
    manufacturer: {
      type: String,
      trim: true,
      default: ''
    },
    batchNumber: {
      type: String,
      trim: true,
      default: ''
    },
    expiryDate: {
      type: Date
    },
    quantity: {
      type: Number,
      default: 0
    },
    reorderLevel: {
      type: Number,
      default: 0
    },
    unitPrice: {
      type: Number,
      default: 0
    },
    requiresPrescription: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medicine', medicineSchema);
