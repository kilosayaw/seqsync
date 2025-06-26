// SEGSYNC/backend/middleware/authMiddleware.js
// const jwt = require('jsonwebtoken'); // Not needed here if Supabase SDK handles token details
const ApiError = require('../utils/ApiError');
// const db = require('../config/db'); // REMOVE THIS LINE
const supabaseAdmin = require('../config/supabaseAdmin'); // USE THIS

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError('Not authorized, no token provided.', 401));
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error) {
      console.error('Supabase token verification error in protect middleware:', error.message);
      if (error.message === 'invalid_token' || error.message.includes('expired') || error.status === 401) {
        return next(new ApiError('Not authorized, token is invalid or expired. Please log in again.', 401));
      }
      return next(new ApiError(`Authentication error: ${error.message}`, error.status || 401));
    }

    if (!user) {
      return next(new ApiError('Not authorized, user not found for this token.', 401));
    }

    req.user = {
      id: user.id,
      email: user.email,
      app_metadata: user.app_metadata,
      user_metadata: user.user_metadata,
    };
    next();
  } catch (error) {
    console.error('Unexpected error in protect middleware:', error);
    return next(new ApiError('Not authorized, token verification failed unexpectedly.', 500));
  }
};

const restrictTo = (...allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.id) {
      return next(new ApiError('User not authenticated. Cannot perform role check.', 401));
    }

    try {
      // Fetch roles using Supabase SDK
      const { data: roleAssignments, error: rolesError } = await supabaseAdmin
        .from('user_roles') // Your public table linking users to roles
        .select(`
          roles ( name ) 
        `) // Assumes a 'roles' table with a 'name' column, and 'user_roles' has a FK 'role_id' to 'roles.id'
        .eq('user_id', req.user.id);

      if (rolesError) {
        console.error("Error fetching user roles for restriction check (Supabase):", rolesError);
        return next(new ApiError('Could not verify user permissions due to a database error.', 500));
      }

      const userRoles = roleAssignments ? roleAssignments.map(r => r.roles.name) : [];
      req.user.currentRoles = userRoles;

      if (!allowedRoles.some(role => userRoles.includes(role))) {
        return next(new ApiError(`Access denied. Required role(s): ${allowedRoles.join(' or ')}. Your role(s): ${userRoles.join(', ') || 'none'}.`, 403));
      }
      next();
    } catch (dbError) { // Catch any other unexpected errors
      console.error("Unexpected error fetching user roles for restriction check:", dbError);
      return next(new ApiError('Could not verify user permissions due to a server error.', 500));
    }
  };
};

module.exports = { protect, restrictTo };