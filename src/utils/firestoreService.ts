/**
 * Firestore service for managing all data operations
 * Replaces localStorage with Firebase Firestore
 */

import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  addDoc,
  increment,
  limit,
} from 'firebase/firestore';
import { Bus, Moderator, Driver, Student, Notification, Report } from '../types';
import { logger } from './logger';

const NOTIFICATION_LIMIT = 50;
const REPORT_LIMIT = 50;

// Collection names
const COLLECTIONS = {
  BUSES: 'buses',
  MODERATORS: 'moderators',
  DRIVERS: 'drivers',
  STUDENTS: 'students',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
} as const;

// Helper to convert Firestore timestamps to Date
const convertTimestamp = (data: any): any => {
  if (!data) return data;
  if (data instanceof Timestamp) {
    return data.toDate();
  }
  if (Array.isArray(data)) {
    return data.map(convertTimestamp);
  }
  if (typeof data === 'object') {
    const converted: any = {};
    for (const key in data) {
      converted[key] = convertTimestamp(data[key]);
    }
    return converted;
  }
  return data;
};

// Helper to convert Date to Firestore Timestamp
const convertToFirestore = (data: any): any => {
  if (!data) return data;
  if (data instanceof Date) {
    return Timestamp.fromDate(data);
  }
  if (Array.isArray(data)) {
    return data.map(convertToFirestore);
  }
  if (typeof data === 'object') {
    const converted: any = {};
    for (const key in data) {
      converted[key] = convertToFirestore(data[key]);
    }
    return converted;
  }
  return data;
};

// ==================== BUSES ====================

export async function getBuses(): Promise<Bus[]> {
  if (!db) {
    console.warn('Firestore not initialized');
    return [];
  }
  try {
    const busesRef = collection(db, COLLECTIONS.BUSES);
    const snapshot = await getDocs(busesRef);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return convertTimestamp({ ...data, id: doc.id }) as Bus;
    });
  } catch (error) {
    console.error('Error fetching buses:', error);
    return [];
  }
}

export async function getBus(busNumber: string): Promise<Bus | null> {
  if (!db) return null;
  try {
    const busRef = doc(db, COLLECTIONS.BUSES, busNumber);
    const busSnap = await getDoc(busRef);
    if (busSnap.exists()) {
      return convertTimestamp({ ...busSnap.data(), id: busSnap.id }) as Bus;
    }
    return null;
  } catch (error) {
    console.error('Error fetching bus:', error);
    return null;
  }
}

export async function saveBus(bus: Bus): Promise<boolean> {
  if (!db) return false;
  try {
    const busRef = doc(db, COLLECTIONS.BUSES, bus.number);
    await setDoc(busRef, convertToFirestore(bus), { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving bus:', error);
    return false;
  }
}

export async function saveBuses(buses: Bus[]): Promise<boolean> {
  if (!db) return false;
  const firestoreDb = db;
  try {
    const promises = buses.map(bus => {
      const busRef = doc(firestoreDb, COLLECTIONS.BUSES, bus.number);
      return setDoc(busRef, convertToFirestore(bus), { merge: true });
    });
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('Error saving buses:', error);
    return false;
  }
}

export async function deleteBus(busNumber: string): Promise<boolean> {
  if (!db) return false;
  try {
    const busRef = doc(db, COLLECTIONS.BUSES, busNumber);
    await deleteDoc(busRef);
    return true;
  } catch (error) {
    console.error('Error deleting bus:', error);
    return false;
  }
}

// Increment bus capacity when student scans QR code
export async function incrementBusCapacity(busNumber: string): Promise<{ success: boolean; currentStudents: number; capacity: number; isFull: boolean }> {
  if (!db) {
    return { success: false, currentStudents: 0, capacity: 0, isFull: false };
  }
  
  try {
    const busRef = doc(db, COLLECTIONS.BUSES, busNumber);
    
    // First, get the current bus data to check capacity
    const busSnap = await getDoc(busRef);
    if (!busSnap.exists()) {
      console.error('Bus not found:', busNumber);
      return { success: false, currentStudents: 0, capacity: 0, isFull: false };
    }
    
    const busData = busSnap.data() as Bus;
    const currentStudents = busData.currentStudents || 0;
    const capacity = busData.capacity || 40;
    
    // Check if bus is already full
    if (currentStudents >= capacity) {
      return { 
        success: false, 
        currentStudents, 
        capacity, 
        isFull: true 
      };
    }
    
    // Atomically increment currentStudents
    await updateDoc(busRef, {
      currentStudents: increment(1),
      status: currentStudents + 1 >= capacity ? 'full' : busData.status || 'on-time',
    });
    
    const newCurrentStudents = currentStudents + 1;
    
    return {
      success: true,
      currentStudents: newCurrentStudents,
      capacity,
      isFull: newCurrentStudents >= capacity,
    };
  } catch (error) {
    console.error('Error incrementing bus capacity:', error);
    return { success: false, currentStudents: 0, capacity: 0, isFull: false };
  }
}

// Decrement bus capacity when student leaves (optional, for future use)
export async function decrementBusCapacity(busNumber: string): Promise<boolean> {
  if (!db) return false;
  try {
    const busRef = doc(db, COLLECTIONS.BUSES, busNumber);
    
    // Get current bus data
    const busSnap = await getDoc(busRef);
    if (!busSnap.exists()) {
      return false;
    }
    
    const busData = busSnap.data() as Bus;
    const currentStudents = Math.max(0, (busData.currentStudents || 0) - 1);
    
    await updateDoc(busRef, {
      currentStudents: increment(-1),
      status: currentStudents <= 0 ? 'on-time' : currentStudents < busData.capacity ? 'on-time' : 'full',
    });
    
    return true;
  } catch (error) {
    console.error('Error decrementing bus capacity:', error);
    return false;
  }
}

export function subscribeToBuses(callback: (buses: Bus[]) => void): () => void {
  if (!db) {
    return () => {};
  }
  const busesRef = collection(db, COLLECTIONS.BUSES);
  return onSnapshot(busesRef, (snapshot) => {
    const buses = snapshot.docs.map(doc => {
      const data = doc.data();
      return convertTimestamp({ ...data, id: doc.id }) as Bus;
    });
    callback(buses);
  });
}

// ==================== MODERATORS ====================

export async function getModerators(): Promise<Moderator[]> {
  if (!db) return [];
  try {
    const moderatorsRef = collection(db, COLLECTIONS.MODERATORS);
    const snapshot = await getDocs(moderatorsRef);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return convertTimestamp({ ...data, id: doc.id }) as Moderator;
    });
  } catch (error) {
    console.error('Error fetching moderators:', error);
    return [];
  }
}

export async function getModerator(id: string): Promise<Moderator | null> {
  if (!db) return null;
  try {
    const moderatorRef = doc(db, COLLECTIONS.MODERATORS, id);
    const moderatorSnap = await getDoc(moderatorRef);
    if (moderatorSnap.exists()) {
      return convertTimestamp({ ...moderatorSnap.data(), id: moderatorSnap.id }) as Moderator;
    }
    return null;
  } catch (error) {
    console.error('Error fetching moderator:', error);
    return null;
  }
}

export async function saveModerator(moderator: Moderator): Promise<boolean> {
  if (!db) return false;
  try {
    const moderatorRef = doc(db, COLLECTIONS.MODERATORS, moderator.id);
    await setDoc(moderatorRef, convertToFirestore(moderator), { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving moderator:', error);
    return false;
  }
}

export async function saveModerators(moderators: Moderator[]): Promise<boolean> {
  if (!db) return false;
  const firestoreDb = db;
  try {
    const promises = moderators.map(moderator => {
      const moderatorRef = doc(firestoreDb, COLLECTIONS.MODERATORS, moderator.id);
      return setDoc(moderatorRef, convertToFirestore(moderator), { merge: true });
    });
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('Error saving moderators:', error);
    return false;
  }
}

export async function deleteModerator(id: string): Promise<boolean> {
  if (!db) return false;
  try {
    const moderatorRef = doc(db, COLLECTIONS.MODERATORS, id);
    await deleteDoc(moderatorRef);
    return true;
  } catch (error) {
    console.error('Error deleting moderator:', error);
    return false;
  }
}

// ==================== DRIVERS ====================

export async function getDrivers(): Promise<Driver[]> {
  if (!db) return [];
  try {
    const driversRef = collection(db, COLLECTIONS.DRIVERS);
    const snapshot = await getDocs(driversRef);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return convertTimestamp({ ...data, id: doc.id }) as Driver;
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return [];
  }
}

export async function getDriver(id: string): Promise<Driver | null> {
  if (!db) return null;
  try {
    const driverRef = doc(db, COLLECTIONS.DRIVERS, id);
    const driverSnap = await getDoc(driverRef);
    if (driverSnap.exists()) {
      return convertTimestamp({ ...driverSnap.data(), id: driverSnap.id }) as Driver;
    }
    return null;
  } catch (error) {
    console.error('Error fetching driver:', error);
    return null;
  }
}

export async function saveDriver(driver: Driver): Promise<boolean> {
  if (!db) return false;
  try {
    const driverRef = doc(db, COLLECTIONS.DRIVERS, driver.id);
    await setDoc(driverRef, convertToFirestore(driver), { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving driver:', error);
    return false;
  }
}

export async function saveDrivers(drivers: Driver[]): Promise<boolean> {
  if (!db) return false;
  const firestoreDb = db;
  try {
    const promises = drivers.map(driver => {
      const driverRef = doc(firestoreDb, COLLECTIONS.DRIVERS, driver.id);
      return setDoc(driverRef, convertToFirestore(driver), { merge: true });
    });
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('Error saving drivers:', error);
    return false;
  }
}

export async function deleteDriver(id: string): Promise<boolean> {
  if (!db) return false;
  try {
    const driverRef = doc(db, COLLECTIONS.DRIVERS, id);
    await deleteDoc(driverRef);
    return true;
  } catch (error) {
    console.error('Error deleting driver:', error);
    return false;
  }
}

// ==================== STUDENTS ====================

export async function getStudents(): Promise<Student[]> {
  if (!db) return [];
  try {
    const studentsRef = collection(db, COLLECTIONS.STUDENTS);
    const snapshot = await getDocs(studentsRef);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return convertTimestamp({ ...data, id: doc.id }) as Student;
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
}

export async function getStudent(id: string): Promise<Student | null> {
  if (!db) return null;
  try {
    const studentRef = doc(db, COLLECTIONS.STUDENTS, id);
    const studentSnap = await getDoc(studentRef);
    if (studentSnap.exists()) {
      return convertTimestamp({ ...studentSnap.data(), id: studentSnap.id }) as Student;
    }
    return null;
  } catch (error) {
    console.error('Error fetching student:', error);
    return null;
  }
}

export async function saveStudent(student: Student): Promise<boolean> {
  if (!db) return false;
  try {
    const studentRef = doc(db, COLLECTIONS.STUDENTS, student.id);
    await setDoc(studentRef, convertToFirestore(student), { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving student:', error);
    return false;
  }
}

export async function updateStudent(student: Student): Promise<boolean> {
  if (!db) return false;
  try {
    const studentRef = doc(db, COLLECTIONS.STUDENTS, student.id);
    await updateDoc(studentRef, convertToFirestore(student));
    return true;
  } catch (error) {
    console.error('Error updating student:', error);
    return false;
  }
}

// ==================== NOTIFICATIONS ====================

export async function getNotifications(busNumber?: string): Promise<Notification[]> {
  if (!db) return [];
  try {
    const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
    const q = busNumber
      ? query(notificationsRef, where('busNumber', '==', busNumber), orderBy('timestamp', 'desc'), limit(NOTIFICATION_LIMIT))
      : query(notificationsRef, orderBy('timestamp', 'desc'), limit(NOTIFICATION_LIMIT));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => convertTimestamp({ ...doc.data(), id: doc.id }) as Notification);
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    return [];
  }
}

export async function saveNotification(notification: Notification): Promise<boolean> {
  if (!db) {
    console.error('Firestore not initialized - db is null');
    return false;
  }
  try {
    const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
    // Remove the id field since Firestore will auto-generate it
    const { id, ...notificationData } = notification;
    
    // Ensure timestamp is a Date object before conversion
    const dataToSave = {
      ...notificationData,
      timestamp: notificationData.timestamp instanceof Date 
        ? Timestamp.fromDate(notificationData.timestamp)
        : Timestamp.now(),
    };
    
    await addDoc(notificationsRef, dataToSave);
    return true;
  } catch (error: any) {
    logger.error('Error saving notification:', error?.code, error?.message);
    return false;
  }
}

export function subscribeToNotifications(
  callback: (notifications: Notification[]) => void,
  busNumber?: string
): () => void {
  if (!db) return () => {};
  const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
  const q = busNumber
    ? query(notificationsRef, where('busNumber', '==', busNumber), orderBy('timestamp', 'desc'), limit(NOTIFICATION_LIMIT))
    : query(notificationsRef, orderBy('timestamp', 'desc'), limit(NOTIFICATION_LIMIT));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => convertTimestamp({ ...doc.data(), id: doc.id }) as Notification));
  });
}

// ==================== REPORTS ====================

export async function getReports(studentId?: string): Promise<Report[]> {
  if (!db) return [];
  try {
    const reportsRef = collection(db, COLLECTIONS.REPORTS);
    const q = studentId
      ? query(reportsRef, where('studentId', '==', studentId), orderBy('timestamp', 'desc'), limit(REPORT_LIMIT))
      : query(reportsRef, orderBy('timestamp', 'desc'), limit(REPORT_LIMIT));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => convertTimestamp({ ...doc.data(), id: doc.id }) as Report);
  } catch (error) {
    logger.error('Error fetching reports:', error);
    return [];
  }
}

export async function saveReport(report: Report): Promise<boolean> {
  if (!db) {
    console.error('Firestore not initialized - db is null');
    return false;
  }
  try {
    const reportsRef = collection(db, COLLECTIONS.REPORTS);
    // Remove the id field since Firestore will auto-generate it
    const { id, ...reportData } = report;

    // Ensure timestamp is a Date object before conversion
    const dataToSave: any = {
      studentId: reportData.studentId,
      busNumber: reportData.busNumber,
      type: reportData.type,
      timestamp: reportData.timestamp instanceof Date
        ? Timestamp.fromDate(reportData.timestamp)
        : Timestamp.now(),
      status: reportData.status || 'pending',
    };

    // Add description only if it exists
    if (reportData.description) {
      dataToSave.description = reportData.description;
    }

    await addDoc(reportsRef, dataToSave);
    return true;
  } catch (error: any) {
    logger.error('Error saving report:', error?.code, error?.message);
    return false;
  }
}

export function subscribeToReports(
  callback: (reports: Report[]) => void,
  busNumber?: string
): () => void {
  if (!db) return () => {};
  const reportsRef = collection(db, COLLECTIONS.REPORTS);
  const q = busNumber
    ? query(reportsRef, where('busNumber', '==', busNumber), orderBy('timestamp', 'desc'), limit(REPORT_LIMIT))
    : query(reportsRef, orderBy('timestamp', 'desc'), limit(REPORT_LIMIT));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => convertTimestamp({ ...doc.data(), id: doc.id }) as Report));
  });
}

