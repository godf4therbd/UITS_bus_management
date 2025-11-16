# Firebase Cloud Messaging (FCM) Notification Setup

## Overview

The system is now configured to send push notifications to students via Firebase Cloud Messaging when Super Admin, Moderator, or Admin send notifications.

## How It Works

1. **Student Registration/Login**: When students register or log in, their FCM token is stored with their bus number
2. **Notification Sending**: When admins send notifications, the system:
   - Gets FCM tokens for the target bus(es)
   - Sends push notifications via backend API
   - Also saves to localStorage for in-app display

## Current Status

✅ **Frontend is ready** - All dashboards are configured to send FCM notifications
⚠️ **Backend API needed** - You need to create a backend endpoint to actually send notifications

## Backend Setup Required

### Option 1: Use Mock Mode (Development Only)

For testing without a backend, add to your `.env` file:

```env
VITE_USE_MOCK_FCM=true
```

This will log notifications to console instead of sending them.

### Option 2: Create Backend API (Production)

You need to create a backend endpoint that uses Firebase Admin SDK to send notifications.

#### Step 1: Install Firebase Admin SDK

```bash
npm install firebase-admin
```

#### Step 2: Get Service Account Key

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file securely (don't commit to git!)

#### Step 3: Create Backend Endpoint

**Node.js/Express Example:**

```javascript
const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(express.json());

// Endpoint to send notifications
app.post('/api/notifications/send', async (req, res) => {
  const { tokens, notification, data } = req.body;

  if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
    return res.status(400).json({ error: 'No tokens provided' });
  }

  try {
    // Send to multiple devices
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        ...data,
        // Convert all data values to strings (FCM requirement)
        ...Object.fromEntries(
          Object.entries(data).map(([key, value]) => [key, String(value)])
        ),
      },
      tokens: tokens, // Array of FCM tokens
    };

    const response = await admin.messaging().sendMulticast(message);
    
    console.log(`Successfully sent ${response.successCount} notifications`);
    console.log(`Failed: ${response.failureCount}`);

    res.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
```

#### Step 4: Update Environment Variables

Add to your `.env` file:

```env
VITE_BACKEND_API_URL=http://localhost:3001/api
```

Or for production:

```env
VITE_BACKEND_API_URL=https://your-backend-domain.com/api
```

## Testing

### 1. Test FCM Token Storage

1. Register a student or log in as a student
2. Grant notification permission when prompted
3. Check browser console for: "FCM Token: ..."
4. Check Firestore → `fcm_tokens` collection (should see the token)

### 2. Test Notification Sending

1. Log in as Super Admin, Moderator, or Admin
2. Go to Notifications tab
3. Select a bus (or "All Buses")
4. Type a message and click "Send Notification"
5. Check:
   - Browser console for FCM sending logs
   - Firebase Console → Cloud Messaging → See sent messages
   - Student devices should receive push notifications

### 3. Verify in Firebase Console

- **Authentication** → Users: Should see all users
- **Firestore** → `fcm_tokens`: Should see tokens with bus numbers
- **Cloud Messaging**: Should see notification history

## Data Flow

```
Admin/Moderator sends notification
    ↓
Get FCM tokens for target bus(es) from Firestore/localStorage
    ↓
Call backend API with tokens and notification data
    ↓
Backend uses Firebase Admin SDK to send push notifications
    ↓
Students receive push notifications on their devices
    ↓
Notification also saved to localStorage for in-app display
```

## FCM Token Storage

FCM tokens are stored in two places:

1. **localStorage** (`fcm_user_tokens`): For quick access
2. **Firestore** (`fcm_tokens` collection): For backend queries

Each token includes:
- `userId`: User ID
- `token`: FCM token
- `busNumber`: Bus assignment (for students)
- `role`: User role
- `updatedAt`: Last update timestamp

## Troubleshooting

### Problem: "No FCM tokens found"
**Solution:**
- Make sure students have granted notification permission
- Check that FCM tokens are stored in Firestore
- Verify students are assigned to buses

### Problem: Backend API not responding
**Solution:**
- Check backend server is running
- Verify `VITE_BACKEND_API_URL` is correct
- Check CORS settings on backend
- Use mock mode for testing: `VITE_USE_MOCK_FCM=true`

### Problem: Notifications not received
**Solution:**
- Check browser console for errors
- Verify FCM tokens are valid
- Check Firebase Console → Cloud Messaging for errors
- Make sure service worker is registered
- Verify notification permission is granted

### Problem: "Firebase Admin SDK" errors
**Solution:**
- Make sure service account key is correct
- Verify Firebase Admin is initialized
- Check backend logs for detailed errors

## Security Notes

1. **Never commit service account keys** to git
2. **Use environment variables** for sensitive data
3. **Set up proper CORS** on backend
4. **Add authentication** to backend endpoints
5. **Validate tokens** before sending notifications

## Next Steps

1. Set up backend API endpoint
2. Test notification sending
3. Monitor notification delivery rates
4. Set up error handling and retry logic
5. Add notification analytics

## Quick Reference

**Environment Variables:**
```env
VITE_BACKEND_API_URL=http://localhost:3001/api
VITE_USE_MOCK_FCM=true  # For development without backend
```

**Backend Endpoint:**
```
POST /api/notifications/send
Body: {
  tokens: string[],
  notification: { title: string, body: string },
  data: { busNumber: string, message: string, ... }
}
```

**Firestore Collections:**
- `fcm_tokens`: Stores FCM tokens with bus numbers
- `students`: Student data with bus assignments
- `users`: All user data

