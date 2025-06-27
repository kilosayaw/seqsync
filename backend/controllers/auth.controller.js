// SEGSYNC/backend/controllers/auth.controller.js
const authService = require('../services/auth.service');
const ApiError = require('../utils/ApiError'); // Corrected class name from apiError to ApiError

const register = async (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return next(new ApiError('Please provide username, email, and password', 400));
  }

  try {
    const { user } = await authService.registerUser({ username, email, password });
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully. Please check your email for confirmation if enabled.',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ApiError('Please provide email and password', 400));
  }

  try {
    const { token, user } = await authService.loginUser({ email, password });
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMyProfile = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next(new ApiError('User not found in request. Ensure you are logged in.', 401));
  }
  try {
    const userProfile = await authService.getUserProfile(req.user.id);
    res.status(200).json({
      status: 'success',
      data: {
        user: userProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  res.status(200).json({ status: 'success', message: 'Logged out successfully. Please clear your token on the client.' });
};

module.exports = {
  register,
  login,
  getMyProfile,
  logout,
};