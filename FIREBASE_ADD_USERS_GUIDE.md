# How to Add Super Admin, Moderator, and Driver to Firebase

## Method 1: Using the Setup Page (Recommended)

### Step 1: Add the Setup Page to Your App

1. Open `src/App.tsx`
2. Add this import at the top:
   ```typescript
   import { FirebaseSetupPage } from './components/FirebaseSetupPage';
   ```

3. Add a new screen type:
   ```typescript
   type Screen = 
     | 'splash'
     | 'login'
     | 'forgot-password'
     | 'register'
     | 'super-admin-dashboard'
     | 'moderator-dashboard'
     | 'admin-dashboard'
     | 'student-dashboard'
     | 'driver-dashboard'
     | 'firebase-setup'; // Add this
   ```

4. Add the route in the return statement:
   ```typescript
   {currentScreen === 'firebase-setup' && (
     <FirebaseSetupPage />
   )}
   ```

5. To access it, you can:
   - Add a button in the login page temporarily
   - Or change the initial screen to 'firebase-setup' temporarily
   - Or add `?setup=true` URL parameter handling

### Step 2: Access the Setup Page

1. Start your app: `npm run dev`
2. Navigate to the setup page (however you set it up)
3. Click **"Add All Users to Firebase"** button
4. Wait for the process to complete
5. Check Firebase Console to verify

---

## Method 2: Using Browser Console (Quick Method)

### Step 1: Open Browser Console

1. Start your app: `npm run dev`
2. Open your browser (Chrome/Firefox)
3. Press `F12` or `Ctrl+Shift+I` to open Developer Tools
4. Go to the **Console** tab

### Step 2: Run the Setup Script

Copy and paste this code into the console:

```javascript
// Import the function (you'll need to access it from the window or import it)
// First, make sure you're on a page that has Firebase initialized

// Option 1: If you have access to the module
import { addAllMockUsersToFirebase } from './src/utils/firebaseAdminSetup';

// Option 2: Use dynamic import
(async () => {
  const { addAllMockUsersToFirebase } = await import('./src/utils/firebaseAdminSetup');
  await addAllMockUsersToFirebase();
})();
```

**Note:** The browser console method might not work directly due to module imports. Use Method 1 or Method 3 instead.

---

## Method 3: Using a Temporary Route (Easiest)

### Step 1: Temporarily Add Setup Route

1. Open `src/App.tsx`
2. Find the `handleSplashComplete` or initial screen logic
3. Temporarily change it to show the setup page:

```typescript
// In App.tsx, temporarily change:
const [currentScreen, setCurrentScreen] = useState<Screen>('firebase-setup'); // Change this

// Add the import and screen type as shown in Method 1
```

4. Run `npm run dev`
5. The setup page will load automatically
6. Click "Add All Users to Firebase"
7. After setup is complete, change it back to 'splash' or 'login'

---

## Method 4: Add Individual Users Programmatically

If you want to add users one by one, you can use the individual functions:

### In Browser Console:

```javascript
// This won't work directly in console, but you can create a temporary button
// Or use the setup page which has individual buttons for each role
```

### Using the Setup Page:

The setup page has individual buttons:
- **Add Super Admins** - Adds all super admins
- **Add Moderators** - Adds all moderators  
- **Add Admins** - Adds all admins
- **Add Drivers** - Adds all drivers

---

## What Gets Added

### Super Admins (1 user)
- Email: `superadmin@uits.edu`
- Password: `password123`
- Name: Super Admin

### Moderators (1 user)
- Email: `moderator@uits.edu`
- Password: `password123`
- Name: Moderator
- Assigned Buses: All buses (Bus 1-5)

### Admins (3 users)
- Email: `admin@uits.edu`, `admin2@uits.edu`, `admin3@uits.edu`
- Password: `password123`
- Names: Admin Rahman, Admin Khan, Admin Ahmed
- Assigned Buses: Various bus assignments

### Drivers (5 users)
- Emails: `driver@uits.edu`, `driver2@uits.edu`, etc.
- Password: `password123`
- Names: Kamal Hossain, Abdul Jabbar, Rafiq Ahmed, Shafiq Islam, Habib Rahman
- Bus Numbers: Bus 1, Bus 2, Bus 3, Bus 4, Bus 5

---

## Verification

After running the setup:

### Check Firebase Authentication:
1. Go to Firebase Console
2. Navigate to **Authentication** → **Users**
3. You should see all the users listed:
   - superadmin@uits.edu
   - moderator@uits.edu
   - admin@uits.edu
   - admin2@uits.edu
   - admin3@uits.edu
   - driver@uits.edu
   - driver2@uits.edu
   - driver3@uits.edu
   - driver4@uits.edu
   - driver5@uits.edu

### Check Firestore Database:
1. Go to Firebase Console
2. Navigate to **Firestore Database**
3. You should see these collections:
   - `super_admins` - Contains super admin data
   - `moderators` - Contains moderator data
   - `admins` - Contains admin data
   - `drivers` - Contains driver data
   - `users` - Contains all user data (unified collection)

---

## Troubleshooting

### Error: "Email already in use"
- This means the user already exists in Firebase
- The function will skip existing users and continue
- Check Firebase Console to see which users were added

### Error: "Firebase is not initialized"
- Make sure Firestore and Authentication are enabled in Firebase Console
- Check your Firebase configuration in `src/config/firebase.ts`
- Verify your `.env` file has correct Firebase keys

### Users not appearing in Firestore
- Check browser console for errors
- Verify Firestore rules allow writes
- Make sure you're looking at the correct Firebase project

### Setup page not loading
- Make sure you've added the import and route correctly
- Check browser console for errors
- Verify the component file exists at `src/components/FirebaseSetupPage.tsx`

---

## After Setup

Once all users are added:

1. **Remove the setup page** from production (or protect it with authentication)
2. **Test login** with the credentials:
   - Super Admin: `superadmin@uits.edu` / `password123`
   - Moderator: `moderator@uits.edu` / `password123`
   - Admin: `admin@uits.edu` / `password123`
   - Driver: `driver@uits.edu` / `password123`

3. **Update login logic** to check Firebase Authentication if needed
4. **Set up proper security rules** in Firestore for production

---

## Quick Reference

**Default Password:** `password123`

**User Emails:**
- Super Admin: `superadmin@uits.edu`
- Moderator: `moderator@uits.edu`
- Admins: `admin@uits.edu`, `admin2@uits.edu`, `admin3@uits.edu`
- Drivers: `driver@uits.edu`, `driver2@uits.edu`, `driver3@uits.edu`, `driver4@uits.edu`, `driver5@uits.edu`

**Total Users:** 10 users (1 Super Admin + 1 Moderator + 3 Admins + 5 Drivers)

