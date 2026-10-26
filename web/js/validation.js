/**
 * validation.js - Phase 3 Client-Side Form Validation Rules
 */

const Validation = {
  /**
   * Validates username rules:
   * 1. Non-null and non-empty
   * 2. Cannot consist of whitespace only
   */
  validateUsername(username) {
    if (!username || username.trim().length === 0) {
      return "Username cannot be empty.";
    }
    return null; // Valid
  },

  /**
   * Validates password rules:
   * 1. Non-null and non-empty
   * 2. Minimum length of 6 characters
   */
  validatePassword(password) {
    if (!password || password.trim().length === 0) {
      return "Password cannot be empty.";
    }
    if (password.trim().length < 6) {
      return "Password must be at least 6 characters long.";
    }
    return null; // Valid
  },

  /**
   * Checks if password and confirm password match
   */
  validatePasswordMatch(password, confirmPassword) {
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    return null; // Valid
  }
};