import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ecommerce_secret_jwt_key_2025_safe_and_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a signed JWT token for a user
 * @param {Object} payload - Token payload ({ id, role, email, name })
 * @param {string} [expiresIn] - Optional custom expiration
 * @returns {string} Signed JWT token string
 */
export const generateToken = (payload, expiresIn = JWT_EXPIRES_IN) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn
  });
};

/**
 * Verify and decode a JWT token
 * @param {string} token - Raw JWT string
 * @returns {Object} Decoded payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
