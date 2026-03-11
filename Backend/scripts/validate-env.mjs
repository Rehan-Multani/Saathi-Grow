import '../src/config/env.js';
import { validateRuntimeEnv, printEnvValidationSummary } from '../src/config/validateEnv.js';

try {
  const summary = validateRuntimeEnv();
  printEnvValidationSummary(summary);
} catch (error) {
  console.error(`[ENV] Validation failed: ${error.message}`);
  process.exit(1);
}
