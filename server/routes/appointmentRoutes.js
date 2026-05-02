const express = require('express');
const { createAppointment, getAppointments, updateStatus, getDoctorSchedule, getTodayQueue } = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.post('/', authorizeRoles('super_admin', 'admin', 'doctor', 'receptionist'), createAppointment);
router.get('/', authorizeRoles('super_admin', 'admin', 'doctor', 'nurse', 'receptionist'), getAppointments);
router.put('/:id/status', authorizeRoles('super_admin', 'admin', 'doctor', 'nurse', 'receptionist'), updateStatus);
router.get('/schedule', authorizeRoles('super_admin', 'admin', 'doctor', 'nurse', 'receptionist'), getDoctorSchedule);
router.get('/queue/today', authorizeRoles('super_admin', 'admin', 'doctor', 'nurse', 'receptionist'), getTodayQueue);

module.exports = router;
