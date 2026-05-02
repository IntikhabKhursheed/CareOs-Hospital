const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const { generateBill, addPayment, getBills, detectAnomalies } = require('../controllers/billingController');

const router = express.Router();
router.use(authMiddleware);
router.post('/', authorizeRoles('super_admin', 'admin', 'doctor', 'receptionist', 'pharmacist'), generateBill);
router.post('/:id/payment', authorizeRoles('super_admin', 'admin', 'receptionist', 'pharmacist'), addPayment);
router.get('/', authorizeRoles('super_admin', 'admin', 'doctor', 'nurse', 'receptionist', 'pharmacist'), getBills);
router.post('/anomalies', authorizeRoles('super_admin', 'admin', 'doctor', 'nurse', 'pharmacist'), detectAnomalies);

module.exports = router;
