# Firebase Console Setup - Step by Step Guide

## Prerequisites
- You should already have a Firebase project: `uits-bus-management-system`
- Your Firebase App ID: `1:374309687203:web:6388c62b751c7d8b81d416`

---

## Step 1: Access Firebase Console

1. Open your web browser
2. Go to: https://console.firebase.google.com/
3. Sign in with your Google account (the one used to create the Firebase project)
4. You should see your project: **uits-bus-management-system**
5. Click on your project name to open it

---

## Step 2: Enable Firestore Database

### 2.1 Navigate to Firestore
1. In the left sidebar, look for **"Firestore Database"** (it might be under "Build" section)
2. Click on **"Firestore Database"**

### 2.2 Create Database
1. If you see a button that says **"Create database"**, click it
2. If you already have a database, skip to Step 3

### 2.3 Choose Security Rules (IMPORTANT)
1. You'll see two options:
   - **Start in production mode** (requires security rules setup)
   - **Start in test mode** (allows read/write for 30 days)
   
2. **For Development/Testing**: Select **"Start in test mode"**
   - This allows read/write access for 30 days
   - Perfect for testing your registration feature
   
3. Click **"Next"**

### 2.4 Select Database Location
1. Choose a location closest to your users (e.g., `us-central`, `asia-south1`, `europe-west`)
2. For Bangladesh/Asia, select: **`asia-south1` (Mumbai)** or **`asia-southeast1` (Singapore)**
3. Click **"Enable"**
4. Wait for the database to be created (takes 1-2 minutes)

### 2.5 Verify Firestore is Ready
1. You should see the Firestore Database interface
2. You'll see an empty database with no collections yet
3. This is normal - collections will be created automatically when students register

---

## Step 3: Enable Authentication

### 3.1 Navigate to Authentication
1. In the left sidebar, look for **"Authentication"** (under "Build" section)
2. Click on **"Authentication"**

### 3.2 Get Started
1. If you see a button that says **"Get started"**, click it
2. If you already have Authentication enabled, skip to Step 3.4

### 3.3 Enable Email/Password Sign-in
1. You'll see a list of sign-in providers
2. Find **"Email/Password"** in the list
3. Click on **"Email/Password"**

### 3.4 Configure Email/Password
1. Toggle **"Enable"** to ON (it should be enabled)
2. **DO NOT** enable "Email link (passwordless sign-in)" unless you want that feature
3. Click **"Save"**

### 3.5 Verify Authentication is Ready
1. You should see the Authentication dashboard
2. You'll see tabs: **Users**, **Sign-in method**, **Templates**, **Usage**
3. The **Users** tab will be empty until someone registers
4. The **Sign-in method** tab should show Email/Password as enabled

---

## Step 4: (Optional) Set Up Firestore Security Rules

### 4.1 Navigate to Firestore Rules
1. Go back to **"Firestore Database"** in the left sidebar
2. Click on the **"Rules"** tab at the top

### 4.2 Update Rules (For Production)
1. You'll see the current rules (test mode rules allow everything)
2. For production, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Students can read/write their own data
    match /students/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admins can read all data (you'll need to add admin check)
    match /{document=**} {
      allow read, write: if false; // Deny by default
    }
  }
}
```

3. Click **"Publish"** to save the rules

**Note**: For now, you can keep test mode rules during development.

---

## Step 5: Verify Your Setup

### 5.1 Check Firestore
1. Go to **Firestore Database**
2. You should see an empty database (no collections yet)
3. This is correct - collections will be created when students register

### 5.2 Check Authentication
1. Go to **Authentication**
2. Click on **"Users"** tab
3. Should be empty (no users yet)
4. Click on **"Sign-in method"** tab
5. **Email/Password** should be **Enabled**

### 5.3 Check Project Settings (Optional)
1. Click the gear icon ⚙️ next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Verify your web app is listed with App ID: `1:374309687203:web:6388c62b751c7d8b81d416`

---

## Step 6: Test Registration

### 6.1 Start Your App
1. In your terminal, run: `npm run dev`
2. Open your app in the browser (usually `http://localhost:3000`)

### 6.2 Register a Test Student
1. Click **"Sign up"** on the login page
2. Fill in the registration form:
   - Student ID: `TEST001`
   - Name: `Test Student`
   - Batch: `2024`
   - Phone: `+880 1234-567890`
   - Blood Group: Select any
   - Emergency Contact: `+880 9876-543210`
   - Password: `test123`
   - Confirm Password: `test123`
3. Click **"Register"**

### 6.3 Verify in Firebase Console

**Check Authentication:**
1. Go to Firebase Console → **Authentication** → **Users** tab
2. You should see a new user:
   - Email: `test001@uits.edu`
   - UID: (a long string of characters)

**Check Firestore:**
1. Go to Firebase Console → **Firestore Database**
2. You should see two collections:
   - `students` - Click to see the student document
   - `users` - Click to see the user document
3. Click on a document to see the data:
   - `studentId`: `TEST001`
   - `name`: `Test Student`
   - `email`: `test001@uits.edu`
   - etc.

---

## Troubleshooting

### Problem: "Firestore Database" option is missing
**Solution:**
- Make sure you're using the correct Firebase project
- Check if you have the right permissions
- Try refreshing the page

### Problem: "Create database" button doesn't work
**Solution:**
- Check if you already have a database (look in Firestore)
- Try a different browser
- Clear browser cache

### Problem: Authentication "Get started" doesn't work
**Solution:**
- Make sure you're the project owner or have admin permissions
- Try refreshing the page
- Check if Authentication is already enabled

### Problem: Registration fails with "Firebase is not initialized"
**Solution:**
- Check your `.env` file has the correct Firebase config
- Verify your Firebase config in `src/config/firebase.ts`
- Make sure Firestore and Auth are enabled in Firebase Console

### Problem: Registration works but no data in Firestore
**Solution:**
- Check browser console for errors
- Verify Firestore rules allow writes
- Check if you're looking at the correct Firebase project

---

## Quick Checklist

Before testing registration, make sure:

- [ ] Firestore Database is created
- [ ] Firestore is in "test mode" or has proper rules
- [ ] Authentication is enabled
- [ ] Email/Password sign-in method is enabled
- [ ] Your app is running (`npm run dev`)
- [ ] No errors in browser console

---

## What Happens After Setup

Once setup is complete:

1. **When a student registers:**
   - A Firebase Auth account is created
   - Student data is saved to Firestore `students` collection
   - User data is saved to Firestore `users` collection
   - Data is also saved to localStorage as backup

2. **You can view data in Firebase Console:**
   - **Authentication** → See all registered users
   - **Firestore Database** → See all student data

3. **Data structure:**
   - Each student gets a unique Firebase UID
   - Email format: `{studentId}@uits.edu`
   - All registration data is stored securely

---

## Next Steps

After setup is complete:
1. Test registration with a few test accounts
2. Verify data appears in Firebase Console
3. Set up proper security rules for production
4. Consider adding email verification
5. Set up password reset functionality

---

## Need Help?

If you encounter any issues:
1. Check the browser console for error messages
2. Verify all steps above are completed
3. Make sure your Firebase project is active
4. Check that your Firebase config matches your project settings

