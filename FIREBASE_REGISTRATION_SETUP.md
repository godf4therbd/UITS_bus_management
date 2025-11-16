# Firebase Registration Setup Guide

## Overview
The registration system now automatically saves student data to Firebase Firestore and creates Firebase Authentication accounts when students register.

## What Happens During Registration

1. **Firebase Authentication**: Creates a user account with email and password
   - Email format: `{studentId}@uits.edu` (e.g., `s001@uits.edu`)
   - Password: The password entered by the student

2. **Firestore Database**: Saves student data to two collections:
   - `students/{uid}` - Student-specific data
   - `users/{uid}` - General user data (for easy querying)

3. **Local Storage**: Also saves to localStorage as a fallback if Firebase fails

## Firebase Console Setup Required

### 1. Enable Firestore Database
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `uits-bus-management-system`
3. Navigate to **Firestore Database** in the left sidebar
4. Click **Create Database**
5. Choose **Start in test mode** (for development) or set up security rules
6. Select a location for your database

### 2. Set Up Firestore Security Rules

For development, you can use test mode. For production, update the rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Students collection
    match /students/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable **Email/Password** authentication method
4. Click **Save**

## Data Structure in Firestore

### Student Document (`students/{uid}`)
```javascript
{
  id: "student_1234567890",
  username: "S001",
  email: "s001@uits.edu",
  role: "student",
  name: "Ahmed Hasan",
  studentId: "S001",
  batch: "2023",
  phone: "+880 1611-111111",
  bloodGroup: "A+",
  emergencyContact: "+880 1711-111111",
  busNumber: null,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  firebaseUid: "firebase-user-uid"
}
```

### User Document (`users/{uid}`)
Same structure as student document, with an additional `uid` field.

## Testing Registration

1. Start the development server: `npm run dev`
2. Navigate to the registration page
3. Fill in the registration form
4. Submit the form
5. Check Firebase Console:
   - **Authentication** → Should see the new user
   - **Firestore Database** → Should see documents in `students` and `users` collections

## Error Handling

The system includes comprehensive error handling:
- **Email already exists**: Shows user-friendly error message
- **Weak password**: Validates password strength
- **Invalid email**: Validates email format
- **Firebase connection issues**: Falls back to localStorage

## Features

✅ Automatic Firebase Authentication account creation
✅ Automatic Firestore data storage
✅ Email generation from Student ID
✅ Error handling with user-friendly messages
✅ Loading states during registration
✅ Fallback to localStorage if Firebase fails
✅ Backward compatibility with existing localStorage data

## Next Steps

1. Set up Firestore security rules for production
2. Consider adding email verification
3. Add password reset functionality
4. Implement user profile updates
5. Add data validation on the backend

