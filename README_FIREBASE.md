# Firebase Push Notifications - Quick Start

## Files Created

1. **`src/config/firebase.ts`** - Firebase initialization and configuration
2. **`src/utils/firebaseMessaging.ts`** - Firebase Cloud Messaging utilities
3. **`src/hooks/useFirebaseMessaging.ts`** - React hook for Firebase messaging
4. **`src/utils/firebaseNotificationSender.ts`** - Helper functions for notification sending
5. **`public/firebase-messaging-sw.js`** - Service worker for background notifications
6. **`.env.example`** - Environment variables template

## Quick Setup Steps

1. **Get Firebase Config:**
   - Go to Firebase Console > Project Settings > General
   - Copy your web app configuration

2. **Create `.env` file:**
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_VAPID_KEY=your_vapid_key
   ```

3. **Update Service Worker:**
   - Edit `public/firebase-messaging-sw.js`
   - Replace placeholder values with your Firebase config

4. **Enable Cloud Messaging API:**
   - Google Cloud Console > APIs & Services > Enable "Firebase Cloud Messaging API"

## How It Works

- **Automatic Token Generation:** When users log in, the app automatically requests notification permission and generates an FCM token
- **Foreground Messages:** Handled by `onMessageListener()` - shows toast notifications
- **Background Messages:** Handled by service worker - shows browser notifications
- **Token Storage:** FCM tokens are stored in localStorage (in production, send to your backend)

## Testing

1. Start the app: `npm run dev`
2. Log in to any account
3. Check browser console for FCM token
4. Use Firebase Console to send a test notification

## Next Steps for Production

1. Create a backend API endpoint to send notifications using Firebase Admin SDK
2. Store FCM tokens in your database instead of localStorage
3. Update notification sending functions to call your backend API
4. Implement token refresh handling
5. Add error handling and retry logic

For detailed setup instructions, see `FIREBASE_SETUP.md`

