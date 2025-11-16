/**
 * Example Backend Server for Firebase Cloud Messaging
 * 
 * This is a simple Express.js server that handles FCM notification sending.
 * 
 * Setup:
 * 1. npm install express firebase-admin cors
 * 2. Get service account key from Firebase Console
 * 3. Update serviceAccount path below
 * 4. Run: node backend-example.js
 */

const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const path = require('path');

// Load service account key
// Download from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key
const serviceAccount = require('./serviceAccountKey.json'); // Update this path

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FCM Backend is running' });
});

// Send notification endpoint
app.post('/api/notifications/send', async (req, res) => {
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

    res.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      invalidTokens: invalidTokens,
      message: `Sent to ${response.successCount} device(s), ${response.failureCount} failed`,
    });
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    res.status(500).json({ 
      error: 'Failed to send notification',
      message: error.message 
    });
  }
});

// Send to single device (alternative endpoint)
app.post('/api/notifications/send-single', async (req, res) => {
  const { token, notification, data } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: data ? Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, String(value)])
      ) : {},
      token: token,
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent:', response);

    res.json({ success: true, messageId: response });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get topic subscription (for future use)
app.post('/api/notifications/subscribe-topic', async (req, res) => {
  const { tokens, topic } = req.body;

  if (!tokens || !Array.isArray(tokens) || !topic) {
    return res.status(400).json({ error: 'tokens and topic are required' });
  }

  try {
    const response = await admin.messaging().subscribeToTopic(tokens, topic);
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 FCM Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Ready to send notifications!`);
  console.log(`\nEndpoints:`);
  console.log(`  POST /api/notifications/send - Send to multiple devices`);
  console.log(`  POST /api/notifications/send-single - Send to single device`);
  console.log(`  GET  /api/health - Health check`);
});

