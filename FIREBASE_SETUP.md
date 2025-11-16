# Firebase Setup Guide for Push Notifications

This guide will help you set up Firebase Cloud Messaging (FCM) for push notifications in the UITS Bus Management application.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

## Step 2: Add a Web App to Your Firebase Project

1. In your Firebase project, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon `</>` to add a web app
5. Register your app with a nickname (e.g., "UITS Bus Management")
6. Copy the Firebase configuration object

## Step 3: Get Your Firebase Configuration

After registering your web app, you'll see a configuration object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: "G-XXXXXXXXXX"
};
```

## Step 4: Generate VAPID Key for Web Push

1. In Firebase Console, go to **Project Settings** > **Cloud Messaging** tab
2. Scroll down to "Web Push certificates" section
3. Click "Generate key pair" if you don't have one
4. Copy the generated key pair (this is your VAPID key)

## Step 5: Configure Environment Variables

1. Create a `.env` file in the root of your project (copy from `.env.example`)
2. Add your Firebase configuration values:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key_here
```

## Step 6: Update Service Worker Configuration

1. Open `public/firebase-messaging-sw.js`
2. Replace the placeholder values in `firebaseConfig` with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your_actual_api_key",
  authDomain: "your_project_id.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project_id.appspot.com",
  messagingSenderId: "your_messaging_sender_id",
  appId: "your_app_id",
  measurementId: "your_measurement_id"
};
```

**Note:** Service workers cannot access environment variables directly, so you need to hardcode the config in the service worker file. For production, consider using a build script to inject these values.

## Step 7: Enable Cloud Messaging API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** > **Library**
4. Search for "Firebase Cloud Messaging API"
5. Click on it and enable the API

## Step 8: Test Push Notifications

1. Start your development server: `npm run dev`
2. Open the app in your browser
3. The app will automatically request notification permission
4. Check the browser console for the FCM token
5. You can use this token to send test notifications from Firebase Console

## Step 9: Send Test Notification from Firebase Console

1. Go to Firebase Console > **Cloud Messaging**
2. Click "Send your first message"
3. Enter notification title and text
4. Click "Send test message"
5. Enter the FCM token from your browser console
6. Click "Test"

## Troubleshooting

### Service Worker Not Registering
- Make sure you're running the app on `http://localhost` or `https://` (not `file://`)
- Check browser console for errors
- Verify `firebase-messaging-sw.js` is in the `public` folder

### Notifications Not Appearing
- Check browser notification permissions in settings
- Verify FCM token is generated (check console)
- Ensure service worker is registered and active
- Check that Firebase Cloud Messaging API is enabled

### CORS Errors
- Make sure your domain is added to Firebase authorized domains
- Go to Firebase Console > Authentication > Settings > Authorized domains

## Next Steps

After setup, you can:
- Send notifications from your backend using Firebase Admin SDK
- Store FCM tokens in your database to send targeted notifications
- Integrate with your existing notification system

## Security Notes

- Never commit your `.env` file to version control
- Keep your Firebase API keys secure
- Use Firebase Security Rules to protect your data
- Consider using Firebase App Check for additional security

