const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: false
    },
    date: {
      type: Date,
      required: true
    },
    timeSlot: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['new', 'followup', 'emergency'],
      default: 'new'
    },
    status: {
      type: String,
      enum: ['scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'],
      default: 'scheduled'
    },
    tokenNumber: {
      type: Number,
      default: 0
    },
    chiefComplaint: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    branch: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
