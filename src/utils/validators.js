/**
 * Validates email format
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
exports.isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validates password strength
   * @param {string} password - The password to validate
   * @returns {boolean} - Whether the password meets requirements
   */
  exports.isStrongPassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
  };
  
  /**
   * Sanitizes input to prevent injection attacks
   * @param {string} input - The input to sanitize
   * @returns {string} - Sanitized input
   */
  exports.sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    // Basic sanitization by removing potential script tags
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .trim();
  };
  
  /**
   * Validates mongoose ID format
   * @param {string} id - The ID to validate
   * @returns {boolean} - Whether the ID has valid format
   */
  exports.isValidMongoId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };