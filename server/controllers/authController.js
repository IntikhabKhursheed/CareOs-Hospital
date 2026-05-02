const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const apiResponse = require('../utils/apiResponse');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, specialization, phone, avatar } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json(apiResponse({ success: false, message: 'Email is already registered', data: null }));
    }
    const user = await User.create({
      name,
      email,
      password,
      role,
      specialization: specialization || '',
      phone: phone || '',
      avatar: avatar || ''
    });
    const accessToken = generateToken.generateAccessToken(user);
    const refreshToken = generateToken.generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.status(201).json(apiResponse({ success: true, message: 'Registration successful', data: { accessToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } } }));
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json(apiResponse({ success: false, message: 'Invalid credentials', data: null }));
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json(apiResponse({ success: false, message: 'Invalid credentials', data: null }));
    }
    if (!user.isActive) {
      return res.status(403).json(apiResponse({ success: false, message: 'Account is inactive', data: null }));
    }
    const accessToken = generateToken.generateAccessToken(user);
    const refreshToken = generateToken.generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.status(200).json(apiResponse({ success: true, message: 'Login successful', data: { accessToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } } }));
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = '';
        await user.save();
      }
    }
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
    return res.status(200).json(apiResponse({ success: true, message: 'Logout successful', data: null }));
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) {
      return res.status(401).json(apiResponse({ success: false, message: 'Refresh token is required', data: null }));
    }
    const user = await User.findOne({ refreshToken: token });
    if (!user) {
      return res.status(403).json(apiResponse({ success: false, message: 'Invalid refresh token', data: null }));
    }
    const decoded = generateToken.verifyRefreshToken(token);
    if (!decoded) {
      return res.status(403).json(apiResponse({ success: false, message: 'Invalid refresh token', data: null }));
    }
    const accessToken = generateToken.generateAccessToken(user);
    const refreshToken = generateToken.generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.status(200).json(apiResponse({ success: true, message: 'Token refreshed', data: { accessToken } }));
  } catch (error) {
    next(error);
  }
};
