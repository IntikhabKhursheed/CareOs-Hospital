const express = require('express');
const router = express.Router();
const testCatalogController = require('../controllers/testCatalogController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// POST /api/tests - Create test (admin only)
router.post('/', 
  authMiddleware, 
  authorizeRoles('admin', 'super_admin'), 
  testCatalogController.createTest
);

// GET /api/tests - Get all tests (all authenticated)
router.get('/', 
  authMiddleware, 
  testCatalogController.getAllTests
);

// GET /api/tests/search - Search tests (all authenticated)
router.get('/search', 
  authMiddleware, 
  testCatalogController.searchTests
);

// GET /api/tests/:id - Get test by ID (all authenticated)
router.get('/:id', 
  authMiddleware, 
  testCatalogController.getTestById
);

// PUT /api/tests/:id - Update test (admin only)
router.put('/:id', 
  authMiddleware, 
  authorizeRoles('admin', 'super_admin'), 
  testCatalogController.updateTest
);

// DELETE /api/tests/:id - Delete test (admin only)
router.delete('/:id', 
  authMiddleware, 
  authorizeRoles('admin', 'super_admin'), 
  testCatalogController.deleteTest
);

module.exports = router;
