const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const apiResponse = require('../utils/apiResponse');

exports.createAppointment = async (req, res, next) => {
  try {
    const { patient, doctor, date, timeSlot, type, branch, chiefComplaint } = req.body;
    const existingPatient = await Patient.findById(patient);
    if (!existingPatient) {
      return res.status(404).json(apiResponse({ success: false, message: 'Patient not found', data: null }));
    }
    const appointment = await Appointment.create({
      patient,
      doctor,
      date,
      timeSlot,
      type,
      branch: branch || '',
      chiefComplaint: chiefComplaint || '',
      tokenNumber: Math.floor(Math.random() * 100) + 1
    });
    req.app.get('io')?.emit('new_appointment', { appointment });
    res.status(201).json(apiResponse({ success: true, message: 'Appointment created', data: appointment }));
  } catch (error) {
    next(error);
  }
};

exports.getAppointments = async (req, res, next) => {
  try {
    const { search = '', status, type, page = 1, limit = 10, doctor } = req.query;
    const filters = {};
    if (search) {
      filters.$or = [
        { branch: { $regex: search, $options: 'i' } },
        { timeSlot: { $regex: search, $options: 'i' } },
        { chiefComplaint: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (doctor) filters.doctor = doctor;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Appointment.countDocuments(filters);
    const appointments = await Appointment.find(filters)
      .populate('patient', 'MRH name phone')
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    res.status(200).json(apiResponse({ success: true, message: 'Appointments retrieved', data: { appointments, pagination: { total, page: Number(page), limit: Number(limit) } } }));
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!appointment) {
      return res.status(404).json(apiResponse({ success: false, message: 'Appointment not found', data: null }));
    }
    req.app.get('io')?.emit('patient_called', { appointmentId: appointment._id, status });
    res.status(200).json(apiResponse({ success: true, message: 'Appointment status updated', data: appointment }));
  } catch (error) {
    next(error);
  }
};

exports.getDoctorSchedule = async (req, res, next) => {
  try {
    const { doctorId, date } = req.query;
    const filters = { doctor: doctorId };
    if (date) {
      const day = new Date(date);
      const start = new Date(day.setHours(0, 0, 0, 0));
      const end = new Date(day.setHours(23, 59, 59, 999));
      filters.date = { $gte: start, $lte: end };
    }
    const schedule = await Appointment.find(filters)
      .populate('patient', 'MRH name')
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .sort({ timeSlot: 1 });
    res.status(200).json(apiResponse({ success: true, message: 'Doctor schedule retrieved', data: schedule }));
  } catch (error) {
    next(error);
  }
};

exports.getTodayQueue = async (req, res, next) => {
  try {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));
    const queue = await Appointment.find({
      date: { $gte: start, $lte: end },
      status: { $in: ['scheduled', 'checked_in', 'in_progress'] }
    })
      .populate('patient', 'MRH name')
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .sort({ tokenNumber: 1 });
    res.status(200).json(apiResponse({ success: true, message: 'Today queue retrieved', data: queue }));
  } catch (error) {
    next(error);
  }
};
