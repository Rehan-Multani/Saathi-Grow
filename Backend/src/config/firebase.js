import admin from 'firebase-admin';

// Firebase initialization using Environment Variables safely.
// Important: In some deployments FIREBASE_PROJECT_ID may be missing/misconfigured.
// If we throw during module import, the whole API crashes => nginx 502.
let firebaseApp = null;

const requiredKeys = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_DATABASE_URL',
];

const isFirebaseConfigPresent = requiredKeys.every((k) => {
  const v = process.env[k];
  return typeof v === 'string' && v.trim().length > 0;
});

if (isFirebaseConfigPresent) {
  try {
    const serviceAccount = {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace escaped \n with actual newlines in private key
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, ''),
    };

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  } catch (err) {
    console.error('[FIREBASE] Failed to initialize firebase-admin:', err?.message || err);
    firebaseApp = null;
  }
} else {
  console.warn('[FIREBASE] Config missing. Push notifications disabled.');
}

export const isFirebaseInitialized = Boolean(firebaseApp);
export const db = firebaseApp ? admin.database(firebaseApp) : null;
export { admin };
