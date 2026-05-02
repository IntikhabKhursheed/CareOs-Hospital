const apiResponse = require('../utils/apiResponse');

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json(apiResponse({ success: false, message: 'Access denied', data: null }));
    }
    next();
  };
};

module.exports = authorizeRoles;
