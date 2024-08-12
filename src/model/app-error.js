/**
 * Represents an error related to the service's operations.
 * @class
 * @extends Error
 */
class ApplicationError extends Error {
    /**
     * Creates an instance of ApplicationError.
     * @param {number} status - The HTTP status code related to the error.
     * @param {string} message - The error message.
     */
    constructor(status, message) {
      super(message);
      this.status = status;
    }
  }
  
  module.exports.ApplicationError = ApplicationError;
  