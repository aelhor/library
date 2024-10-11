class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = "Error";
    this.isOperational = true; // Mark as an operational error (vs. programming error)

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
