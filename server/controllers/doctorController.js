const User = require('../models/User');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');
const apiResponse = require('../utils/apiResponse');

exports.createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      gender,
      dateOfBirth,
      pmdcNumber,
      department,
      specialization,
      consultationFee,
      availability
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json(apiResponse({
        success: false,
        message: 'User with this email already exists',
        data: null
      }));
    }

    // Check if PMDC number already exists
    const existingDoctor = await Doctor.findOne({ pmdcNumber });
    if (existingDoctor) {
      return res.status(400).json(apiResponse({
        success: false,
        message: 'Doctor with this PMDC number already exists',
        data: null
      }));
    }

    // Create user with doctor role
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'doctor',
      isActive: true
    });

    // Create doctor profile
    const doctor = await Doctor.create({
      user: user._id,
      pmdcNumber,
      department,
      specialization,
      consultationFee,
      availability: availability || [],
      dateOfBirth,
      gender
    });

    // Populate user data in response
    const populatedDoctor = await Doctor.findById(doctor._id).populate('user', 'name email phone isActive role');

    res.status(201).json(apiResponse({
      success: true,
      message: 'Doctor created successfully',
      data: populatedDoctor
    }));
  } catch (error) {
    next(error);
  }
};

exports.getDoctors = async (req, res, next) => {
  try {
    const { search = '', department, page = 1, limit = 10 } = req.query;
    const filters = {};
    
    // Build filters for doctor search
    const doctorFilters = {};
    if (department) doctorFilters.department = department;
    
    // Build filters for user search
    const userFilters = { role: 'doctor' };
    if (search) {
      userFilters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Find doctors with filters
    const skip = (Number(page) - 1) * Number(limit);
    
    let doctors = await Doctor.find(doctorFilters)
      .populate({
        path: 'user',
        match: userFilters,
        select: 'name email phone isActive role'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Filter out doctors where user doesn't match the search criteria
    doctors = doctors.filter(doctor => doctor.user !== null);

    // Get total count with filters
    const totalDoctors = await Doctor.countDocuments(doctorFilters);
    const totalUsers = await User.countDocuments(userFilters);
    const total = Math.min(totalDoctors, totalUsers);

    res.status(200).json(apiResponse({
      success: true,
      message: 'Doctors retrieved successfully',
      data: {
        doctors,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit)
        }
      }
    }));
  } catch (error) {
    next(error);
  }
};

exports.getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'name email phone isActive role');
    
    if (!doctor) {
      return res.status(404).json(apiResponse({
        success: false,
        message: 'Doctor not found',
        data: null
      }));
    }

    res.status(200).json(apiResponse({
      success: true,
      message: 'Doctor retrieved successfully',
      data: doctor
    }));
  } catch (error) {
    next(error);
  }
};

exports.updateDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      gender,
      dateOfBirth,
      pmdcNumber,
      department,
      specialization,
      consultationFee,
      availability,
      isActive
    } = req.body;

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json(apiResponse({
        success: false,
        message: 'Doctor not found',
        data: null
      }));
    }

    // Update user information
    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (email) userUpdate.email = email;
    if (phone) userUpdate.phone = phone;
    if (isActive !== undefined) userUpdate.isActive = isActive;

    // Check if email is being changed and if it already exists
    if (email && email !== doctor.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json(apiResponse({
          success: false,
          message: 'User with this email already exists',
          data: null
        }));
      }
    }

    await User.findByIdAndUpdate(doctor.user._id, userUpdate);

    // Update doctor information
    const doctorUpdate = {};
    if (pmdcNumber) doctorUpdate.pmdcNumber = pmdcNumber;
    if (department) doctorUpdate.department = department;
    if (specialization) doctorUpdate.specialization = specialization;
    if (consultationFee !== undefined) doctorUpdate.consultationFee = consultationFee;
    if (availability) doctorUpdate.availability = availability;
    if (dateOfBirth) doctorUpdate.dateOfBirth = dateOfBirth;
    if (gender) doctorUpdate.gender = gender;

    // Check if PMDC number is being changed and if it already exists
    if (pmdcNumber && pmdcNumber !== doctor.pmdcNumber) {
      const existingDoctor = await Doctor.findOne({ pmdcNumber });
      if (existingDoctor) {
        return res.status(400).json(apiResponse({
          success: false,
          message: 'Doctor with this PMDC number already exists',
          data: null
        }));
      }
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      doctorUpdate,
      { new: true, runValidators: true }
    ).populate('user', 'name email phone isActive role');

    res.status(200).json(apiResponse({
      success: true,
      message: 'Doctor updated successfully',
      data: updatedDoctor
    }));
  } catch (error) {
    next(error);
  }
};
