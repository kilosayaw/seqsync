// SEGSYNC/backend/routes/sequence.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const sequenceController = require('../controllers/sequence.controller.js');
const { uploadSeqrFile } = require('../middleware/uploadMiddleware');
const { validate, createSequenceSchema, updateSequenceMetadataSchema, idParamSchema, paginationSchema } = require('../middleware/validationMiddleware');

// POST: Create a new sequence
router.post(
    '/',
    protect,
    uploadSeqrFile.single('seqrFile'),
    validate(createSequenceSchema, 'body'),
    sequenceController.createSequence
);

// GET: Get all sequences for the authenticated user
router.get(
    '/',
    protect,
    validate(paginationSchema, 'query'),
    sequenceController.getUserSequences
);

// GET: Get a specific sequence by its ID
router.get(
    '/:id',
    protect,
    validate(idParamSchema, 'params'),
    sequenceController.getSequenceById
);

// PUT: Update metadata for a specific sequence
router.put(
    '/:id/metadata',
    protect,
    validate(idParamSchema, 'params'),
    validate(updateSequenceMetadataSchema, 'body'),
    sequenceController.updateSequenceMetadata
);

// DELETE: Delete a specific sequence
router.delete(
    '/:id',
    protect,
    validate(idParamSchema, 'params'),
    sequenceController.deleteSequence
);

// GET: Download a specific sequence file
router.get(
    '/:id/download', // New route for downloading
    protect,
    validate(idParamSchema, 'params'), // Validate the ID
    sequenceController.downloadSequenceFile // New controller function
);

module.exports = router;