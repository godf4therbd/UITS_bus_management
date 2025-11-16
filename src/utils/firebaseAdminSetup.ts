import { 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { SuperAdmin, Moderator, Driver, Admin } from '../types';
import { mockSuperAdmins, mockModerators, mockDrivers, mockAdmins, DEFAULT_PASSWORD } from '../data/mockData';
import { toast } from 'sonner';

/**
 * Add a Super Admin to Firebase
 */
export async function addSuperAdminToFirebase(
  superAdmin: SuperAdmin,
  password: string = DEFAULT_PASSWORD
): Promise<boolean> {
  if (!auth || !db) {
    console.error('Firebase Auth or Firestore is not initialized');
    return false;
  }

  try {
    // Create user account with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      superAdmin.email, 
      password
    );
    const firebaseUser = userCredential.user;

    // Update user profile
    await updateProfile(firebaseUser, {
      displayName: superAdmin.name
    });

    // Prepare super admin data for Firestore
    const superAdminData = {
      id: superAdmin.id,
      username: superAdmin.username,
      email: superAdmin.email,
      role: superAdmin.role,
      name: superAdmin.name,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      firebaseUid: firebaseUser.uid
    };

    // Save to Firestore
    const superAdminRef = doc(db, 'super_admins', firebaseUser.uid);
    await setDoc(superAdminRef, superAdminData);

    // Also save to users collection
    const usersRef = collection(db, 'users');
    const userRef = doc(usersRef, firebaseUser.uid);
    await setDoc(userRef, {
      ...superAdminData,
      uid: firebaseUser.uid
    });

    console.log(`✅ Super Admin added: ${superAdmin.email} (UID: ${firebaseUser.uid})`);
    return true;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`⚠️ Super Admin already exists: ${superAdmin.email}`);
      return false;
    }
    console.error(`❌ Error adding Super Admin ${superAdmin.email}:`, error);
    return false;
  }
}

/**
 * Add a Moderator to Firebase
 */
export async function addModeratorToFirebase(
  moderator: Moderator,
  password: string = DEFAULT_PASSWORD
): Promise<boolean> {
  if (!auth || !db) {
    console.error('Firebase Auth or Firestore is not initialized');
    return false;
  }

  try {
    // Create user account with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      moderator.email, 
      password
    );
    const firebaseUser = userCredential.user;

    // Update user profile
    await updateProfile(firebaseUser, {
      displayName: moderator.name
    });

    // Prepare moderator data for Firestore
    const moderatorData = {
      id: moderator.id,
      username: moderator.username,
      email: moderator.email,
      role: moderator.role,
      name: moderator.name,
      assignedBuses: moderator.assignedBuses || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      firebaseUid: firebaseUser.uid
    };

    // Save to Firestore
    const moderatorRef = doc(db, 'moderators', firebaseUser.uid);
    await setDoc(moderatorRef, moderatorData);

    // Also save to users collection
    const usersRef = collection(db, 'users');
    const userRef = doc(usersRef, firebaseUser.uid);
    await setDoc(userRef, {
      ...moderatorData,
      uid: firebaseUser.uid
    });

    console.log(`✅ Moderator added: ${moderator.email} (UID: ${firebaseUser.uid})`);
    return true;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`⚠️ Moderator already exists: ${moderator.email}`);
      return false;
    }
    console.error(`❌ Error adding Moderator ${moderator.email}:`, error);
    return false;
  }
}

/**
 * Add a Driver to Firebase
 */
export async function addDriverToFirebase(
  driver: Driver,
  password: string = DEFAULT_PASSWORD
): Promise<boolean> {
  if (!auth || !db) {
    console.error('Firebase Auth or Firestore is not initialized');
    return false;
  }

  try {
    // Create user account with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      driver.email || `${driver.username}@uits.edu`, 
      password
    );
    const firebaseUser = userCredential.user;

    // Update user profile
    await updateProfile(firebaseUser, {
      displayName: driver.name
    });

    // Prepare driver data for Firestore
    const driverData = {
      id: driver.id,
      username: driver.username,
      email: driver.email || `${driver.username}@uits.edu`,
      role: driver.role,
      name: driver.name,
      busNumber: driver.busNumber || null,
      phone: driver.phone,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      firebaseUid: firebaseUser.uid
    };

    // Save to Firestore
    const driverRef = doc(db, 'drivers', firebaseUser.uid);
    await setDoc(driverRef, driverData);

    // Also save to users collection
    const usersRef = collection(db, 'users');
    const userRef = doc(usersRef, firebaseUser.uid);
    await setDoc(userRef, {
      ...driverData,
      uid: firebaseUser.uid
    });

    console.log(`✅ Driver added: ${driver.email || driver.username} (UID: ${firebaseUser.uid})`);
    return true;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`⚠️ Driver already exists: ${driver.email || driver.username}`);
      return false;
    }
    console.error(`❌ Error adding Driver ${driver.email || driver.username}:`, error);
    return false;
  }
}

/**
 * Add an Admin to Firebase
 */
export async function addAdminToFirebase(
  admin: Admin,
  password: string = DEFAULT_PASSWORD
): Promise<boolean> {
  if (!auth || !db) {
    console.error('Firebase Auth or Firestore is not initialized');
    return false;
  }

  try {
    const email = admin.email || `${admin.username}@uits.edu`;
    
    // Create user account with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      email, 
      password
    );
    const firebaseUser = userCredential.user;

    // Update user profile
    await updateProfile(firebaseUser, {
      displayName: admin.name
    });

    // Prepare admin data for Firestore
    const adminData = {
      id: admin.id,
      username: admin.username,
      email: email,
      role: admin.role,
      name: admin.name,
      assignedBuses: admin.assignedBuses || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      firebaseUid: firebaseUser.uid
    };

    // Save to Firestore
    const adminRef = doc(db, 'admins', firebaseUser.uid);
    await setDoc(adminRef, adminData);

    // Also save to users collection
    const usersRef = collection(db, 'users');
    const userRef = doc(usersRef, firebaseUser.uid);
    await setDoc(userRef, {
      ...adminData,
      uid: firebaseUser.uid
    });

    console.log(`✅ Admin added: ${email} (UID: ${firebaseUser.uid})`);
    return true;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`⚠️ Admin already exists: ${admin.email || admin.username}`);
      return false;
    }
    console.error(`❌ Error adding Admin ${admin.email || admin.username}:`, error);
    return false;
  }
}

/**
 * Add all mock users to Firebase (Super Admins, Moderators, Drivers, Admins)
 */
export async function addAllMockUsersToFirebase(): Promise<void> {
  console.log('🚀 Starting to add all mock users to Firebase...\n');

  // Add Super Admins
  console.log('📝 Adding Super Admins...');
  for (const superAdmin of mockSuperAdmins) {
    await addSuperAdminToFirebase(superAdmin);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between requests
  }

  // Add Moderators
  console.log('\n📝 Adding Moderators...');
  for (const moderator of mockModerators) {
    await addModeratorToFirebase(moderator);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Add Admins
  console.log('\n📝 Adding Admins...');
  for (const admin of mockAdmins) {
    await addAdminToFirebase(admin);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Add Drivers
  console.log('\n📝 Adding Drivers...');
  for (const driver of mockDrivers) {
    await addDriverToFirebase(driver);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n✅ Finished adding all users to Firebase!');
  console.log('\n📊 Summary:');
  console.log(`   - Super Admins: ${mockSuperAdmins.length}`);
  console.log(`   - Moderators: ${mockModerators.length}`);
  console.log(`   - Admins: ${mockAdmins.length}`);
  console.log(`   - Drivers: ${mockDrivers.length}`);
  console.log('\n💡 Check Firebase Console to verify:');
  console.log('   - Authentication → Users');
  console.log('   - Firestore Database → Collections');
}

