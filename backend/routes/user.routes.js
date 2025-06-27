// SEGSYNC/backend/routes/user.routes.js
const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const userController = require('../controllers/user.controller');
const { validate, idParamSchema, updateUserRoleSchema, paginationSchema } = require('../middleware/validationMiddleware');

// GET all users (Admin only)
router.get(
    '/',
    protect,
    restrictTo('admin', 'super_admin', 'master_admin'),
    validate(paginationSchema, 'query'), // Validate pagination query params
    userController.getAllUsers
);

// GET a single user by ID (Admin only)
router.get(
    '/:id',
    protect,
    restrictTo('admin', 'super_admin', 'master_admin'),
    validate(idParamSchema, 'params'), // Validate ID in path
    userController.getUserById
);

// PATCH/PUT Update user role (Admin only)
router.patch( // Using PATCH for partial update semantics
    '/:id/role',
    protect,
    restrictTo('admin', 'super_admin', 'master_admin'), // Ensure only high-level admins can change roles
    validate(idParamSchema, 'params'),
    validate(updateUserRoleSchema, 'body'),
    userController.updateUserRole
);

module.exports = router;