const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const {
  generateClinicalNote,
  suggestDiagnosis,
  checkDrugInteraction,
  interpretLabResults,
  generateDischargeSummary,
  identifyFollowUps,
  detectBillingAnomaly,
  generateWeeklyReport
} = require('../controllers/aiController');

const router = express.Router();
router.use(authMiddleware);
router.post('/clinical-note', authorizeRoles('super_admin', 'admin', 'doctor', 'nurse'), generateClinicalNote);
router.post('/diagnosis', authorizeRoles('super_admin', 'admin', 'doctor', 'nurse'), suggestDiagnosis);
router.post('/drug-interaction', authorizeRoles('super_admin', 'admin', 'doctor', 'nurse', 'pharmacist'), checkDrugInteraction);
router.post('/interpret-lab', authorizeRoles('super_admin', 'admin', 'doctor', 'nurse', 'pharmacist'), interpretLabResults);
router.post('/discharge-summary', authorizeRoles('super_admin', 'admin', 'doctor', 'nurse'), generateDischargeSummary);
router.post('/follow-ups', authorizeRoles('super_admin', 'admin', 'doctor', 'nurse'), identifyFollowUps);
router.post('/billing-anomaly', authorizeRoles('super_admin', 'admin', 'doctor', 'nurse', 'pharmacist'), detectBillingAnomaly);
router.post('/weekly-report', authorizeRoles('super_admin', 'admin'), generateWeeklyReport);

module.exports = router;
