// SEGSYNC/backend/middleware/validationMiddleware.js
const Joi = require('joi');
const ApiError = require('../utils/ApiError');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[property];
    // If validating 'params' or 'query', and it's empty, Joi might error if schema expects fields.
    // However, for 'body', an empty body for a POST/PUT might be invalid based on schema.
    if (!dataToValidate && (property === 'params' || property === 'query')) {
        // Or if schema allows optional, this might be fine.
        // For now, let Joi handle it.
    }

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
      // convert: true, // Joi default, useful for type coercion (e.g. string numbers to numbers)
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message.replace(/["\\]/g, '')).join(', ');
      return next(new ApiError(`Validation error: ${errorMessage}`, 400));
    }
    req[property] = value;
    next();
  };
};

// Auth Schemas
const registrationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Sequence Schemas
const createSequenceSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(2000).allow('').optional(), // Increased limit
  tempo: Joi.number().integer().min(20).max(400).optional().allow(null),
  time_signature: Joi.string().pattern(/^\d{1,2}\/\d{1,2}$/).optional().allow(null), // e.g., "4/4", "12/8"
  privacy_setting: Joi.string().valid('private', 'public', 'unlisted').default('private'),
  original_media_audio_url: Joi.string().uri({ scheme: ['http', 'https'] }).optional().allow(null, ''),
  original_media_video_url: Joi.string().uri({ scheme: ['http', 'https'] }).optional().allow(null, ''),
  metadata_custom: Joi.string().optional().allow(null, '').custom((value, helpers) => {
    if (!value) return value;
    try { JSON.parse(value); return value; } 
    catch (e) { return helpers.message('"metadata_custom" must be a valid JSON string'); }
  }),
  royalty_split_info: Joi.string().optional().allow(null, '').custom((value, helpers) => {
    if (!value) return value;
    try { JSON.parse(value); return value; }
    catch (e) { return helpers.message('"royalty_split_info" must be a valid JSON string'); }
  }),
});

const updateSequenceMetadataSchema = Joi.object({
  title: Joi.string().min(1).max(255).optional(),
  description: Joi.string().max(2000).allow('').optional(),
  tempo: Joi.number().integer().min(20).max(400).optional().allow(null),
  time_signature: Joi.string().pattern(/^\d{1,2}\/\d{1,2}$/).optional().allow(null),
  privacy_setting: Joi.string().valid('private', 'public', 'unlisted').optional(),
  original_media_audio_url: Joi.string().uri({ scheme: ['http', 'https'] }).optional().allow(null, ''),
  original_media_video_url: Joi.string().uri({ scheme: ['http', 'https'] }).optional().allow(null, ''),
  metadata_custom: Joi.string().optional().allow(null, '').custom((value, helpers) => {
    if (!value && value !== null) return value; // Allow null or empty string
    try { if (value) JSON.parse(value); return value; }
    catch (e) { return helpers.message('"metadata_custom" must be a valid JSON string or null'); }
  }),
  royalty_split_info: Joi.string().optional().allow(null, '').custom((value, helpers) => {
    if (!value && value !== null) return value;
    try { if (value) JSON.parse(value); return value; }
    catch (e) { return helpers.message('"royalty_split_info" must be a valid JSON string or null'); }
  }),
}).min(1); // Requires at least one field for update

// Parameter & Query Schemas
const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

const updateUserRoleSchema = Joi.object({
    roleName: Joi.string().valid('user', 'admin', 'super_admin', 'master_admin').required(),
});


module.exports = {
  validate,
  registrationSchema,
  loginSchema,
  createSequenceSchema,
  updateSequenceMetadataSchema,
  idParamSchema,
  paginationSchema,
  updateUserRoleSchema,
};