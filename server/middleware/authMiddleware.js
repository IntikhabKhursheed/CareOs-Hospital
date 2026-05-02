const jwt = require('jsonwebtoken');
const User = require('../models/User');
const apiResponse = require('../utils/apiResponse');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(apiResponse({ success: false, message: 'Authorization required', data: null }));
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json(apiResponse({ success: false, message: 'Authorization token missing', data: null }));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json(apiResponse({ success: false, message: 'Invalid token', data: null }));
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json(apiResponse({ success: false, message: 'Token verification failed', data: null }));
  }
};

module.exports = authMiddleware;
