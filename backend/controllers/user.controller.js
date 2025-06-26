// SEGSYNC/backend/controllers/user.controller.js
const userService = require('../services/user.service.js');
const ApiError = require('../utils/ApiError');

// Ensure functions are attached to exports if not using module.exports = {} at the end
exports.getAllUsers = async (req, res, next) => {
  try {
    // Validation for page/limit is handled by Joi middleware in routes
    const { page, limit } = req.query; // Joi provides defaults if not present
    const result = await userService.findAllUsersWithRoles({ page, limit });
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    // ID validation by Joi middleware in routes
    const userId = req.params.id;
    const user = await userService.findUserWithRolesById(userId);
    // Service now throws 404 if user not in auth, or returns user with roles
    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    // Catch ApiError from service (e.g., 404 if user not found in auth)
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    // ID validation by Joi in routes
    // roleName validation by Joi in routes
    const adminUserId = req.user.id;
    const userIdToUpdate = req.params.id;
    const { roleName } = req.body;

    // More complex permission checks could go here or in the service
    // e.g., master_admin can change anyone, admin can change users but not other admins/master_admins
    if (adminUserId === userIdToUpdate && !req.user.currentRoles.includes('master_admin')) {
         if (req.user.currentRoles.includes(roleName)) {
            // Allow user to "set" their current role if it's the same, or if they are trying to become 'user'
         } else if (roleName !== 'user' && !req.user.currentRoles.includes('master_admin')) {
            return next(new ApiError('You do not have permission to change your own role to a higher privilege.', 403));
         }
    }


    const updatedUser = await userService.updateUserRoleAssignment(adminUserId, userIdToUpdate, roleName);
    res.status(200).json({
      status: 'success',
      message: `User role updated successfully for user ${userIdToUpdate}.`,
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};