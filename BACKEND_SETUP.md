# Backend Setup for FCM Notifications

## Quick Start

### 1. Install Dependencies

```bash
npm install express firebase-admin cors
```

### 2. Get Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `uits-bus-management-system`
3. Go to **Project Settings** (gear icon)
4. Click **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the JSON file as `serviceAccountKey.json` in your backend folder
7. **IMPORTANT**: Add `serviceAccountKey.json` to `.gitignore` (never commit this file!)

### 3. Update Backend Code

1. Copy `backend-example.js` to your backend folder
2. Update the path to your service account key:
   ```javascript
   const serviceAccount = require('./serviceAccountKey.json');
   ```

### 4. Run Backend Server

```bash
node backend-example.js
```

You should see:
```
🚀 FCM Backend Server running on http://localhost:3001
📡 Ready to send notifications!
```

### 5. Update Frontend Environment

Add to your `.env` file:
```env
VITE_BACKEND_API_URL=http://localhost:3001/api
```

### 6. Test

1. Start your frontend: `npm run dev`
2. Log in as Super Admin/Moderator/Admin
3. Send a notification
4. Check backend console for logs
5. Students should receive push notifications!

## Production Deployment

### Option 1: Deploy to Heroku

1. Create `Procfile`:
   ```
   web: node backend-example.js
   ```

2. Set environment variable:
   ```bash
   heroku config:set PORT=3001
   ```

3. Deploy:
   ```bash
   git push heroku main
   ```

### Option 2: Deploy to Vercel/Netlify Functions

Convert to serverless functions (see Firebase Cloud Functions example below).

### Option 3: Firebase Cloud Functions

Create `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendNotification = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const { tokens, notification, data } = req.body;

  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: Object.fromEntries(
        Object.entries(data || {}).map(([key, value]) => [key, String(value)])
      ),
      tokens: tokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Deploy:
```bash
firebase deploy --only functions
```

## Security Best Practices

1. **Never commit service account keys** - Add to `.gitignore`
2. **Use environment variables** for sensitive data
3. **Add authentication** to your endpoints
4. **Validate input** before processing
5. **Rate limiting** to prevent abuse
6. **HTTPS only** in production

## Troubleshooting

### "Cannot find module 'firebase-admin'"
- Run: `npm install firebase-admin`

### "Service account key not found"
- Make sure the path to `serviceAccountKey.json` is correct
- Verify the file exists in your backend folder

### CORS errors
- Make sure `cors()` middleware is enabled
- Check that frontend URL is allowed

### "Invalid registration token"
- Tokens expire or become invalid
- Backend automatically handles this
- Frontend should request new token

## Next Steps

1. Add authentication middleware
2. Add rate limiting
3. Add logging/monitoring
4. Set up error alerts
5. Add notification analytics

