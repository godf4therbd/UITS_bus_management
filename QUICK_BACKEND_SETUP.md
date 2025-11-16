# Quick Backend Setup Guide

## ✅ Service Account Key is Ready!

Your service account key has been saved as `serviceAccountKey.json` and is protected in `.gitignore`.

## Step 1: Install Backend Dependencies

Open a new terminal and run:

```bash
npm install express firebase-admin cors
```

## Step 2: Start Backend Server

Run the backend server:

```bash
node backend-example.js
```

You should see:
```
🚀 FCM Backend Server running on http://localhost:3001
📡 Ready to send notifications!
```

## Step 3: Update Frontend Environment

Make sure your `.env` file has:

```env
VITE_BACKEND_API_URL=http://localhost:3001/api
```

**Remove mock mode** (if you had it):
```env
# Remove this line or set to false
# VITE_USE_MOCK_FCM=false
```

## Step 4: Test Everything

1. **Keep backend running** (terminal 1):
   ```bash
   node backend-example.js
   ```

2. **Start frontend** (terminal 2):
   ```bash
   npm run dev
   ```

3. **Test notifications**:
   - Log in as Super Admin/Moderator/Admin
   - Go to Notifications tab
   - Send a notification
   - Check backend console for logs
   - Students should receive push notifications!

## What to Expect

### Backend Console:
```
📱 Sending notification to 5 device(s)
Title: Bus 1 Update
Body: Your bus is arriving soon
✅ Successfully sent: 5
```

### Frontend:
- Success message when notification is sent
- Students receive push notifications on their devices

## Troubleshooting

### "Cannot find module 'express'"
**Solution:** Run `npm install express firebase-admin cors`

### "Cannot find module './serviceAccountKey.json'"
**Solution:** Make sure `serviceAccountKey.json` is in the project root (same folder as `backend-example.js`)

### "Port 3001 already in use"
**Solution:** 
- Close other applications using port 3001
- Or change the port in `backend-example.js`:
  ```javascript
  const PORT = process.env.PORT || 3002; // Change to 3002
  ```
- Update `.env`: `VITE_BACKEND_API_URL=http://localhost:3002/api`

### Backend not receiving requests
**Solution:**
- Check CORS is enabled (it is in the example)
- Verify `VITE_BACKEND_API_URL` in `.env` matches backend URL
- Check browser console for CORS errors

## Next Steps

1. ✅ Backend is running
2. ✅ Frontend is connected
3. ✅ Test sending notifications
4. ✅ Verify students receive push notifications
5. 🚀 Deploy to production when ready!

