# Firebase Console Setup for FCM (Firebase Cloud Messaging)

## Step-by-Step Guide

### Step 1: Access Firebase Console

1. Open your web browser
2. Go to: https://console.firebase.google.com/
3. Sign in with your Google account
4. Select your project: **uits-bus-management-system**

---

### Step 2: Enable Cloud Messaging API

1. In Firebase Console, click the **gear icon** ⚙️ next to "Project Overview"
2. Select **"Project Settings"**
3. Scroll down to the **"Cloud Messaging"** section
4. If you see "Cloud Messaging API (Legacy)" or "Cloud Messaging API (V1)", make sure it's enabled
5. If not enabled, click **"Enable"** or go to Google Cloud Console to enable it

**Alternative Method:**
1. Go to: https://console.cloud.google.com/
2. Select your project: **uits-bus-management-system**
3. Go to **"APIs & Services"** → **"Library"**
4. Search for **"Firebase Cloud Messaging API"**
5. Click on it and click **"Enable"**

---

### Step 3: Verify Web App Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **"Your apps"** section
3. Find your **Web app** (should show your App ID: `1:374309687203:web:6388c62b751c7d8b81d416`)
4. Click on the web app to view details
5. Verify the configuration matches your `.env` file:
   - API Key
   - Auth Domain
   - Project ID
   - Messaging Sender ID
   - App ID

---

### Step 4: Get VAPID Key (Web Push Certificate)

1. In Firebase Console, go to **Project Settings**
2. Click on the **"Cloud Messaging"** tab
3. Scroll down to **"Web configuration"** section
4. Look for **"Web Push certificates"**
5. If you see a key pair, copy the **"Key pair"** value
6. If you don't see one, click **"Generate key pair"**
7. Copy the generated key (this is your VAPID key)

**Your VAPID Key should be:**
```
BP3um_XHbkoxZWT2rk837Vr6xsZx2rrpZJzl62WnlxVKFQNmDmedWJKvC1RbjP_Hufs3kpp8QZrlR7KEP2F3wYc
```

**Verify in your `.env` file:**
```env
VITE_FIREBASE_VAPID_KEY=BP3um_XHbkoxZWT2rk837Vr6xsZx2rrpZJzl62WnlxVKFQNmDmedWJKvC1RbjP_Hufs3kpp8QZrlR7KEP2F3wYc
```

---

### Step 5: Verify Service Worker File

1. In Firebase Console, go to **Project Settings**
2. Click on **"Cloud Messaging"** tab
3. Scroll to **"Web Push certificates"** section
4. Make sure your service worker file exists at:
   ```
   public/firebase-messaging-sw.js
   ```

**Note:** The service worker file should already be in your project. Verify it exists and has the correct configuration.

---

### Step 6: Test Notification (Optional)

1. In Firebase Console, go to **"Cloud Messaging"** in the left sidebar
2. Click **"Send your first message"** or **"New notification"**
3. Fill in:
   - **Notification title**: Test Notification
   - **Notification text**: This is a test
4. Click **"Next"**
5. Select **"Web"** as the target
6. Click **"Send test message"**
7. Enter your FCM token (you can get it from browser console when app loads)
8. Click **"Test"**
9. You should receive a notification on your device!

---

### Step 7: View Notification History

1. In Firebase Console, go to **"Cloud Messaging"**
2. Click on **"Campaigns"** or **"History"** tab
3. You'll see all sent notifications
4. Click on a notification to see:
   - Delivery statistics
   - Open rates
   - Error details

---

### Step 8: Get Service Account Key (For Backend)

**This is needed only if you're setting up a backend server:**

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Click on **"Service Accounts"** tab
3. Click **"Generate New Private Key"**
4. A dialog will appear - click **"Generate Key"**
5. A JSON file will download - **SAVE THIS SECURELY**
6. **IMPORTANT**: 
   - Never commit this file to git
   - Add to `.gitignore`
   - Use this in your backend server

**File structure:**
```json
{
  "type": "service_account",
  "project_id": "uits-bus-management-system",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  ...
}
```

---

## Quick Checklist

Before testing FCM notifications, verify:

- [ ] Cloud Messaging API is enabled
- [ ] Web app is registered in Firebase Console
- [ ] VAPID key is configured (in `.env` file)
- [ ] Service worker file exists (`public/firebase-messaging-sw.js`)
- [ ] Firebase config matches in `src/config/firebase.ts`
- [ ] Service account key downloaded (for backend)

---

## Common Issues & Solutions

### Issue: "Cloud Messaging API not enabled"
**Solution:**
1. Go to Google Cloud Console
2. Enable "Firebase Cloud Messaging API"
3. Wait a few minutes for it to activate

### Issue: "VAPID key not found"
**Solution:**
1. Go to Firebase Console → Project Settings → Cloud Messaging
2. Generate a new key pair
3. Copy the key to your `.env` file

### Issue: "Service worker not registered"
**Solution:**
1. Check that `public/firebase-messaging-sw.js` exists
2. Verify it's being served (check Network tab in browser)
3. Make sure service worker registration code is in `src/main.tsx`

### Issue: "Permission denied"
**Solution:**
1. Make sure user grants notification permission
2. Check browser settings allow notifications
3. For localhost, some browsers require HTTPS (use `npm run dev` with HTTPS or deploy)

---

## Testing FCM Setup

### 1. Check FCM Token Generation

1. Open your app in browser
2. Open browser console (F12)
3. Log in as a student
4. Grant notification permission when prompted
5. Look for console log: `FCM Token: ...`
6. Copy this token for testing

### 2. Test via Firebase Console

1. Go to Firebase Console → Cloud Messaging
2. Click "Send test message"
3. Paste your FCM token
4. Enter a test message
5. Click "Test"
6. You should receive a notification!

### 3. Test via Your App

1. Log in as Super Admin/Moderator/Admin
2. Go to Notifications tab
3. Send a notification
4. Check browser console for FCM sending logs
5. Students should receive push notifications

---

## What to Check in Firebase Console

### Authentication Tab
- ✅ Users are registered
- ✅ User emails match your app

### Firestore Database Tab
- ✅ `fcm_tokens` collection exists
- ✅ Tokens are stored with bus numbers
- ✅ `students` collection has user data

### Cloud Messaging Tab
- ✅ API is enabled
- ✅ VAPID key is configured
- ✅ Can send test messages

### Project Settings
- ✅ Web app is registered
- ✅ Configuration matches your code
- ✅ Service account key is available (for backend)

---

## Next Steps After Console Setup

1. **Test notification permission** - Students should grant permission
2. **Verify token storage** - Check Firestore for FCM tokens
3. **Test sending** - Send a notification from admin dashboard
4. **Set up backend** - If you want to send from backend (see `BACKEND_SETUP.md`)
5. **Monitor** - Check Cloud Messaging history for delivery stats

---

## Quick Reference

**Firebase Console URLs:**
- Main Console: https://console.firebase.google.com/
- Cloud Console: https://console.cloud.google.com/
- Your Project: https://console.firebase.google.com/project/uits-bus-management-system

**Key Locations:**
- Project Settings: Gear icon → Project Settings
- Cloud Messaging: Left sidebar → Cloud Messaging
- Service Accounts: Project Settings → Service Accounts tab
- VAPID Key: Project Settings → Cloud Messaging tab → Web Push certificates

**Important Values:**
- Messaging Sender ID: `374309687203`
- App ID: `1:374309687203:web:6388c62b751c7d8b81d416`
- VAPID Key: `BP3um_XHbkoxZWT2rk837Vr6xsZx2rrpZJzl62WnlxVKFQNmDmedWJKvC1RbjP_Hufs3kpp8QZrlR7KEP2F3wYc`

