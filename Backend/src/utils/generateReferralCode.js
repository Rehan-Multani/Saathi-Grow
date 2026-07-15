import User from '../models/User.js';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generate a random alphanumeric referral code (8 chars, no ambiguous 0/O/1/I).
 */
export const generateReferralCode = (length = 8) => {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
};

/**
 * Assign a unique referralCode to user if missing. Mutates and saves when needed.
 * @param {import('mongoose').Document} user
 * @returns {Promise<string>}
 */
export const ensureUserReferralCode = async (user) => {
  if (user.referralCode) return user.referralCode;

  let code;
  let exists = true;
  for (let attempt = 0; attempt < 10 && exists; attempt++) {
    code = generateReferralCode();
    exists = !!(await User.exists({ referralCode: code }));
  }

  if (exists) {
    throw new Error('Could not generate unique referral code');
  }

  user.referralCode = code;
  await user.save();
  return code;
};
