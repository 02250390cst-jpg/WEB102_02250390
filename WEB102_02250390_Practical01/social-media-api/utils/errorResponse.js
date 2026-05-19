class ErrorResponse extends Error {
  constructor(message, statusCode = 500) {
    super(message);

    this.name = 'ErrorResponse';
    this.statusCode = statusCode;

    // Maintains proper stack trace for where the error was thrown (only on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ErrorResponse);
    }
  }
}

module.exports = ErrorResponse;
