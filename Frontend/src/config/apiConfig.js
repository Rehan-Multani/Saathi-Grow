export const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  // Warn in development if the API base URL is not configured
  // so that misconfiguration is caught early.
  // eslint-disable-next-line no-console
  console.warn(
    'VITE_API_URL is not set. API requests may fail because API_BASE_URL is undefined.'
  );
}

