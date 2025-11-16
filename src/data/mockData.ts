// Mock data for UITS Bus Management System
import { Bus, Admin, Driver, Student, SuperAdmin, Moderator } from '../types';

export const mockBuses: Bus[] = [
  {
    number: 'Bus 1',
    route: 'Dhaka Route - Uttara, Mohakhali, Farmgate, Shahbagh, UITS',
    driverName: 'Kamal Hossain',
    driverPhone: '+880 1711-123456',
    adminName: 'Admin Rahman',
    capacity: 40,
    currentStudents: 28,
    status: 'on-time',
    currentLocation: { lat: 23.8103, lng: 90.4125 },
    stops: [
      { name: 'Uttara Sector 7', location: { lat: 23.8759, lng: 90.3795 }, estimatedTime: '7:30 AM' },
      { name: 'Mohakhali', location: { lat: 23.7808, lng: 90.4028 }, estimatedTime: '7:50 AM' },
      { name: 'Farmgate', location: { lat: 23.7577, lng: 90.3897 }, estimatedTime: '8:05 AM' },
      { name: 'Shahbagh', location: { lat: 23.7389, lng: 90.3950 }, estimatedTime: '8:20 AM' },
      { name: 'UITS Campus', location: { lat: 23.8103, lng: 90.4125 }, estimatedTime: '8:35 AM' },
    ],
  },
  {
    number: 'Bus 2',
    route: 'Dhaka Route - Mirpur, Shyamoli, Dhanmondi, UITS',
    driverName: 'Abdul Jabbar',
    driverPhone: '+880 1712-234567',
    adminName: 'Admin Rahman',
    capacity: 40,
    currentStudents: 35,
    status: 'delayed',
    delayMinutes: 10,
    currentLocation: { lat: 23.7465, lng: 90.3776 },
    stops: [
      { name: 'Mirpur 10', location: { lat: 23.8069, lng: 90.3685 }, estimatedTime: '7:25 AM' },
      { name: 'Shyamoli', location: { lat: 23.7653, lng: 90.3686 }, estimatedTime: '7:45 AM' },
      { name: 'Dhanmondi 27', location: { lat: 23.7465, lng: 90.3776 }, estimatedTime: '8:00 AM' },
      { name: 'UITS Campus', location: { lat: 23.8103, lng: 90.4125 }, estimatedTime: '8:30 AM' },
    ],
  },
  {
    number: 'Bus 3',
    route: 'Dhaka Route - Gulshan, Badda, Rampura, UITS',
    driverName: 'Rafiq Ahmed',
    driverPhone: '+880 1713-345678',
    adminName: 'Admin Khan',
    capacity: 40,
    currentStudents: 40,
    status: 'full',
    currentLocation: { lat: 23.7809, lng: 90.4161 },
    stops: [
      { name: 'Gulshan 2', location: { lat: 23.7925, lng: 90.4078 }, estimatedTime: '7:20 AM' },
      { name: 'Badda', location: { lat: 23.7809, lng: 90.4267 }, estimatedTime: '7:35 AM' },
      { name: 'Rampura', location: { lat: 23.7588, lng: 90.4215 }, estimatedTime: '7:50 AM' },
      { name: 'UITS Campus', location: { lat: 23.8103, lng: 90.4125 }, estimatedTime: '8:15 AM' },
    ],
  },
  {
    number: 'Bus 4',
    route: 'Dhaka Route - Banani, Mohakhali, Tejgaon, UITS',
    driverName: 'Shafiq Islam',
    driverPhone: '+880 1714-456789',
    adminName: 'Admin Khan',
    capacity: 40,
    currentStudents: 22,
    status: 'on-time',
    currentLocation: { lat: 23.7936, lng: 90.4066 },
    stops: [
      { name: 'Banani', location: { lat: 23.7936, lng: 90.4066 }, estimatedTime: '7:25 AM' },
      { name: 'Mohakhali', location: { lat: 23.7808, lng: 90.4028 }, estimatedTime: '7:40 AM' },
      { name: 'Tejgaon', location: { lat: 23.7574, lng: 90.3910 }, estimatedTime: '7:55 AM' },
      { name: 'UITS Campus', location: { lat: 23.8103, lng: 90.4125 }, estimatedTime: '8:20 AM' },
    ],
  },
  {
    number: 'Bus 5',
    route: 'Dhaka Route - Uttara, Airport, Banani, UITS',
    driverName: 'Habib Rahman',
    driverPhone: '+880 1715-567890',
    adminName: 'Admin Ahmed',
    capacity: 40,
    currentStudents: 30,
    status: 'on-time',
    currentLocation: { lat: 23.8759, lng: 90.3795 },
    stops: [
      { name: 'Uttara Sector 11', location: { lat: 23.8759, lng: 90.3795 }, estimatedTime: '7:15 AM' },
      { name: 'Airport Road', location: { lat: 23.8486, lng: 90.3976 }, estimatedTime: '7:30 AM' },
      { name: 'Banani', location: { lat: 23.7936, lng: 90.4066 }, estimatedTime: '7:50 AM' },
      { name: 'UITS Campus', location: { lat: 23.8103, lng: 90.4125 }, estimatedTime: '8:25 AM' },
    ],
  },
];

// Default password for all mock users (in real app, this would be hashed)
export const DEFAULT_PASSWORD = 'password123';

// Mock users for login
export const mockSuperAdmins: SuperAdmin[] = [
  { 
    id: 'superadmin1', 
    username: 'superadmin', 
    email: 'superadmin@uits.edu',
    password: DEFAULT_PASSWORD,
    role: 'super_admin', 
    name: 'Super Admin' 
  },
];

export const mockModerators: Moderator[] = [
  { 
    id: 'moderator1', 
    username: 'moderator', 
    email: 'moderator@uits.edu',
    password: DEFAULT_PASSWORD,
    role: 'moderator', 
    name: 'Moderator',
    assignedBuses: ['Bus 1', 'Bus 2', 'Bus 3', 'Bus 4', 'Bus 5']
  },
];

export const mockAdmins: Admin[] = [
  { 
    id: 'admin1', 
    username: 'admin', 
    email: 'admin@uits.edu',
    password: DEFAULT_PASSWORD,
    role: 'admin', 
    name: 'Admin Rahman', 
    assignedBuses: ['Bus 1', 'Bus 2'] 
  },
  { 
    id: 'admin2', 
    username: 'admin2', 
    email: 'admin2@uits.edu',
    password: DEFAULT_PASSWORD,
    role: 'admin', 
    name: 'Admin Khan', 
    assignedBuses: ['Bus 3', 'Bus 4'] 
  },
  { 
    id: 'admin3', 
    username: 'admin3', 
    email: 'admin3@uits.edu',
    password: DEFAULT_PASSWORD,
    role: 'admin', 
    name: 'Admin Ahmed', 
    assignedBuses: ['Bus 5'] 
  },
];

export const mockDrivers: Driver[] = [
  { 
    id: 'driver1', 
    username: 'driver1', 
    email: 'driver@uits.edu',
    password: DEFAULT_PASSWORD,
    role: 'driver', 
    name: 'Kamal Hossain', 
    busNumber: 'Bus 1', 
    phone: '+880 1711-123456' 
  },
  { 
    id: 'driver2', 
    username: 'driver2', 
    email: 'driver2@uits.edu',
    password: DEFAULT_PASSWORD,
    role: 'driver', 
    name: 'Abdul Jabbar', 
    busNumber: 'Bus 2', 
    phone: '+880 1712-234567' 
  },
  { 
    id: 'driver3', 
    username: 'driver3', 
    email: 'driver3@uits.edu',
    password: DEFAULT_PASSWORD,
    role: 'driver', 
    name: 'Rafiq Ahmed', 
    busNumber: 'Bus 3', 
    phone: '+880 1713-345678' 
  },
  { 
    id: 'driver4', 
    username: 'driver4', 
    email: 'driver4@uits.edu',
    password: DEFAULT_PASSWORD,
    role: 'driver', 
    name: 'Shafiq Islam', 
    busNumber: 'Bus 4', 
    phone: '+880 1714-456789' 
  },
  { 
    id: 'driver5', 
    username: 'driver5', 
    email: 'driver5@uits.edu',
    password: DEFAULT_PASSWORD,
    role: 'driver', 
    name: 'Habib Rahman', 
    busNumber: 'Bus 5', 
    phone: '+880 1715-567890' 
  },
];

// Students will be stored in localStorage after registration
export const mockStudents: Student[] = [
  {
    id: 'student1',
    username: 'student',
    email: 'student@uits.edu',
    password: DEFAULT_PASSWORD,
    role: 'student',
    name: 'Demo Student',
    studentId: 'S001',
    batch: '2023',
    phone: '+880 1611-111111',
    bloodGroup: 'A+',
    emergencyContact: '+880 1711-111111',
    busNumber: 'Bus 1',
  },
];

