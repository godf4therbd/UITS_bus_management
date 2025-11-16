# Firebase Configuration

## Your Firebase App ID
```
1:374309687203:web:6388c62b751c7d8b81d416
```

## Required Configuration Values

To complete the Firebase setup, you need to get the following values from your Firebase Console:

1. **API Key** - Found in Firebase Console > Project Settings > General > Your apps
2. **Auth Domain** - Usually: `your-project-id.firebaseapp.com`
3. **Project ID** - Your Firebase project ID
4. **Storage Bucket** - Usually: `your-project-id.appspot.com`
5. **Messaging Sender ID** - Found in Project Settings
6. **Measurement ID** (optional) - For Analytics, found in Project Settings

## How to Get Your Firebase Config

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. Click on your web app (or add one if you haven't)
7. You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "374309687203", // This matches your App ID prefix
  appId: "1:374309687203:web:6388c62b751c7d8b81d416",
  measurementId: "G-XXXXXXXXXX"
};
```

## Setup Steps

1. **Create `.env` file** in the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=374309687203
VITE_FIREBASE_APP_ID=1:374309687203:web:6388c62b751c7d8b81d416
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key_here
```

2. **Update `public/firebase-messaging-sw.js`** with your complete Firebase config (service workers can't use env variables)

3. **Get VAPID Key**:
   - Firebase Console > Project Settings > Cloud Messaging
   - Scroll to "Web Push certificates"
   - Generate or copy your VAPID key

4. **Enable Cloud Messaging API**:
   - [Google Cloud Console](https://console.cloud.google.com/)
   - Select your Firebase project
   - APIs & Services > Library
   - Search "Firebase Cloud Messaging API" and enable it

## Quick Test

After configuration:
1. Run `npm run dev`
2. Open browser console
3. Look for "FCM Token:" in the console
4. Use that token in Firebase Console > Cloud Messaging > Send test message

