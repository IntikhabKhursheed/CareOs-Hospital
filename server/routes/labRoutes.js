const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const {
  createLabOrder,
  updateResults,
  verifyResults,
  getLabQueue,
  getPatientLabReports
} = require('../controllers/labController');

const router = express.Router();
router.use(authMiddleware);
router.post('/', authorizeRoles('super_admin', 'admin', 'doctor', 'lab_technician'), createLabOrder);
router.post('/:id/results', authorizeRoles('super_admin', 'admin', 'doctor', 'lab_technician'), updateResults);
router.post('/:id/verify', authorizeRoles('super_admin', 'admin', 'doctor', 'lab_technician'), verifyResults);
router.get('/queue', authorizeRoles('super_admin', 'admin', 'doctor', 'lab_technician'), getLabQueue);
router.get('/patient/:patientId', authorizeRoles('super_admin', 'admin', 'doctor', 'nurse', 'lab_technician', 'patient'), getPatientLabReports);

module.exports = router;
