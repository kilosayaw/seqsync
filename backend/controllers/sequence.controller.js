// SEGSYNC/backend/controllers/sequence.controller.js
const sequenceService = require('../services/sequence.service.js');
const ApiError = require('../utils/ApiError');

exports.createSequence = async (req, res, next) => {
  try {
    if (!req.file) return next(new ApiError('No .seqr file uploaded.', 400));
    if (!req.user || !req.user.id) return next(new ApiError('User not authenticated.', 401));
    const newSequence = await sequenceService.createSequenceAndUploadFile(req.user.id, req.file, req.body);
    res.status(201).json({ status: 'success', data: { sequence: newSequence } });
  } catch (error) { next(error); }
};

exports.getUserSequences = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) return next(new ApiError('User not authenticated.', 401));
    const { page, limit } = req.query; // Joi validation in routes provides defaults
    const result = await sequenceService.findUserSequences(req.user.id, { page, limit });
    res.status(200).json({ status: 'success', data: result });
  } catch (error) { next(error); }
};

exports.getSequenceById = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) return next(new ApiError('User not authenticated.', 401));
    const sequenceId = req.params.id; // Joi validation ensures it's a number
    const sequence = await sequenceService.findSequenceByIdForUser(sequenceId, req.user.id);
    if (!sequence) return next(new ApiError('Sequence not found or access denied.', 404));
    res.status(200).json({ status: 'success', data: { sequence } });
  } catch (error) { next(error); }
};

exports.updateSequenceMetadata = async (req, res, next) => {
  try {
    const sequenceId = req.params.id; // Joi validated
    if (!req.user || !req.user.id) return next(new ApiError('User not authenticated.', 401));
    if (Object.keys(req.body).length === 0) return next(new ApiError('Request body cannot be empty for update.', 400));
    
    const updatedSequence = await sequenceService.updateSequenceMetadataByUser(sequenceId, req.user.id, req.body);
    res.status(200).json({ status: 'success', data: { sequence: updatedSequence } });
  } catch (error) { next(error); }
};

exports.deleteSequence = async (req, res, next) => {
  try {
    const sequenceId = req.params.id; // Joi validated
    if (!req.user || !req.user.id) return next(new ApiError('User not authenticated.', 401));
    
    await sequenceService.deleteSequenceByUser(sequenceId, req.user.id);
    res.status(204).send();
  } catch (error) { next(error); }
};

exports.downloadSequenceFile = async (req, res, next) => {
  try {
    const sequenceId = req.params.id; // Joi already validated this is a number
    const userId = req.user.id; // From protect middleware

    const { fileBuffer, filename, mimetype } = await sequenceService.getSequenceFileForDownload(sequenceId, userId);

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`); // Ensure filename is quoted
    res.setHeader('Content-Type', mimetype);
    res.send(fileBuffer);
  } catch (error) {
    next(error);
  }
};