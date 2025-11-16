# UITS Bus Management System - Software Development Project Report Prompt

## Project Overview

**Project Name:** UITS Bus Management System  
**Type:** Progressive Web Application (PWA)  
**Technology Stack:** React, TypeScript, Firebase, Vite, Tailwind CSS  
**Domain:** Educational Transportation Management System  
**Target Users:** Students, Administrators, Moderators, Drivers, Super Admins  

---

## 1. COMPLETE PROJECT SUMMARY

### System Purpose
A comprehensive web-based bus management system for UITS (University of Information Technology and Sciences) that enables real-time bus tracking, capacity management, QR code scanning, notification system, and incident reporting. The system replaces manual bus management processes with an automated, cloud-based solution.

### Core Functionalities Implemented

#### 1.1 User Authentication & Authorization
- **Multi-role System:** 5 user roles (Super Admin, Admin, Moderator, Driver, Student)
- **Firebase Authentication:** Email/password authentication for all users
- **Student Registration:** 
  - Self-registration with studentId@uits.edu email format
  - Firebase Authentication integration
  - Data stored in Firestore
- **Login System:**
  - Role-based dashboard routing
  - Student login with studentId@uits.edu + password
  - Session management
  - Password-based authentication for other roles

#### 1.2 Bus Management (Super Admin Only)
- **CRUD Operations:**
  - Add new buses with: Bus Number, Route, Driver Name, Driver Phone, Admin Name, Capacity
  - Edit existing bus details
  - Delete buses
  - Real-time updates via Firestore subscriptions
- **QR Code Generation:**
  - Automatic QR code generation when bus is created/updated
  - QR code contains JSON data: {busNumber, route, driverName, driverPhone, adminName, capacity}
  - View QR code in dialog
  - Download QR code as PNG image
  - QR codes saved to Firebase

#### 1.3 QR Code Scanning (Students)
- **QR Scanner:**
  - Camera-based QR code scanning using html5-qrcode library
  - Mobile-optimized with rear camera support
  - Parses both JSON format (new) and text format (legacy)
- **Bus Connection:**
  - When student scans QR code:
    - Increments bus capacity atomically in Firebase
    - Updates student's assigned bus
    - Displays bus information (number, route, driver, capacity)
    - Shows available seats in real-time
  - Prevents scanning if bus is full
  - Real-time capacity updates visible to all users

#### 1.4 Real-Time Capacity Management
- **Automatic Capacity Tracking:**
  - When student scans QR code, `currentStudents` increments by 1 in Firebase
  - Uses Firestore's atomic `increment()` operation to prevent race conditions
  - Updates bus status to "full" when capacity reached
  - All dashboards show real-time capacity: `currentStudents / capacity`
  - Available seats displayed: `capacity - currentStudents`
- **Real-Time Updates:**
  - All dashboards subscribe to Firestore changes
  - Capacity changes visible immediately to all users
  - No page refresh required

#### 1.5 Notification System
- **Push Notifications:**
  - Firebase Cloud Messaging (FCM) integration
  - Admins/Super Admins/Moderators can send notifications
  - Prebuilt message templates or custom messages
  - Can target all buses or specific buses
  - Notifications stored in Firestore
- **Student Notification Display:**
  - Popup notifications for latest undismissed notification only
  - Notification tab shows all past notifications
  - Dismiss functionality with localStorage tracking
  - Visual indicators: "New" badge, dismissed notifications grayed out
  - Real-time notification updates

#### 1.6 Report Management System
- **Student Reports:**
  - Students can report issues via Firebase
  - Report types: bus_late, behaviour_issue, accident, bus_hygiene, other
  - Reports require: studentId, busNumber (from QR scan), type, optional description
  - Reports saved to Firestore with status "pending"
- **Report Viewing & Management:**
  - Super Admin, Admin, Moderator can view all reports
  - Admin sees only reports for assigned buses
  - Real-time report updates
  - Mark reports as "resolved"
  - Visual status indicators (pending = red, resolved = green)

#### 1.7 Role-Based Dashboards

**Super Admin Dashboard:**
- Bus Management (CRUD operations)
- Moderator Management (Add/Delete)
- Driver Management (Add/Delete)
- Notification Management (Send notifications, view all)
- Reports Management (View all, mark resolved)
- QR Code Generation & Download

**Admin Dashboard:**
- View assigned buses only
- Send notifications to assigned buses
- Update bus status (on-time, delayed, full)
- View notifications for assigned buses
- View reports for assigned buses
- Mark reports as resolved

**Moderator Dashboard:**
- View all buses (read-only or edit based on permissions)
- Send notifications to all buses or specific buses
- View all notifications
- View all reports
- Mark reports as resolved

**Driver Dashboard:**
- View assigned bus information
- View notifications
- Real-time bus capacity display

**Student Dashboard:**
- QR Code Scanner
- Bus Information Display (after scanning)
- Notifications (Popup + Tab)
- Report Issue functionality
- Real-time capacity tracking

#### 1.8 Data Management (Firebase Firestore)
- **Collections:**
  - `buses` - Bus data (number, route, driver, capacity, currentStudents, status)
  - `students` - Student data (studentId, email, batch, phone, bloodGroup, etc.)
  - `moderators` - Moderator data
  - `drivers` - Driver data
  - `notifications` - Notification messages
  - `reports` - Student reports
  - `fcm_tokens` - Push notification tokens
  - `users` - General user data
- **Real-Time Subscriptions:**
  - All collections have real-time listeners
  - Automatic UI updates when data changes
  - Efficient querying with Firestore indexes

#### 1.9 UI/UX Features
- **Dark Mode Support:** Theme toggle on all dashboards
- **Responsive Design:** Mobile-first, works on all screen sizes
- **Toast Notifications:** Success/error feedback using Sonner
- **Loading States:** Proper loading indicators
- **Error Handling:** Comprehensive error handling with user-friendly messages
- **Accessibility:** Keyboard navigation, ARIA labels

---

## 2. TECHNICAL ARCHITECTURE

### 2.1 Frontend Architecture
- **Framework:** React 18.3.1 with TypeScript
- **Build Tool:** Vite 6.3.5
- **UI Library:** Radix UI components (30+ components)
- **Styling:** Tailwind CSS with custom theme
- **State Management:** React Hooks (useState, useEffect)
- **Routing:** Component-based routing (no React Router - single-page app)

### 2.2 Backend/Cloud Services
- **Database:** Firebase Firestore (NoSQL)
- **Authentication:** Firebase Authentication
- **Push Notifications:** Firebase Cloud Messaging (FCM)
- **Storage:** Firebase Firestore (all data)
- **Real-Time:** Firestore onSnapshot listeners

### 2.3 Key Libraries & Dependencies
- **Firebase SDK:** v12.6.0 (Firestore, Auth, FCM)
- **QR Code:** 
  - `html5-qrcode` v2.3.8 (scanner)
  - `qrcode.react` (generator)
- **Icons:** lucide-react v0.487.0
- **Notifications:** sonner v2.0.7
- **Form Handling:** react-hook-form v7.55.0
- **Charts:** recharts v2.15.2 (for future analytics)

### 2.4 Data Flow Architecture
```
User Action → Component → Service Layer (firestoreService) → Firebase Firestore → Real-time Update → All Subscribed Clients
```

---

## 3. DATABASE SCHEMA (ER Diagram Data)

### 3.1 Collections Structure

**buses**
- Document ID: busNumber (e.g., "Bus 1")
- Fields:
  - number: string
  - route: string
  - driverName: string
  - driverPhone: string
  - adminName: string
  - capacity: number
  - currentStudents: number
  - status: 'on-time' | 'delayed' | 'full'
  - delayMinutes?: number
  - currentLocation: {lat: number, lng: number}
  - stops: Array<{name, location, estimatedTime}>

**students**
- Document ID: Firebase UID
- Fields:
  - id: string
  - username: string
  - email: string (studentId@uits.edu)
  - role: 'student'
  - name: string
  - studentId: string
  - batch: string
  - phone: string
  - bloodGroup: string
  - emergencyContact: string
  - busNumber?: string
  - firebaseUid: string
  - createdAt: Timestamp
  - updatedAt: Timestamp

**moderators**
- Document ID: moderatorId
- Fields:
  - id: string
  - username: string
  - email: string
  - role: 'moderator'
  - name: string
  - password: string
  - assignedBuses?: string[]

**drivers**
- Document ID: driverId
- Fields:
  - id: string
  - username: string
  - email?: string
  - role: 'driver'
  - name: string
  - phone: string
  - busNumber?: string

**notifications**
- Document ID: Auto-generated
- Fields:
  - id: string (auto-generated)
  - busNumber: string
  - message: string
  - timestamp: Timestamp
  - adminName: string

**reports**
- Document ID: Auto-generated
- Fields:
  - id: string (auto-generated)
  - studentId: string
  - busNumber: string
  - type: 'bus_late' | 'behaviour_issue' | 'accident' | 'bus_hygiene' | 'other'
  - description?: string
  - timestamp: Timestamp
  - status: 'pending' | 'resolved'

**fcm_tokens**
- Document ID: userId
- Fields:
  - userId: string
  - token: string
  - role: string
  - busNumber?: string

### 3.2 Relationships
- **Bus → Driver:** One-to-One (driverName, driverPhone fields)
- **Bus → Admin:** One-to-One (adminName field)
- **Student → Bus:** Many-to-One (busNumber field)
- **Report → Student:** Many-to-One (studentId field)
- **Report → Bus:** Many-to-One (busNumber field)
- **Notification → Bus:** Many-to-One (busNumber field)

---

## 4. USER ROLES & PERMISSIONS

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full system access: Manage buses, moderators, drivers, send notifications, view all reports, generate QR codes |
| **Admin** | Manage assigned buses, send notifications to assigned buses, view reports for assigned buses |
| **Moderator** | View all buses (can edit), send notifications, view all reports, mark reports resolved |
| **Driver** | View assigned bus, view notifications, view capacity |
| **Student** | Scan QR codes, view bus info, submit reports, view notifications |

---

## 5. KEY FEATURES & USER STORIES

### 5.1 Student Features
1. **Registration:** Students can self-register with studentId, batch, phone, bloodGroup
2. **Login:** Login with studentId@uits.edu + password
3. **QR Scanning:** Scan bus QR code to connect to bus and increment capacity
4. **Bus Info:** View real-time bus information (route, driver, capacity, available seats)
5. **Notifications:** Receive and view notifications (popup for latest, tab for all)
6. **Reports:** Submit reports about bus issues (late, behavior, accident, hygiene, other)

### 5.2 Admin Features
1. **Bus Management:** Super Admin can add/edit/delete buses
2. **QR Generation:** Super Admin generates and downloads QR codes for buses
3. **Notifications:** Send notifications to students (prebuilt or custom messages)
4. **Reports:** View and manage student reports (mark as resolved)
5. **Capacity Monitoring:** Real-time view of bus capacities across all buses

### 5.3 Driver Features
1. **Bus View:** View assigned bus information
2. **Notifications:** Receive notifications about bus schedule changes
3. **Capacity:** View current bus capacity

---

## 6. SECURITY & FIREBASE RULES

### 6.1 Firestore Security Rules
- **Development Mode:** Open read/write for buses, notifications, reports (for testing)
- **Production Ready:** Role-based access control configured
- **Authentication Required:** All collections require authentication
- **User Data:** Users can only read/write their own data

### 6.2 Authentication
- Firebase Authentication with email/password
- Secure password storage (handled by Firebase)
- Session management via Firebase Auth

---

## 7. PROJECT STRUCTURE

```
uits-bus-management/
├── public/
│   └── firebase-messaging-sw.js (Service Worker for FCM)
├── src/
│   ├── assets/
│   │   └── uits-logo.png
│   ├── components/
│   │   ├── ui/ (30+ reusable UI components)
│   │   ├── AdminDashboard.tsx
│   │   ├── DriverDashboard.tsx
│   │   ├── Login.tsx
│   │   ├── ModeratorDashboard.tsx
│   │   ├── NotificationPopup.tsx
│   │   ├── QRScanner.tsx
│   │   ├── ReportIssue.tsx
│   │   ├── SplashScreen.tsx
│   │   ├── StudentDashboard.tsx
│   │   ├── StudentRegistration.tsx
│   │   ├── SuperAdminDashboard.tsx
│   │   └── ThemeToggle.tsx
│   ├── config/
│   │   └── firebase.ts (Firebase configuration)
│   ├── data/
│   │   └── mockData.ts (Initial mock data)
│   ├── hooks/
│   │   └── useFirebaseMessaging.ts (FCM hook)
│   ├── types/
│   │   └── index.ts (TypeScript interfaces)
│   ├── utils/
│   │   ├── auth.ts (Authentication logic)
│   │   ├── firebaseAuth.ts (Firebase Auth wrapper)
│   │   ├── firestoreService.ts (All Firestore operations)
│   │   ├── firebaseMessaging.ts (FCM setup)
│   │   └── sendFirebaseNotification.ts (Notification sender)
│   ├── App.tsx (Main app component)
│   └── main.tsx (Entry point)
├── firestore.rules (Security rules)
├── firestore.indexes.json (Query indexes)
├── firebase.json (Firebase configuration)
└── package.json (Dependencies)
```

---

## 8. DEPLOYMENT & INFRASTRUCTURE

- **Frontend:** Vite build, can be deployed to Firebase Hosting, Vercel, Netlify
- **Database:** Firebase Firestore (Cloud-hosted)
- **Authentication:** Firebase Authentication (Cloud-hosted)
- **Notifications:** Firebase Cloud Messaging (Cloud-hosted)
- **Development Server:** Vite dev server (localhost:3000)
- **Build Output:** `build/` directory

---

## 9. TESTING SCENARIOS (For Testing Report)

### 9.1 Functional Testing
- [ ] Student registration with valid data
- [ ] Student login with studentId@uits.edu
- [ ] QR code scanning functionality
- [ ] Bus capacity increment on QR scan
- [ ] Notification sending and receiving
- [ ] Report submission
- [ ] Report status update (pending → resolved)
- [ ] Real-time updates across dashboards
- [ ] QR code generation and download
- [ ] Bus CRUD operations
- [ ] Role-based access control

### 9.2 Integration Testing
- [ ] Firebase Authentication integration
- [ ] Firestore read/write operations
- [ ] FCM push notification delivery
- [ ] Real-time subscription updates
- [ ] QR code scanner camera access

### 9.3 User Acceptance Testing
- [ ] Super Admin can manage all resources
- [ ] Admin sees only assigned buses
- [ ] Students can scan QR and see bus info
- [ ] Notifications appear in real-time
- [ ] Reports are visible to admins/moderators

---

## 10. BUSINESS MODEL & ROI

### 10.1 Problem Solved
- Manual bus capacity tracking → Automated QR-based tracking
- Inefficient notification system → Real-time push notifications
- No incident reporting system → Digital report management
- Manual bus management → Centralized dashboard system

### 10.2 Cost Savings (Estimated)
- **Time Savings:** 
  - Bus capacity tracking: 2 hours/day → 5 minutes/day = 110 hours/month
  - Notification management: 1 hour/day → 10 minutes/day = 50 hours/month
  - Report management: 1 hour/day → 15 minutes/day = 45 hours/month
  - **Total:** ~205 hours/month saved
- **Staff Cost:** Assuming $10/hour = $2,050/month savings
- **Annual Savings:** ~$24,600/year

### 10.3 Implementation Costs
- **Development:** Initial development (one-time)
- **Firebase Costs:** 
  - Spark Plan (Free tier): Up to 50,000 reads/day, 20,000 writes/day
  - Blaze Plan (Pay as you go): $0.06 per 100,000 reads, $0.18 per 100,000 writes
  - **Estimated Monthly:** $5-20 for small scale, $50-200 for large scale
- **Hosting:** Firebase Hosting (Free tier available)

### 10.4 ROI Calculation
- **Initial Investment:** Development time + setup
- **Monthly Operational Cost:** Firebase services (~$20-100/month)
- **Monthly Savings:** ~$2,050 (time savings)
- **ROI:** Positive ROI within first month
- **Break-even:** Immediate (if development is in-house)

---

## 11. SOFTWARE REQUIREMENT ANALYSIS

### 11.1 Functional Requirements

**FR1: User Management**
- FR1.1: System shall support 5 user roles (Super Admin, Admin, Moderator, Driver, Student)
- FR1.2: System shall allow student self-registration
- FR1.3: System shall authenticate users via Firebase Authentication
- FR1.4: System shall route users to role-specific dashboards after login

**FR2: Bus Management**
- FR2.1: Super Admin shall be able to add/edit/delete buses
- FR2.2: System shall store bus data in Firestore
- FR2.3: System shall display real-time bus information
- FR2.4: System shall track bus capacity (currentStudents/capacity)

**FR3: QR Code System**
- FR3.1: System shall generate QR codes for buses containing bus information
- FR3.2: System shall allow download of QR codes as images
- FR3.3: Students shall be able to scan QR codes using device camera
- FR3.4: System shall increment bus capacity when QR code is scanned
- FR3.5: System shall prevent scanning if bus is full

**FR4: Notification System**
- FR4.1: Admins/Moderators/Super Admins shall be able to send notifications
- FR4.2: System shall support push notifications via FCM
- FR4.3: System shall store notifications in Firestore
- FR4.4: Students shall receive notifications in real-time
- FR4.5: System shall display latest notification as popup, all in tab

**FR5: Report System**
- FR5.1: Students shall be able to submit reports about bus issues
- FR5.2: Reports shall be stored in Firestore
- FR5.3: Admins/Moderators/Super Admins shall be able to view reports
- FR5.4: System shall allow marking reports as resolved

**FR6: Real-Time Updates**
- FR6.1: System shall use Firestore real-time subscriptions
- FR6.2: All dashboards shall update automatically when data changes
- FR6.3: Capacity changes shall be visible to all users immediately

### 11.2 Non-Functional Requirements

**NFR1: Performance**
- NFR1.1: Page load time < 3 seconds
- NFR1.2: Real-time updates < 1 second latency
- NFR1.3: QR code scan processing < 500ms

**NFR2: Security**
- NFR2.1: All data transmission over HTTPS
- NFR2.2: Authentication required for all operations
- NFR2.3: Role-based access control

**NFR3: Usability**
- NFR3.1: Mobile-responsive design
- NFR3.2: Intuitive navigation
- NFR3.3: Dark mode support
- NFR3.4: Error messages in user-friendly language

**NFR4: Scalability**
- NFR4.1: Support for 1000+ students
- NFR4.2: Support for 50+ buses
- NFR4.3: Cloud-based architecture for scalability

---

## 12. DEVELOPMENT PLAN (For GANTT Chart)

### Phase 1: Planning & Setup (Week 1)
- Project requirement gathering
- Technology stack selection
- Firebase project setup
- Development environment setup

### Phase 2: Core Development (Week 2-4)
- Week 2:
  - Authentication system
  - User registration
  - Basic dashboards
- Week 3:
  - Firestore integration
  - Bus management (CRUD)
  - Real-time subscriptions
- Week 4:
  - QR code generation
  - QR code scanning
  - Capacity management

### Phase 3: Advanced Features (Week 5-6)
- Week 5:
  - Notification system
  - FCM integration
  - Report system
- Week 6:
  - Real-time updates
  - UI/UX enhancements
  - Error handling

### Phase 4: Testing & Deployment (Week 7-8)
- Week 7:
  - Unit testing
  - Integration testing
  - User acceptance testing
- Week 8:
  - Bug fixes
  - Performance optimization
  - Deployment
  - Documentation

**Total Duration:** 8 weeks  
**Team Size:** 2-3 developers  
**Resources Needed:**
- Frontend Developer (React/TypeScript)
- Backend/Firebase Developer
- UI/UX Designer (optional)

---

## 13. PROGRAM OUTCOMES (PO) ATTAINMENT

### PO1: Engineering Knowledge
- Applied software engineering principles
- Used modern web technologies (React, TypeScript, Firebase)
- Database design and implementation (Firestore)

### PO2: Problem Analysis
- Identified bus management problems
- Analyzed requirements
- Designed solution architecture

### PO3: Design/Development of Solutions
- Designed scalable system architecture
- Implemented role-based access control
- Developed real-time data synchronization

### PO4: Investigation
- Researched QR code technologies
- Investigated Firebase capabilities
- Studied push notification systems

### PO5: Modern Tool Usage
- React, TypeScript, Vite
- Firebase services
- Git version control
- Modern development tools

### PO6: Engineer and Society
- Solves real-world transportation problem
- Benefits university community
- Improves safety and efficiency

### PO7: Environment & Sustainability
- Cloud-based (reduced infrastructure)
- Paperless system
- Digital efficiency

### PO8: Ethics
- Secure authentication
- Privacy protection (student data)
- Role-based access

### PO9: Individual & Team Work
- Component-based architecture
- Modular code structure
- Team collaboration ready

### PO10: Communication
- Clear UI/UX design
- User documentation
- Technical documentation

### PO11: Project Management
- Structured development phases
- Time estimation
- Resource planning

### PO12: Life-long Learning
- Latest technologies
- Best practices
- Continuous improvement

---

## 14. TECHNICAL SPECIFICATIONS FOR REPORT GENERATION

### For DFD (Data Flow Diagram):
**External Entities:**
- Student
- Admin
- Super Admin
- Moderator
- Driver
- Firebase Services

**Processes:**
- Authentication Process
- Bus Management Process
- QR Code Generation Process
- QR Code Scanning Process
- Notification Process
- Report Management Process
- Capacity Management Process

**Data Stores:**
- Firestore Database (buses, students, notifications, reports, moderators, drivers)
- Firebase Authentication
- FCM Tokens

**Data Flows:**
- User credentials → Authentication → User data
- Bus data → CRUD operations → Firestore
- QR scan → Capacity increment → Firestore update
- Notification message → FCM → User devices
- Report data → Save → Firestore

### For Activity Diagram:
**Main Activities:**
1. User Registration/Login
2. Bus Management (Add/Edit/Delete)
3. QR Code Generation
4. QR Code Scanning
5. Capacity Update
6. Notification Sending
7. Report Submission
8. Report Resolution

### For Software Development Plan:
- **Timeline:** 8 weeks (detailed above)
- **Resources:** 2-3 developers, 1 project manager
- **Budget Estimate:**
  - Development: Based on hourly rate × hours
  - Infrastructure: Firebase costs ($20-200/month)
  - Tools: Free (React, Firebase free tier)
- **Risk Management:**
  - Firebase quota limits
  - Camera access permissions
  - Network connectivity
  - Data migration

---

## 15. USER MANUAL SECTIONS NEEDED

1. **Getting Started**
   - System requirements
   - Accessing the application
   - First-time setup

2. **Student Guide**
   - Registration process
   - Logging in
   - Scanning QR codes
   - Viewing bus information
   - Submitting reports
   - Viewing notifications

3. **Admin Guide**
   - Logging in
   - Managing buses
   - Sending notifications
   - Managing reports
   - Viewing capacity

4. **Super Admin Guide**
   - All admin features
   - Bus CRUD operations
   - QR code generation and download
   - Moderator/Driver management

5. **Troubleshooting**
   - Common issues
   - FAQ
   - Support contact

---

## 16. CODE QUALITY METRICS

- **TypeScript Coverage:** 100% (all components typed)
- **Component Structure:** Modular, reusable components
- **Error Handling:** Comprehensive try-catch blocks
- **Code Organization:** Clear separation of concerns
- **Documentation:** Inline comments for complex logic
- **Best Practices:** 
  - Functional components with hooks
  - Proper state management
  - Efficient re-renders
  - Real-time data subscriptions

---

## 17. FUTURE ENHANCEMENTS (For Report)

- GPS tracking integration
- Route optimization
- Analytics dashboard
- SMS notifications
- Email notifications
- Bus scheduling system
- Driver performance tracking
- Student attendance tracking
- Mobile app (native)
- Offline mode support

---

## 18. PROJECT STATISTICS

- **Total Components:** 20+ React components
- **Lines of Code:** ~15,000+ (estimated)
- **Firebase Collections:** 7 collections
- **User Roles:** 5 roles
- **Features:** 15+ major features
- **UI Components:** 30+ reusable components
- **Third-party Libraries:** 50+ npm packages
- **Development Time:** ~8 weeks
- **Team Size:** 2-3 developers

---

## END OF PROMPT

Use this comprehensive prompt to generate your Software Development Project Report with all required sections.

