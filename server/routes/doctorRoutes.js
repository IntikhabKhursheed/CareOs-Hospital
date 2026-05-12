const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// POST /api/doctors - Create doctor (admin/super_admin only)
router.post('/', 
  authMiddleware, 
  authorizeRoles('admin', 'super_admin'), 
  doctorController.createDoctor
);

// GET /api/doctors - Get all doctors (all authenticated users)
router.get('/', 
  authMiddleware, 
  doctorController.getDoctors
);

// GET /api/doctors/:id - Get doctor by ID (all authenticated users)
router.get('/:id', 
  authMiddleware, 
  doctorController.getDoctorById
);

// PUT /api/doctors/:id - Update doctor (admin only)
router.put('/:id', 
  authMiddleware, 
  authorizeRoles('admin', 'super_admin'), 
  doctorController.updateDoctor
);

module.exports = router;
