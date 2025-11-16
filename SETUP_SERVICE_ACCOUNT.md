# Setup Service Account Key for Backend

## ⚠️ IMPORTANT SECURITY WARNING

**NEVER commit your service account key to git!** This file contains sensitive credentials that give full access to your Firebase project.

## Step 1: Save Your Service Account Key

1. Create a file named `serviceAccountKey.json` in your project root (same folder as `package.json`)
2. Copy the JSON content you received from Firebase Console
3. Paste it into `serviceAccountKey.json`
4. **Verify the file is in `.gitignore`** (it should be - we've added it)

**Your file should look like:**
```json
{
  "type": "service_account",
  "project_id": "uits-bus-management-system",
  "private_key_id": "ce962a97320fc4ebe1c62cb5964aebb8a66ff50b",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@uits-bus-management-system.iam.gserviceaccount.com",
  ...
}
```

## Step 2: Verify .gitignore

Make sure `serviceAccountKey.json` is in your `.gitignore` file. Check that it includes:
```
serviceAccountKey.json
*-serviceAccountKey.json
firebase-adminsdk-*.json
```

## Step 3: Update Backend Code

The `backend-example.js` file is already configured to use `serviceAccountKey.json`. Just make sure:

1. The file `serviceAccountKey.json` exists in your project root
2. The backend code has this line:
   ```javascript
   const serviceAccount = require('./serviceAccountKey.json');
   ```

## Step 4: Test Backend

1. Install backend dependencies:
   ```bash
   npm install express firebase-admin cors
   ```

2. Run the backend:
   ```bash
   node backend-example.js
   ```

3. You should see:
   ```
   🚀 FCM Backend Server running on http://localhost:3001
   📡 Ready to send notifications!
   ```

## Step 5: Update Frontend Environment

Make sure your `.env` file has:
```env
VITE_BACKEND_API_URL=http://localhost:3001/api
```

Remove the mock mode (if you had it):
```env
# Remove or set to false
# VITE_USE_MOCK_FCM=false
```

## Step 6: Test FCM Notifications

1. Start backend: `node backend-example.js`
2. Start frontend: `npm run dev`
3. Log in as Super Admin/Moderator/Admin
4. Send a notification
5. Check backend console for logs
6. Students should receive push notifications!

## Security Checklist

- [ ] `serviceAccountKey.json` is saved in project root
- [ ] File is in `.gitignore`
- [ ] Never committed to git
- [ ] Backend server is running
- [ ] Frontend can connect to backend
- [ ] Notifications are working

## Troubleshooting

### "Cannot find module './serviceAccountKey.json'"
- Make sure the file exists in the same folder as `backend-example.js`
- Check the filename is exactly `serviceAccountKey.json` (case-sensitive)

### "Invalid service account key"
- Verify the JSON is valid (no extra commas, proper formatting)
- Make sure you copied the entire key including the private key section

### "Permission denied"
- Check that the service account has proper permissions in Firebase Console
- Verify the project ID matches: `uits-bus-management-system`

## Next Steps

1. ✅ Service account key is saved
2. ✅ Backend server is running
3. ✅ Frontend is connected
4. ✅ Test sending notifications
5. ✅ Verify students receive push notifications

