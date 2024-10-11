const AppError = require('../utils/AppError');

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  // Set a default status code if not provided
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Send error response
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined // Hide stack in production
  });
};

module.exports = errorHandler;
