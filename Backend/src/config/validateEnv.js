const CORE_REQUIRED_VARS = ['MONGO_URI', 'JWT_SECRET'];

const RECOMMENDED_VARS = [
  'CLIENT_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'GOOGLE_MAPS_API',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_DATABASE_URL',
];

const collectMissingVars = (vars) =>
  vars.filter((name) => !process.env[name] || String(process.env[name]).trim() === '');

export const validateRuntimeEnv = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const strictValidation =
    process.env.STRICT_ENV_VALIDATION === 'true' ||
    nodeEnv === 'production' ||
    nodeEnv === 'staging';

  const missingCore = collectMissingVars(CORE_REQUIRED_VARS);
  const missingRecommended = collectMissingVars(RECOMMENDED_VARS);

  if (missingCore.length > 0) {
    const message = `[ENV] Missing required variables: ${missingCore.join(', ')}`;
    if (strictValidation) {
      throw new Error(message);
    }
    console.warn(`${message}. Continuing in non-strict mode.`);
  }

  if (missingRecommended.length > 0) {
    console.warn(`[ENV] Missing recommended variables: ${missingRecommended.join(', ')}`);
  }

  return { missingCore, missingRecommended, strictValidation };
};

export const printEnvValidationSummary = (summary) => {
  const mode = summary.strictValidation ? 'strict' : 'non-strict';
  if (summary.missingCore.length === 0) {
    console.log(`[ENV] Validation passed in ${mode} mode.`);
    return;
  }

  console.warn(
    `[ENV] Validation completed in ${mode} mode with missing core vars: ${summary.missingCore.join(', ')}`
  );
};
