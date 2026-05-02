const express = require('express');
const { createPatient, getPatients, getPatientById, updatePatient, getPatientHistory } = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.post('/', authorizeRoles('super_admin', 'admin', 'doctor', 'nurse', 'receptionist'), createPatient);
router.get('/', authorizeRoles('super_admin', 'admin', 'doctor', 'nurse', 'receptionist', 'pharmacist'), getPatients);
router.get('/:id', authorizeRoles('super_admin', 'admin', 'doctor', 'nurse', 'receptionist', 'pharmacist'), getPatientById);
router.put('/:id', authorizeRoles('super_admin', 'admin', 'doctor', 'nurse', 'receptionist'), updatePatient);
router.get('/:id/history', authorizeRoles('super_admin', 'admin', 'doctor', 'nurse', 'receptionist'), getPatientHistory);

module.exports = router;
