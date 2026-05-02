const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
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
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    vitalSigns: {
      bp: { type: String, trim: true, default: '' },
      temperature: { type: String, trim: true, default: '' },
      weight: { type: String, trim: true, default: '' },
      height: { type: String, trim: true, default: '' },
      pulse: { type: String, trim: true, default: '' },
      oxygenSat: { type: String, trim: true, default: '' },
      sugarLevel: { type: String, trim: true, default: '' }
    },
    chiefComplaint: {
      type: String,
      trim: true,
      default: ''
    },
    clinicalNotes: {
      type: String,
      trim: true,
      default: ''
    },
    diagnosis: {
      type: [String],
      default: []
    },
    prescriptions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prescription'
      }
    ],
    labOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabOrder'
      }
    ],
    followUpDate: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Visit', visitSchema);
