import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { Student, User } from '../types';
import { toast } from 'sonner';

/**
 * Register a new student with Firebase Authentication and Firestore
 */
export async function registerStudentToFirebase(
  student: Student,
  password: string
): Promise<FirebaseUser | null> {
  if (!auth || !db) {
    console.error('Firebase Auth or Firestore is not initialized');
    toast.error('Firebase is not initialized. Please check your configuration.');
    return null;
  }

  try {
    // Generate email from studentId if not provided
    const email = student.email || `${student.studentId.toLowerCase()}@uits.edu`;

    // Create user account with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update user profile with display name
    await updateProfile(firebaseUser, {
      displayName: student.name
    });

    // Prepare student data for Firestore (exclude password)
    const studentData = {
      id: student.id,
      username: student.username,
      email: email,
      role: student.role,
      name: student.name,
      studentId: student.studentId,
      batch: student.batch,
      phone: student.phone,
      bloodGroup: student.bloodGroup,
      emergencyContact: student.emergencyContact,
      busNumber: student.busNumber || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      firebaseUid: firebaseUser.uid
    };

    // Save student data to Firestore
    const studentRef = doc(db, 'students', firebaseUser.uid);
    await setDoc(studentRef, studentData);

    // Store FCM token if available
    try {
      const fcmToken = localStorage.getItem('fcm_token');
      if (fcmToken) {
        const { storeUserFCMToken } = await import('./firebaseNotificationSender');
        storeUserFCMToken(firebaseUser.uid, 'student', fcmToken, student.busNumber || null);
      }
    } catch (error) {
      console.error('Error storing FCM token during registration:', error);
    }

    // Also save to a collection for easy querying
    const studentsCollectionRef = collection(db, 'users');
    const userRef = doc(studentsCollectionRef, firebaseUser.uid);
    await setDoc(userRef, {
      ...studentData,
      uid: firebaseUser.uid
    });

    console.log('Student registered successfully in Firebase:', firebaseUser.uid);
    toast.success('Registration successful! Your data has been saved to Firebase.');
    
    return firebaseUser;
  } catch (error: any) {
    console.error('Error registering student to Firebase:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/email-already-in-use') {
      toast.error('This email is already registered. Please use a different email or login.');
    } else if (error.code === 'auth/weak-password') {
      toast.error('Password is too weak. Please use a stronger password.');
    } else if (error.code === 'auth/invalid-email') {
      toast.error('Invalid email address. Please check your email format.');
    } else {
      toast.error(`Registration failed: ${error.message || 'Unknown error'}`);
    }
    
    return null;
  }
}

/**
 * Login with Firebase Authentication
 */
export async function loginWithFirebase(
  email: string,
  password: string
): Promise<{ firebaseUser: FirebaseUser; userData: User } | null> {
  if (!auth || !db) {
    console.error('Firebase Auth or Firestore is not initialized');
    return null;
  }

  try {
    // Sign in with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Get user data from Firestore - check students collection first
    const studentRef = doc(db, 'students', firebaseUser.uid);
    const studentSnap = await getDoc(studentRef);
    
    if (studentSnap.exists()) {
      const studentData = studentSnap.data() as Student;
      return { firebaseUser, userData: studentData };
    }

    // If not found in students collection, check users collection
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data() as User;
      return { firebaseUser, userData };
    }

    console.warn('User data not found in Firestore');
    return null;
  } catch (error: any) {
    console.error('Error logging in with Firebase:', error);
    
    // Don't show toast errors here - let the calling function handle it
    // This allows fallback to other login methods
    
    return null;
  }
}

/**
 * Get user data from Firestore by Firebase UID
 */
export async function getUserDataFromFirebase(uid: string): Promise<User | null> {
  if (!db) {
    console.error('Firestore is not initialized');
    return null;
  }

  try {
    // Try users collection first
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as User;
    }

    // Try students collection
    const studentRef = doc(db, 'students', uid);
    const studentSnap = await getDoc(studentRef);

    if (studentSnap.exists()) {
      return studentSnap.data() as Student;
    }

    return null;
  } catch (error) {
    console.error('Error getting user data from Firebase:', error);
    return null;
  }
}

/**
 * Get user data from Firestore by email
 */
export async function getUserDataByEmail(email: string): Promise<User | null> {
  if (!db) {
    console.error('Firestore is not initialized');
    return null;
  }

  try {
    // Query users collection by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return doc.data() as User;
    }

    // Query students collection by email
    const studentsRef = collection(db, 'students');
    const q2 = query(studentsRef, where('email', '==', email.toLowerCase()));
    const querySnapshot2 = await getDocs(q2);

    if (!querySnapshot2.empty) {
      const doc = querySnapshot2.docs[0];
      return doc.data() as Student;
    }

    return null;
  } catch (error) {
    console.error('Error getting user data by email from Firebase:', error);
    return null;
  }
}

/**
 * Logout from Firebase
 */
export async function logoutFromFirebase(): Promise<void> {
  if (!auth) {
    console.error('Firebase Auth is not initialized');
    return;
  }

  try {
    await signOut(auth);
    console.log('Logged out from Firebase successfully');
  } catch (error) {
    console.error('Error logging out from Firebase:', error);
    throw error;
  }
}

/**
 * Check if a student ID already exists in Firestore
 */
export async function checkStudentIdExists(studentId: string): Promise<boolean> {
  if (!db) {
    console.error('Firestore is not initialized');
    return false;
  }

  try {
    const studentsRef = collection(db, 'students');
    const q = query(studentsRef, where('studentId', '==', studentId));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking student ID existence:', error);
    return false;
  }
}

