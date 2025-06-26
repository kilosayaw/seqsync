// SEGSYNC/backend/middleware/uploadMiddleware.js
console.log('--- uploadMiddleware.js: STARTING TO LOAD ---');

const multer = require('multer');
// const path = require('path'); // Not strictly needed for memoryStorage filename generation
const ApiError = require('../utils/ApiError');

const memoryStorage = multer.memoryStorage();
console.log('--- uploadMiddleware.js: multer.memoryStorage() created ---');

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/json' || file.originalname.toLowerCase().endsWith('.seqr')) {
    cb(null, true);
  } else {
    cb(new ApiError('Upload failed: Only .seqr (JSON) files are allowed.', 400), false);
  }
};
console.log('--- uploadMiddleware.js: fileFilter defined ---');

const upload = multer({
  storage: memoryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10 MB limit
    files: 1,
  },
});
console.log('--- uploadMiddleware.js: multer instance "upload" configured ---');
if (typeof upload.single !== 'function') {
    console.error('--- uploadMiddleware.js: CRITICAL - upload.single IS NOT A FUNCTION before export! ---');
}

const exportObject = {
  uploadSeqrFile: upload,
};
console.log('--- uploadMiddleware.js: OBJECT TO EXPORT ---', exportObject && typeof exportObject.uploadSeqrFile);
if (!exportObject.uploadSeqrFile) {
    console.error('--- uploadMiddleware.js: CRITICAL - exportObject.uploadSeqrFile is undefined/null before export! ---');
} else if (typeof exportObject.uploadSeqrFile.single !== 'function') {
    console.error('--- uploadMiddleware.js: CRITICAL - exportObject.uploadSeqrFile.single IS NOT A FUNCTION before export! ---');
}

module.exports = exportObject;
console.log('--- uploadMiddleware.js: MODULE EXPORTED ---');