// Authentication utilities
import { User, UserRole, Student } from '../types';
import { mockAdmins, mockDrivers, mockStudents, mockSuperAdmins, mockModerators, DEFAULT_PASSWORD } from '../data/mockData';

const AUTH_KEY = 'uits_bus_auth';
const STUDENTS_KEY = 'uits_bus_students';

export async function login(username: string, password: string, role: UserRole): Promise<User | null> {
  // In a real app, this would call an API
  if (password !== DEFAULT_PASSWORD && password !== 'password') return null;

  if (role === 'admin') {
    return mockAdmins.find(a => a.username === username) || null;
  } else if (role === 'driver') {
    return mockDrivers.find(d => d.username === username) || null;
  } else if (role === 'student') {
    const students = await getStoredStudents();
    return students.find(s => s.username === username) || null;
  } else if (role === 'moderator') {
    return mockModerators.find(m => m.username === username) || null;
  } else if (role === 'super_admin') {
    return mockSuperAdmins.find(sa => sa.username === username) || null;
  }

  return null;
}

// Email-based login - automatically detects role from email
export async function loginByEmail(email: string, password: string): Promise<User | null> {
  const emailLower = email.toLowerCase().trim();

  // First, try Firebase Auth for students (if email ends with @uits.edu)
  if (emailLower.endsWith('@uits.edu')) {
    try {
      const { loginWithFirebase } = await import('./firebaseAuth');
      const result = await loginWithFirebase(emailLower, password);
      
      if (result) {
        // Successfully logged in with Firebase Auth
        return result.userData;
      }
    } catch (error: any) {
      // If Firebase Auth fails, continue to check other methods
      console.log('Firebase Auth login failed, trying fallback methods:', error.message);
    }
  }

  // Fallback: Accept both "password" and DEFAULT_PASSWORD for demo purposes (for non-student roles)
  if (password !== DEFAULT_PASSWORD && password !== 'password') {
    // For students, if Firebase Auth failed, don't allow login with default password
    if (emailLower.endsWith('@uits.edu')) {
      return null;
    }
    return null;
  }

  // Search in students (from Firestore)
  const students = await getStoredStudents();
  const student = students.find(s => s.email?.toLowerCase() === emailLower);
  if (student) return student;

  // Search in super admins
  const superAdmin = mockSuperAdmins.find(sa => sa.email?.toLowerCase() === emailLower);
  if (superAdmin) return superAdmin;

  // Search in moderators
  const moderator = mockModerators.find(m => m.email?.toLowerCase() === emailLower);
  if (moderator) return moderator;

  // Search in admins
  const admin = mockAdmins.find(a => a.email?.toLowerCase() === emailLower);
  if (admin) return admin;

  // Search in drivers
  const driver = mockDrivers.find(d => d.email?.toLowerCase() === emailLower);
  if (driver) return driver;

  return null;
}

export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem(AUTH_KEY);
  if (!userStr) return null;
  return JSON.parse(userStr);
}

export function setCurrentUser(user: User): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

export async function registerStudent(student: Student, password: string): Promise<boolean> {
  try {
    // Register to Firebase
    const { registerStudentToFirebase } = await import('./firebaseAuth');
    const firebaseUser = await registerStudentToFirebase(student, password);
    
    if (firebaseUser) {
      // Save to Firestore
      const { saveStudent } = await import('./firestoreService');
      const success = await saveStudent(student);
      if (!success) {
        console.warn('Failed to save student to Firestore');
      }
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error in registerStudent:', error);
    return false;
  }
}

export async function getStoredStudents(): Promise<Student[]> {
  try {
    const { getStudents } = await import('./firestoreService');
    const students = await getStudents();
    if (students.length > 0) {
      return students;
    }
    // Fallback to mock data if Firestore is empty
    return [...mockStudents];
  } catch (error) {
    console.error('Error fetching students from Firestore:', error);
    // Fallback to mock data
    return [...mockStudents];
  }
}

export async function updateStudent(student: Student): Promise<void> {
  try {
    const { updateStudent: updateStudentInFirestore } = await import('./firestoreService');
    await updateStudentInFirestore(student);
  } catch (error) {
    console.error('Error updating student in Firestore:', error);
  }
}
