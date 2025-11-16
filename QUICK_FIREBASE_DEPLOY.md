# Quick Deploy to Firebase Cloud Functions

## 🚀 Fast Setup (5 Steps)

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Install Function Dependencies

```bash
npm install --prefix functions
```

### Step 4: Deploy Functions

```bash
firebase deploy --only functions
```

You'll get a URL like:
```
https://us-central1-uits-bus-management-system.cloudfunctions.net/sendNotification
```

### Step 5: Update Frontend

Add to your `.env` file:

```env
VITE_BACKEND_API_URL=https://us-central1-uits-bus-management-system.cloudfunctions.net
```

**That's it!** Your backend is now hosted on Firebase.

## Test It

1. Test health endpoint:
   ```
   https://us-central1-uits-bus-management-system.cloudfunctions.net/health
   ```

2. Test from your app:
   - Start frontend: `npm run dev`
   - Log in as Super Admin
   - Send a notification
   - Check Firebase Console → Functions → Logs

## View Logs

```bash
firebase functions:log
```

Or in Firebase Console:
- Go to Functions → Click function name → Logs tab

## Update Functions

After making changes:

```bash
firebase deploy --only functions
```

## Your Function URLs

After deployment:
- **sendNotification**: `https://us-central1-uits-bus-management-system.cloudfunctions.net/sendNotification`
- **health**: `https://us-central1-uits-bus-management-system.cloudfunctions.net/health`

## Troubleshooting

**"firebase: command not found"**
→ Install: `npm install -g firebase-tools`

**"Permission denied"**
→ Login: `firebase login`

**"Functions did not deploy"**
→ Check `.firebaserc` has correct project ID

## Benefits

✅ No localhost needed
✅ Automatic HTTPS
✅ Scalable
✅ Free tier available
✅ Easy to update

