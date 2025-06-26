// SEGSYNC/backend/middleware/errorMiddleware.js
const ApiError = require('../utils/ApiError');

const handleDuplicateFieldsDB = (err) => {
  const match = err.detail && err.detail.match(/Key \(([^)]+)\)=\(([^)]+)\) already exists./);
  let message = 'Duplicate field value. Please use another value!';
  if (match && match[1] && match[2]) {
    const field = match[1];
    const value = match[2];
    message = `Duplicate value: "${value}" for field "${field}". Please use another value!`;
  } else if (err.constraint && err.detail) {
    message = `A database constraint was violated: ${err.constraint}. ${err.detail.substring(0, 200)}`; // Limit detail length
  } else if (err.constraint) {
    message = `A database constraint was violated: ${err.constraint}.`;
  }
  return new ApiError(message, 400); // Bad Request or 409 Conflict
};

const handleJWTError = () => new ApiError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = () => new ApiError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, req, res) => {
  console.error('💥 DEVELOPMENT ERROR 💥', err);
  res.status(err.statusCode).json({
    status: err.status,
    error: { ...err, name: err.name, message: err.message }, // Send more info in dev
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('💥 PRODUCTION ERROR (UNHANDLED) 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong on the server!',
    });
  }
};

const errorHandler = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) { // If not an ApiError, wrap it or treat as 500
      console.error("Non-ApiError caught by errorHandler:", err);
      error = new ApiError(err.message || 'An unexpected server error occurred.', err.statusCode || 500);
      error.isOperational = false; // Treat unexpected errors as non-operational for prod logging
  }
  
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';


  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let operationalError = { ...error }; // Clone for modification

    if (operationalError.code === '23505') operationalError = handleDuplicateFieldsDB(operationalError);
    if (operationalError.name === 'JsonWebTokenError') operationalError = handleJWTError();
    if (operationalError.name === 'TokenExpiredError') operationalError = handleJWTExpiredError();
    // Add more specific production error handlers here

    sendErrorProd(operationalError, req, res);
  } else {
    console.error('💥 ERROR (unknown NODE_ENV) 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'An critical unexpected error occurred.',
    });
  }
};

module.exports = { errorHandler };