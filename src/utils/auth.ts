import { User, UserRole, Student } from '../types';
import { mockAdmins, mockDrivers, mockStudents, mockSuperAdmins, mockModerators, DEFAULT_PASSWORD } from '../data/mockData';
import { logger } from './logger';

const AUTH_KEY = 'uits_bus_auth';

export async function login(username: string, password: string, role: UserRole): Promise<User | null> {
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

export async function loginByEmail(email: string, password: string): Promise<User | null> {
  const emailLower = email.toLowerCase().trim();

  // Fast path: check static mock data first (instant, no network).
  // Mock accounts are only valid with the default password.
  if (password === DEFAULT_PASSWORD || password === 'password') {
    const mockUser =
      mockSuperAdmins.find(u => u.email?.toLowerCase() === emailLower) ||
      mockModerators.find(u => u.email?.toLowerCase() === emailLower) ||
      mockAdmins.find(u => u.email?.toLowerCase() === emailLower) ||
      mockDrivers.find(u => u.email?.toLowerCase() === emailLower) ||
      mockStudents.find(u => u.email?.toLowerCase() === emailLower);
    if (mockUser) return mockUser;
  }

  // Firebase path for real registered users
  if (emailLower.endsWith('@uits.edu')) {
    try {
      const { loginWithFirebase } = await import('./firebaseAuth');
      const result = await loginWithFirebase(emailLower, password);
      if (result) return result.userData;
    } catch (error: any) {
      logger.log('Firebase Auth login failed:', error.message);
    }
  }

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
    const { registerStudentToFirebase } = await import('./firebaseAuth');
    const firebaseUser = await registerStudentToFirebase(student, password);

    if (firebaseUser) {
      const { saveStudent } = await import('./firestoreService');
      const success = await saveStudent(student);
      if (!success) logger.warn('Failed to save student to Firestore');
      return true;
    }

    return false;
  } catch (error) {
    logger.error('Error in registerStudent:', error);
    return false;
  }
}

export async function getStoredStudents(): Promise<Student[]> {
  try {
    const { getStudents } = await import('./firestoreService');
    const students = await getStudents();
    if (students.length > 0) return students;
    return [...mockStudents];
  } catch (error) {
    logger.error('Error fetching students from Firestore:', error);
    return [...mockStudents];
  }
}

export async function updateStudent(student: Student): Promise<void> {
  try {
    const { updateStudent: updateStudentInFirestore } = await import('./firestoreService');
    await updateStudentInFirestore(student);
  } catch (error) {
    logger.error('Error updating student in Firestore:', error);
  }
}
