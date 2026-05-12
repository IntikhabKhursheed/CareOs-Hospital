const express = require('express');
const router = express.Router();
const labTestRequestController = require('../controllers/labTestRequestController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Create test request (Doctor, Lab Technician)
router.post('/', 
  authMiddleware,
  authorizeRoles('doctor', 'lab_technician'),
  labTestRequestController.createTestRequest
);

// Get lab queue (Lab Technician, Doctor)
router.get('/queue',
  authMiddleware,
  authorizeRoles('lab_technician', 'doctor'),
  labTestRequestController.getLabQueue
);

// Get test request by ID
router.get('/:id',
  authMiddleware,
  labTestRequestController.getTestRequestById
);

// Update test request (Lab Technician)
router.put('/:id',
  authMiddleware,
  authorizeRoles('lab_technician'),
  labTestRequestController.updateTestRequest
);

// Mark sample as collected (Lab Technician)
router.patch('/:id/collect-sample',
  authMiddleware,
  authorizeRoles('lab_technician'),
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
