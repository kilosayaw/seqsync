// SEGSYNC/backend/routes/auth.routes.js
const express = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/authMiddleware');
const { validate, registrationSchema, loginSchema } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post('/register', validate(registrationSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/profile', protect, authController.getMyProfile);
router.post('/logout', protect, authController.logout); // Logout is mostly client-side for JWT

module.exports = router;