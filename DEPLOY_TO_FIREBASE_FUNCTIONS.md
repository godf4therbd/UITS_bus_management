# Deploy Backend to Firebase Cloud Functions

## Overview

Instead of running the backend on localhost, you can deploy it to Firebase Cloud Functions. This gives you:
- ✅ No need to run local server
- ✅ Automatic HTTPS
- ✅ Scalable serverless functions
- ✅ Free tier available

## Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

Or if you prefer not to install globally:
```bash
npx firebase-tools
```

## Step 2: Login to Firebase

```bash
firebase login
```

This will open a browser window for you to authenticate.

## Step 3: Initialize Firebase Functions (if needed)

If you haven't initialized Firebase Functions yet:

```bash
firebase init functions
```

When prompted:
- **Language**: JavaScript
- **ESLint**: Yes (optional)
- **Install dependencies**: Yes

**Note:** The `functions` folder and configuration files are already created for you, so you can skip this step if they exist.

## Step 4: Install Function Dependencies

Navigate to the functions folder and install dependencies:

```bash
cd functions
npm install
cd ..
```

Or from project root:

```bash
npm install --prefix functions
```

## Step 5: Deploy Functions

Deploy your Cloud Functions:

```bash
firebase deploy --only functions
```

You'll see output like:
```
✔  functions[sendNotification(us-central1)] Successful create operation.
✔  functions[health(us-central1)] Successful create operation.

Function URL: https://us-central1-uits-bus-management-system.cloudfunctions.net/sendNotification
```

**Copy the Function URL** - you'll need it for the frontend!

## Step 6: Update Frontend Environment

Update your `.env` file with the Cloud Function URL:

```env
VITE_BACKEND_API_URL=https://us-central1-uits-bus-management-system.cloudfunctions.net
```

**Note:** The URL format is:
```
https://[REGION]-[PROJECT-ID].cloudfunctions.net
```

For example:
```
https://us-central1-uits-bus-management-system.cloudfunctions.net
```

## Step 7: Update Frontend Code

The frontend code already uses the correct endpoint path (`/sendNotification`), so your full URL will be:

```
https://us-central1-uits-bus-management-system.cloudfunctions.net/sendNotification
```

But the code automatically appends `/sendNotification` to `VITE_BACKEND_API_URL`, so just set:

```env
VITE_BACKEND_API_URL=https://us-central1-uits-bus-management-system.cloudfunctions.net
```

## Step 8: Test

1. **Test the health endpoint:**
   ```
   https://us-central1-uits-bus-management-system.cloudfunctions.net/health
   ```
   Should return: `{"status":"ok","message":"FCM Cloud Function is running"}`

2. **Test from your app:**
   - Start frontend: `npm run dev`
   - Log in as Super Admin/Moderator/Admin
   - Send a notification
   - Check Firebase Console → Functions → Logs for output

## Viewing Logs

View function logs in Firebase Console:
1. Go to Firebase Console
2. Click **Functions** in left sidebar
3. Click on a function name
4. View **Logs** tab

Or use CLI:
```bash
firebase functions:log
```

## Updating Functions

After making changes to `functions/index.js`:

```bash
firebase deploy --only functions
```

Or deploy a specific function:
```bash
firebase deploy --only functions:sendNotification
```

## Function URLs

After deployment, you'll get URLs like:

- **sendNotification**: `https://us-central1-uits-bus-management-system.cloudfunctions.net/sendNotification`
- **health**: `https://us-central1-uits-bus-management-system.cloudfunctions.net/health`

## Cost Considerations

Firebase Cloud Functions free tier includes:
- 2 million invocations/month
- 400,000 GB-seconds compute time
- 200,000 CPU-seconds

For most apps, this is more than enough!

## Troubleshooting

### "firebase: command not found"
**Solution:** Install Firebase CLI: `npm install -g firebase-tools`

### "Error: Functions did not deploy"
**Solution:**
- Check you're logged in: `firebase login`
- Verify project ID in `.firebaserc`
- Check function code for syntax errors

### "CORS errors"
**Solution:** The function already includes CORS. If issues persist, check:
- Function URL is correct
- Frontend is making requests to correct endpoint

### "Permission denied"
**Solution:**
- Make sure you have proper Firebase project permissions
- Check Firebase Console → IAM & Admin for your account

### Function timeout
**Solution:** Increase timeout in `functions/index.js`:
```javascript
exports.sendNotification = functions
  .runWith({ timeoutSeconds: 60 })
  .https.onRequest(async (req, res) => {
    // ... your code
  });
```

## Security

### Add Authentication (Optional)

To protect your endpoints, add authentication:

```javascript
exports.sendNotification = functions.https.onRequest(async (req, res) => {
  // Verify Firebase Auth token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const idToken = authHeader.split('Bearer ')[1];
  try {
    await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // ... rest of your code
});
```

## Next Steps

1. ✅ Functions deployed
2. ✅ Frontend updated with Function URL
3. ✅ Test sending notifications
4. ✅ Monitor logs in Firebase Console
5. 🚀 Your backend is now hosted on Firebase!

## Quick Reference

**Deploy:**
```bash
firebase deploy --only functions
```

**View logs:**
```bash
firebase functions:log
```

**View in Console:**
https://console.firebase.google.com/project/uits-bus-management-system/functions

**Function URL format:**
```
https://[REGION]-[PROJECT-ID].cloudfunctions.net/[FUNCTION-NAME]
```

