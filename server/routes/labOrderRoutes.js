const express = require('express');
const router = express.Router();
const labOrderController = require('../controllers/labOrderController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Create lab order (Doctor, Lab Technician, Admin, Super Admin)
router.post('/', 
  authMiddleware,
  authorizeRoles('doctor', 'lab_technician', 'admin', 'super_admin'),
  labOrderController.createLabOrder
);

// Get lab orders (Lab Technician, Doctor, Admin, Super Admin)
router.get('/',
  authMiddleware,
  authorizeRoles('lab_technician', 'doctor', 'admin', 'super_admin'),
  labOrderController.getLabOrders
);

// Get lab order by ID (Lab Technician, Doctor, Admin, Super Admin, Patient)
router.get('/:id',
  authMiddleware,
  authorizeRoles('lab_technician', 'doctor', 'admin', 'super_admin', 'patient'),
  labOrderController.getLabOrderById
);

// Update order status (Lab Technician, Admin, Super Admin)
router.put('/:id/status',
  authMiddleware,
  authorizeRoles('lab_technician', 'admin', 'super_admin'),
  labOrderController.updateOrderStatus
);

// Enter test results (Lab Technician, Super Admin)
router.put('/:id/results',
  authMiddleware,
  authorizeRoles('lab_technician', 'super_admin'),
  labOrderController.enterResults
);

// Get patient lab history (Doctor, Patient, Admin, Super Admin)
router.get('/patient/:patientId',
  authMiddleware,
  authorizeRoles('doctor', 'patient', 'admin', 'super_admin'),
  labOrderController.getPatientLabHistory
);

module.exports = router;
