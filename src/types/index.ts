// Types for the UITS Bus Management System

export type UserRole = 'admin' | 'student' | 'driver' | 'super_admin' | 'moderator';

export interface User {
  id: string;
  username: string;
  email?: string;
  password?: string;
  role: UserRole;
  name: string;
}

export interface Student extends User {
  role: 'student';
  email: string;
  password: string;
  studentId: string;
  batch: string;
  phone: string;
  bloodGroup: string;
  emergencyContact: string;
  busNumber?: string;
}

export interface Admin extends User {
  role: 'admin';
  email?: string;
  password?: string;
  assignedBuses: string[];
}

export interface SuperAdmin extends User {
  role: 'super_admin';
  email: string;
  password: string;
}

export interface Moderator extends User {
  role: 'moderator';
  email: string;
  password: string;
  assignedBuses?: string[];
}

export interface Driver extends User {
  role: 'driver';
  email?: string;
  password?: string;
  busNumber?: string;
  phone: string;
}

export interface Bus {
  number: string;
  route: string;
  driverName: string;
  driverPhone: string;
  adminName: string;
  capacity: number;
  currentStudents: number;
  status: 'on-time' | 'delayed' | 'full';
  delayMinutes?: number;
  currentLocation: { lat: number; lng: number };
  stops: BusStop[];
}

export interface BusStop {
  name: string;
  location: { lat: number; lng: number };
  estimatedTime: string;
}

export interface Notification {
  id: string;
  busNumber: string;
  message: string;
  timestamp: Date;
  adminName: string;
}

export interface Report {
  id: string;
  studentId: string;
  busNumber: string;
  type: 'bus_late' | 'behaviour_issue' | 'accident' | 'bus_hygiene' | 'other';
  description?: string;
  timestamp: Date;
  status: 'pending' | 'resolved';
}
