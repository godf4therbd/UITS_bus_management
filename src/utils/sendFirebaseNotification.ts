/**
 * Send Firebase Cloud Messaging notification
 * 
 * Note: This function calls a backend API endpoint that uses Firebase Admin SDK.
 * You need to create a backend endpoint to actually send notifications.
 * 
 * For testing, you can use Firebase Console > Cloud Messaging to send test notifications.
 */

import { 
  getAllFCMTokens, 
  getFCMTokensForBus, 
  getFCMTokensByRole,
  getAllStudentFCMTokens 
} from './firebaseNotificationSender';

interface SendNotificationParams {
  message: string;
  busNumber?: string | string[]; // Can be single bus or array of buses
  targetRole?: 'student' | 'driver' | 'admin' | 'moderator' | 'super_admin' | 'all';
  title?: string;
  adminName?: string;
}

/**
 * Send notification via backend API
 * Replace this URL with your actual backend API endpoint
 * 
 * For development/testing without a backend, set VITE_USE_MOCK_FCM=true
 */
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_FCM === 'true';

export async function sendFirebaseNotification(params: SendNotificationParams): Promise<boolean> {
  const { message, busNumber, targetRole = 'student', title, adminName } = params;

  try {
    // Get FCM tokens based on target
    let tokens: string[] = [];
    
    if (busNumber) {
      // Handle array of bus numbers or single bus number
      if (Array.isArray(busNumber)) {
        // Get tokens for all specified buses
        const tokenPromises = busNumber.map(bus => getFCMTokensForBus(bus));
        const tokenArrays = await Promise.all(tokenPromises);
        tokens = tokenArrays.flat();
        // Remove duplicates
        tokens = [...new Set(tokens)];
      } else {
        // Single bus number
        tokens = await getFCMTokensForBus(busNumber);
      }
    } else if (targetRole === 'student') {
      // Get all student tokens (for "all buses" scenario)
      tokens = await getAllStudentFCMTokens();
    } else if (targetRole !== 'all') {
      tokens = getFCMTokensByRole(targetRole);
    } else {
      // Get all tokens
      const allTokens = getAllFCMTokens();
      tokens = Object.values(allTokens).map(user => user.token);
    }

    if (tokens.length === 0) {
      console.warn('No FCM tokens found for notification');
      return false;
    }

    console.log(`Sending FCM notification to ${tokens.length} device(s)`);

    // If using mock mode (for development without backend)
    if (USE_MOCK) {
      console.log('📱 [MOCK] FCM Notification would be sent:', {
        tokens: tokens.length,
        title: title || `Bus ${Array.isArray(busNumber) ? busNumber.join(', ') : busNumber || 'Update'}`,
        body: message,
      });
      return true;
    }

    // Call backend API to send notification
    // For Firebase Functions: use /sendNotification
    // For local backend: use /notifications/send
    const endpoint = BACKEND_API_URL.includes('cloudfunctions.net') 
      ? `${BACKEND_API_URL}/sendNotification`
      : `${BACKEND_API_URL}/notifications/send`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokens,
        notification: {
          title: title || `Bus ${Array.isArray(busNumber) ? busNumber.join(', ') : busNumber || 'Update'}`,
          body: message,
        },
        data: {
          busNumber: Array.isArray(busNumber) ? busNumber.join(',') : (busNumber || ''),
          message,
          adminName: adminName || 'Admin',
          timestamp: new Date().toISOString(),
          click_action: window.location.origin,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send notification: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ FCM notification sent successfully:', result);
    return true;
  } catch (error) {
    console.error('❌ Error sending Firebase notification:', error);
    // Don't throw - allow the notification to still be saved to localStorage
    return false;
  }
}

/**
 * Example backend endpoint code (Node.js/Express):
 * 
 * ```javascript
 * const admin = require('firebase-admin');
 * 
 * // Initialize Firebase Admin
 * const serviceAccount = require('./path/to/serviceAccountKey.json');
 * admin.initializeApp({
 *   credential: admin.credential.cert(serviceAccount)
 * });
 * 
 * // Endpoint to send notifications
 * app.post('/api/notifications/send', async (req, res) => {
 *   const { tokens, notification, data } = req.body;
 * 
 *   try {
 *     const message = {
 *       notification,
 *       data,
 *       tokens, // Array of FCM tokens
 *     };
 * 
 *     const response = await admin.messaging().sendMulticast(message);
 *     res.json({ success: true, response });
 *   } catch (error) {
 *     console.error('Error sending notification:', error);
 *     res.status(500).json({ error: error.message });
 *   }
 * });
 * ```
 */

