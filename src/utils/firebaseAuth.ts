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
import { logger } from './logger';

export async function registerStudentToFirebase(
  student: Student,
  password: string
): Promise<FirebaseUser | null> {
  if (!auth || !db) {
    logger.error('Firebase Auth or Firestore is not initialized');
    toast.error('Firebase is not initialized. Please check your configuration.');
    return null;
  }

  try {
    const email = student.email || `${student.studentId.toLowerCase()}@uits.edu`;

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    await updateProfile(firebaseUser, { displayName: student.name });

    const studentData = {
      id: student.id,
      username: student.username,
      email,
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
      firebaseUid: firebaseUser.uid,
    };

    await setDoc(doc(db, 'students', firebaseUser.uid), studentData);

    try {
      const fcmToken = localStorage.getItem('fcm_token');
      if (fcmToken) {
        const { storeUserFCMToken } = await import('./firebaseNotificationSender');
        storeUserFCMToken(firebaseUser.uid, 'student', fcmToken, student.busNumber || undefined);
      }
    } catch (error) {
      logger.error('Error storing FCM token during registration:', error);
    }

    await setDoc(doc(collection(db, 'users'), firebaseUser.uid), {
      ...studentData,
      uid: firebaseUser.uid,
    });

    logger.log('Student registered successfully:', firebaseUser.uid);
    toast.success('Registration successful! Your data has been saved to Firebase.');

    return firebaseUser;
  } catch (error: any) {
    logger.error('Error registering student to Firebase:', error);

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

export async function loginWithFirebase(
  email: string,
  password: string
): Promise<{ firebaseUser: FirebaseUser; userData: User } | null> {
  if (!auth || !db) {
    logger.error('Firebase Auth or Firestore is not initialized');
    return null;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Fetch both collections in parallel instead of sequentially
    const [studentSnap, userSnap] = await Promise.all([
      getDoc(doc(db, 'students', firebaseUser.uid)),
      getDoc(doc(db, 'users', firebaseUser.uid)),
    ]);

    if (studentSnap.exists()) return { firebaseUser, userData: studentSnap.data() as Student };
    if (userSnap.exists()) return { firebaseUser, userData: userSnap.data() as User };

    logger.warn('User data not found in Firestore for uid:', firebaseUser.uid);
    return null;
  } catch (error: any) {
    logger.error('Error logging in with Firebase:', error);
    return null;
  }
}

export async function getUserDataFromFirebase(uid: string): Promise<User | null> {
  if (!db) {
    logger.error('Firestore is not initialized');
    return null;
  }

  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (userSnap.exists()) return userSnap.data() as User;

    const studentSnap = await getDoc(doc(db, 'students', uid));
    if (studentSnap.exists()) return studentSnap.data() as Student;

    return null;
  } catch (error) {
    logger.error('Error getting user data from Firebase:', error);
    return null;
  }
}

export async function getUserDataByEmail(email: string): Promise<User | null> {
  if (!db) {
    logger.error('Firestore is not initialized');
    return null;
  }

  try {
    const usersSnap = await getDocs(query(collection(db, 'users'), where('email', '==', email.toLowerCase())));
    if (!usersSnap.empty) return usersSnap.docs[0].data() as User;

    const studentsSnap = await getDocs(query(collection(db, 'students'), where('email', '==', email.toLowerCase())));
    if (!studentsSnap.empty) return studentsSnap.docs[0].data() as Student;

    return null;
  } catch (error) {
    logger.error('Error getting user data by email:', error);
    return null;
  }
}

export async function logoutFromFirebase(): Promise<void> {
  if (!auth) {
    logger.error('Firebase Auth is not initialized');
    return;
  }

  try {
    await signOut(auth);
  } catch (error) {
    logger.error('Error logging out from Firebase:', error);
    throw error;
  }
}

export async function checkStudentIdExists(studentId: string): Promise<boolean> {
  if (!db) {
    logger.error('Firestore is not initialized');
    return false;
  }

  try {
    const snap = await getDocs(query(collection(db, 'students'), where('studentId', '==', studentId)));
    return !snap.empty;
  } catch (error) {
    logger.error('Error checking student ID existence:', error);
    return false;
  }
}
