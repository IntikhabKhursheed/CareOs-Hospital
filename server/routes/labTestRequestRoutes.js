const express = require('express');
const router = express.Router();
const labTestRequestController = require('../controllers/labTestRequestController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Create test request (Doctor, Lab Technician, Admin, Super Admin)
router.post('/', 
  authMiddleware,
  authorizeRoles('doctor', 'lab_technician', 'admin', 'super_admin'),
  labTestRequestController.createTestRequest
);

// Get lab queue (Lab Technician, Doctor, Admin, Super Admin)
router.get('/queue',
  authMiddleware,
  authorizeRoles('lab_technician', 'doctor', 'admin', 'super_admin'),
  labTestRequestController.getLabQueue
);

// Get test request by ID
router.get('/:id',
  authMiddleware,
  authorizeRoles('lab_technician', 'doctor', 'admin', 'super_admin', 'patient'),
  labTestRequestController.getTestRequestById
);

// Update test request (Lab Technician)
router.put('/:id',
  authMiddleware,
  authorizeRoles('lab_technician'),
  labTestRequestController.updateTestRequest
);

// Mark sample as collected (Lab Technician, Super Admin)
router.patch('/:id/collect-sample',
  authMiddleware,
  authorizeRoles('lab_technician', 'super_admin'),
  labTestRequestController.markSampleCollected
);

// Enter test results (Lab Technician)
router.patch('/:id/results',
  authMiddleware,
  authorizeRoles('lab_technician'),
  labTestRequestController.enterResults
);

// Get patient test requests (Doctor, Patient)
router.get('/patient/:patientId',
  authMiddleware,
  authorizeRoles('doctor', 'patient'),
  labTestRequestController.getPatientTestRequests
);

module.exports = router;
