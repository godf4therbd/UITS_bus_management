import { messaging } from '../config/firebase';
import { getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { toast } from 'sonner';

// VAPID key for web push notifications
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || 'BP3um_XHbkoxZWT2rk837Vr6xsZx2rrpZJzl62WnlxVKFQNmDmedWJKvC1RbjP_Hufs3kpp8QZrlR7KEP2F3wYc';

/**
 * Request notification permission and get FCM token
 */
export async function requestNotificationPermission(): Promise<string | null> {
  if (!messaging) {
    console.warn('Firebase Messaging is not available');
    return null;
  }

  try {
    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      // Get registration token
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      
      if (token) {
        console.log('FCM Token:', token);
        // Store token in localStorage
        localStorage.setItem('fcm_token', token);
        return token;
      } else {
        console.warn('No registration token available.');
        return null;
      }
    } else {
      console.warn('Notification permission denied.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
}

/**
 * Get stored FCM token
 */
export function getStoredToken(): string | null {
  return localStorage.getItem('fcm_token');
}

/**
 * Listen for foreground messages
 */
export function onMessageListener(): Promise<MessagePayload> {
  return new Promise((resolve) => {
    if (!messaging) {
      console.warn('Firebase Messaging is not available');
      return;
    }

    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
      // Show notification toast
      if (payload.notification) {
        toast.info(payload.notification.title || 'New Notification', {
          description: payload.notification.body,
          duration: 5000,
        });
      }

      resolve(payload);
    });
  });
}

/**
 * Initialize Firebase Messaging
 */
export async function initializeFirebaseMessaging(): Promise<void> {
  if (!messaging) {
    console.warn('Firebase Messaging is not available');
    return;
  }

  // Check if token already exists
  const existingToken = getStoredToken();
  
  if (!existingToken) {
    // Request permission and get token
    const token = await requestNotificationPermission();
    if (token) {
      // Store token with user info if logged in
      const userStr = localStorage.getItem('current_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const { storeUserFCMToken } = await import('./firebaseNotificationSender');
          // Store bus number if user is a student
          const busNumber = user.role === 'student' ? (user.busNumber || null) : undefined;
          storeUserFCMToken(user.id || user.username, user.role, token, busNumber);
        } catch (error) {
          console.error('Error storing user FCM token:', error);
        }
      }
    }
  }

  // Set up message listener for foreground messages
  onMessageListener().catch((error) => {
    console.error('Error setting up message listener:', error);
  });
}

