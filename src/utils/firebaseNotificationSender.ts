/**
 * Utility functions to send push notifications via Firebase Cloud Messaging
 * 
 * Note: In a production app, these functions would call your backend API,
 * which would then use Firebase Admin SDK to send notifications.
 * This is a client-side helper for demonstration purposes.
 */

import { getStoredToken } from './firebaseMessaging';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

/**
 * Store FCM tokens for users with bus number information
 * In production, this should be sent to your backend and stored in a database
 */
export function storeUserFCMToken(
  userId: string, 
  userRole: string, 
  token: string, 
  busNumber?: string
) {
  const tokens = JSON.parse(localStorage.getItem('fcm_user_tokens') || '{}');
  tokens[userId] = {
    token,
    role: userRole,
    busNumber: busNumber || null,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem('fcm_user_tokens', JSON.stringify(tokens));
  
  // Also store in Firestore if available
  if (db && userRole === 'student') {
    storeFCMTokenInFirestore(userId, token, busNumber).catch(console.error);
  }
}

/**
 * Store FCM token in Firestore for students
 */
async function storeFCMTokenInFirestore(
  userId: string,
  token: string,
  busNumber?: string
): Promise<void> {
  if (!db) return;

  try {
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    const tokenRef = doc(db, 'fcm_tokens', userId);
    await setDoc(tokenRef, {
      userId,
      token,
      busNumber: busNumber || null,
      role: 'student',
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error storing FCM token in Firestore:', error);
  }
}

/**
 * Get all stored FCM tokens
 * In production, this would fetch from your backend
 */
export function getAllFCMTokens(): Record<string, { token: string; role: string; timestamp: string }> {
  return JSON.parse(localStorage.getItem('fcm_user_tokens') || '{}');
}

/**
 * Get FCM tokens for a specific role
 */
export function getFCMTokensByRole(role: string): string[] {
  const tokens = getAllFCMTokens();
  return Object.values(tokens)
    .filter((user) => user.role === role)
    .map((user) => user.token);
}

/**
 * Get FCM tokens for a specific bus
 * Gets tokens from both localStorage and Firestore
 */
export async function getFCMTokensForBus(busNumber: string): Promise<string[]> {
  const tokens: string[] = [];
  
  // Get from localStorage
  const localTokens = getAllFCMTokens();
  Object.values(localTokens)
    .filter((user) => user.role === 'student' && (user.busNumber === busNumber || !user.busNumber))
    .forEach((user) => {
      if (user.token && !tokens.includes(user.token)) {
        tokens.push(user.token);
      }
    });

  // Get from Firestore if available
  if (db) {
    try {
      const tokensRef = collection(db, 'fcm_tokens');
      const q = query(
        tokensRef,
        where('role', '==', 'student'),
        where('busNumber', '==', busNumber)
      );
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.token && !tokens.includes(data.token)) {
          tokens.push(data.token);
        }
      });
    } catch (error) {
      console.error('Error getting FCM tokens from Firestore:', error);
    }
  }

  return tokens;
}

/**
 * Get FCM tokens for all students (when sending to all buses)
 */
export async function getAllStudentFCMTokens(): Promise<string[]> {
  const tokens: string[] = [];
  
  // Get from localStorage
  const localTokens = getAllFCMTokens();
  Object.values(localTokens)
    .filter((user) => user.role === 'student')
    .forEach((user) => {
      if (user.token && !tokens.includes(user.token)) {
        tokens.push(user.token);
      }
    });

  // Get from Firestore if available
  if (db) {
    try {
      const tokensRef = collection(db, 'fcm_tokens');
      const q = query(tokensRef, where('role', '==', 'student'));
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.token && !tokens.includes(data.token)) {
          tokens.push(data.token);
        }
      });
    } catch (error) {
      console.error('Error getting FCM tokens from Firestore:', error);
    }
  }

  return tokens;
}

/**
 * Prepare notification data for Firebase
 * In production, this would be sent to your backend which uses Firebase Admin SDK
 */
export function prepareNotificationData(
  message: string,
  busNumber: string,
  adminName: string
) {
  return {
    notification: {
      title: `Bus ${busNumber} Update`,
      body: message,
    },
    data: {
      busNumber,
      message,
      adminName,
      timestamp: new Date().toISOString(),
      click_action: window.location.origin,
    },
  };
}

/**
 * Example: How to send notification from backend
 * 
 * This is what your backend would do using Firebase Admin SDK:
 * 
 * ```javascript
 * const admin = require('firebase-admin');
 * 
 * async function sendNotificationToUsers(userTokens, notificationData) {
 *   const message = {
 *     notification: notificationData.notification,
 *     data: notificationData.data,
 *     tokens: userTokens, // Array of FCM tokens
 *   };
 * 
 *   try {
 *     const response = await admin.messaging().sendMulticast(message);
 *     console.log('Successfully sent message:', response);
 *   } catch (error) {
 *     console.error('Error sending message:', error);
 *   }
 * }
 * ```
 */

