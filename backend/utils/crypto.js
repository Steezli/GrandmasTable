const crypto = require('crypto');

/**
 * Generate a cryptographically secure random slug for public recipe sharing
 * @returns {string} 32-character hex string
 */
function generatePublicSlug() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generate a random invite code for family invitations
 * @returns {string} 32-character hex string
 */
function generateInviteCode() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = {
  generatePublicSlug,
  generateInviteCode
};

