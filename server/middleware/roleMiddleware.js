const apiResponse = require('../utils/apiResponse');

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    console.log('User role:', userRole, 'Allowed roles:', allowedRoles);
    
    // Temporarily allow all authenticated users to access lab queue
    if (req.path && req.path.includes('/queue')) {
      console.log('Allowing access to queue for user with role:', userRole);
      return next();
    }
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json(apiResponse({ success: false, message: 'Access denied', data: null }));
    }
    next();
  };
};

module.exports = authorizeRoles;
