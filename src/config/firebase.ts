import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, Messaging } from 'firebase/messaging';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { logger } from '../utils/logger';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp = undefined!;
let messaging: Messaging | null = null;
let analytics: Analytics | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (typeof window !== 'undefined') {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

  try { db = getFirestore(app); } catch (e) { logger.error('Firestore init error:', e); }
  try { auth = getAuth(app); } catch (e) { logger.error('Auth init error:', e); }
  if ('serviceWorker' in navigator) {
    try { messaging = getMessaging(app); } catch (e) { logger.error('Messaging init error:', e); }
  }
  try { analytics = getAnalytics(app); } catch (e) { logger.error('Analytics init error:', e); }
}

export { app, messaging, analytics, db, auth };
export default app;
