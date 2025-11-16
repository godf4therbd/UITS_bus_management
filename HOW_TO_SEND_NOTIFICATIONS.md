# How to Send Firebase Push Notifications

## Current Status

✅ **Receiving notifications is ready** - The app can receive and display push notifications
❌ **Sending notifications requires a backend** - Client-side apps cannot directly send FCM notifications

## Option 1: Test with Firebase Console (No Backend Needed)

You can test push notifications right now using Firebase Console:

1. **Get FCM Token:**
   - Start your app: `npm run dev`
   - Log in to any account
   - Open browser console (F12)
   - Look for: `FCM Token: [your-token-here]`
   - Copy the token

2. **Send Test Notification:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `uits-bus-management-system`
   - Go to **Cloud Messaging** in the left menu
   - Click **"Send your first message"** or **"New campaign"**
   - Enter notification title and text
   - Click **"Send test message"**
   - Paste your FCM token
   - Click **"Test"**

3. **You should see the notification appear!**

## Option 2: Set Up Backend (For Production)

To send notifications programmatically from your app, you need a backend server.

### Step 1: Create Backend API

Create a Node.js/Express backend with Firebase Admin SDK:

```bash
npm install firebase-admin express cors
```

### Step 2: Get Service Account Key

1. Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file (keep it secure!)

### Step 3: Backend Code Example

```javascript
// server.js
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Endpoint to send notifications
app.post('/api/notifications/send', async (req, res) => {
  const { tokens, notification, data } = req.body;

  try {
    const message = {
      notification,
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      tokens, // Array of FCM tokens
    };

    const response = await admin.messaging().sendMulticast(message);
    res.json({ 
      success: true, 
      successCount: response.successCount,
      failureCount: response.failureCount
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Backend server running on http://localhost:3001');
});
```

### Step 4: Update Frontend

1. Create `.env` file with:
   ```env
   VITE_BACKEND_API_URL=http://localhost:3001/api
   ```

2. The `sendFirebaseNotification` function in `src/utils/sendFirebaseNotification.ts` will automatically use this URL

## Option 3: Use Firebase Functions (Serverless)

You can also use Firebase Cloud Functions to send notifications:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize Functions: `firebase init functions`
3. Create a Cloud Function that sends notifications
4. Call the function from your frontend

## Current Implementation

Right now, the notification system:
- ✅ Stores notifications in localStorage
- ✅ Displays them in the UI
- ✅ Can receive Firebase push notifications
- ⚠️ Sending still uses localStorage (not real push)

## Next Steps

1. **For Testing:** Use Firebase Console to send test notifications
2. **For Production:** Set up a backend with Firebase Admin SDK
3. **Update notification functions:** Replace localStorage sending with `sendFirebaseNotification()` calls

Would you like me to:
- Create a simple backend server example?
- Update the notification sending functions to use Firebase?
- Set up Firebase Cloud Functions?

