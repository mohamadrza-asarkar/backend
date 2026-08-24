import bcrypt from 'bcryptjs';

/**
 * Hash a plain password using bcrypt with configurable salt rounds
 * @param {string} password - Plain text password
 * @param {number} [rounds=10] - Number of salt rounds
 * @returns {Promise<string>} Password hash
 */
export const hashPassword = async (password, rounds = 10) => {
  const salt = await bcrypt.genSalt(rounds);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare a plain password against a bcrypt hash
 * @param {string} password - Plain text password
 * @param {string} hash - Bcrypt hash from database
 * @returns {Promise<boolean>} True if matched
 */
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
