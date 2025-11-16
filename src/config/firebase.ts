import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAefPkb2UvOkQnMHq9JBSU9VvtXb_a_GvU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "uits-bus-management-system.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "uits-bus-management-system",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "uits-bus-management-system.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "374309687203",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:374309687203:web:6388c62b751c7d8b81d416",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-PTWM4N1ZCL"
};

// Initialize Firebase
let app: FirebaseApp;
let messaging: Messaging | null = null;
let analytics: Analytics | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (typeof window !== 'undefined') {
  // Initialize Firebase App
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  // Initialize Firestore
  try {
    db = getFirestore(app);
  } catch (error) {
    console.warn('Firebase Firestore initialization error:', error);
  }

  // Initialize Authentication
  try {
    auth = getAuth(app);
  } catch (error) {
    console.warn('Firebase Auth initialization error:', error);
  }

  // Initialize Firebase Cloud Messaging and get a reference to the service
  if ('serviceWorker' in navigator) {
    try {
      messaging = getMessaging(app);
    } catch (error) {
      console.warn('Firebase Messaging initialization error:', error);
    }
  }

  // Initialize Analytics (optional)
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Firebase Analytics initialization error:', error);
  }
}

export { app, messaging, analytics, db, auth };
export default app;

