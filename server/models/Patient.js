const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    MRH: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    gender: {
      type: String,
      required: true,
      trim: true
    },
    bloodGroup: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    emergencyContact: {
      type: String,
      trim: true,
      default: ''
    },
    allergies: {
      type: [String],
      default: []
    },
    chronicConditions: {
      type: [String],
      default: []
    },
    photo: {
      type: String,
      trim: true,
      default: ''
    },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestCatalog'
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
