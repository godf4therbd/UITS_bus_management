/**
 * Firebase Cloud Functions for FCM Notifications
 * 
 * Deploy: firebase deploy --only functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin (uses default credentials in Cloud Functions)
admin.initializeApp();

// CORS middleware
const cors = require('cors')({ origin: true });

/**
 * Send FCM notification to multiple devices
 * 
 * POST /sendNotification
 * Body: {
 *   tokens: string[],
 *   notification: { title: string, body: string },
 *   data: { busNumber: string, message: string, ... }
 * }
 */
exports.sendNotification = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  return cors(req, res, async () => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { tokens, notification, data } = req.body;

    // Validation
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({ 
        error: 'No tokens provided',
        message: 'tokens must be a non-empty array'
      });
    }

    if (!notification || !notification.title || !notification.body) {
      return res.status(400).json({ 
        error: 'Invalid notification data',
        message: 'notification must have title and body'
      });
    }

    try {
      console.log(`📱 Sending notification to ${tokens.length} device(s)`);
      console.log(`Title: ${notification.title}`);
      console.log(`Body: ${notification.body}`);

      // Prepare message for FCM
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          // Convert all data values to strings (FCM requirement)
          ...Object.fromEntries(
            Object.entries(data || {}).map(([key, value]) => [key, String(value)])
          ),
        },
        tokens: tokens, // Array of FCM tokens
        // Optional: Add Android and iOS specific options
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'bus_notifications',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      // Send to multiple devices
      const response = await admin.messaging().sendMulticast(message);
      
      console.log(`✅ Successfully sent: ${response.successCount}`);
      if (response.failureCount > 0) {
        console.log(`❌ Failed: ${response.failureCount}`);
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.error(`Token ${idx} failed:`, resp.error);
          }
        });
      }

      // Clean up invalid tokens
      const invalidTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error?.code === 'messaging/invalid-registration-token') {
          invalidTokens.push(tokens[idx]);
        }
      });

      return res.json({
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        invalidTokens: invalidTokens,
        message: `Sent to ${response.successCount} device(s), ${response.failureCount} failed`,
      });
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      return res.status(500).json({ 
        error: 'Failed to send notification',
        message: error.message 
      });
    }
  });
});

/**
 * Health check endpoint
 */
exports.health = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    res.json({ 
      status: 'ok', 
      message: 'FCM Cloud Function is running',
      timestamp: new Date().toISOString()
    });
  });
});

