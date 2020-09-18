class ErrorResponse extends Error {
  // eslint-disable-next-line
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode

    Error.captureStackTrace(this, this.constructor)
  }
}

export default ErrorResponse
