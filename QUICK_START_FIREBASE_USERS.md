# Quick Start: Add Users to Firebase

## 🚀 Fastest Method

1. **Start your app:**
   ```bash
   npm run dev
   ```

2. **Open setup page in browser:**
   ```
   http://localhost:3000?setup=true
   ```

3. **Click the button:**
   - Click **"Add All Users to Firebase"** button
   - Wait for completion (about 10-15 seconds)
   - You'll see success messages in the console

4. **Verify in Firebase Console:**
   - Go to Firebase Console → Authentication → Users
   - You should see 10 users added
   - Go to Firestore Database → Check collections

5. **Done!** You can now login with:
   - Super Admin: `superadmin@uits.edu` / `password123`
   - Moderator: `moderator@uits.edu` / `password123`
   - Admin: `admin@uits.edu` / `password123`
   - Driver: `driver@uits.edu` / `password123`

---

## 📋 What Gets Added

- **1 Super Admin** - superadmin@uits.edu
- **1 Moderator** - moderator@uits.edu
- **3 Admins** - admin@uits.edu, admin2@uits.edu, admin3@uits.edu
- **5 Drivers** - driver@uits.edu, driver2@uits.edu, driver3@uits.edu, driver4@uits.edu, driver5@uits.edu

**Total: 10 users**

**Default Password:** `password123` (for all users)

---

## 🔍 Verification Checklist

After running the setup:

- [ ] Check Firebase Console → Authentication → Users (should see 10 users)
- [ ] Check Firestore Database → Collections:
  - [ ] `super_admins` collection exists
  - [ ] `moderators` collection exists
  - [ ] `admins` collection exists
  - [ ] `drivers` collection exists
  - [ ] `users` collection exists (contains all users)

---

## ⚠️ Important Notes

1. **If a user already exists**, the function will skip it and continue
2. **Check browser console** for detailed logs of what's being added
3. **The setup page is accessible via URL parameter** - remove `?setup=true` after setup
4. **For production**, protect or remove the setup page

---

## 🆘 Troubleshooting

**Problem:** Setup page doesn't load
- Make sure you're using `?setup=true` in the URL
- Check browser console for errors

**Problem:** Users not appearing
- Check browser console for error messages
- Verify Firestore and Authentication are enabled in Firebase Console
- Make sure you're logged into the correct Firebase project

**Problem:** "Email already in use" errors
- This is normal if users already exist
- The function will skip existing users
- Check Firebase Console to see which users were actually added

