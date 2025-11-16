# UITS Bus Management System - Complete Project Structure

## Project Directory Tree

```
uits-bus-management/
│
├── 📁 public/                          # Static assets
│   └── firebase-messaging-sw.js       # Service Worker for FCM
│
├── 📁 src/                             # Source code
│   │
│   ├── 📁 assets/                      # Image assets
│   │   └── uits-logo.png              # University logo
│   │
│   ├── 📁 components/                  # React components
│   │   │
│   │   ├── 📁 ui/                      # Reusable UI components (shadcn/ui)
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── ... (30+ components)
│   │   │
│   │   ├── AdminDashboard.tsx         # Admin role dashboard
│   │   ├── DriverDashboard.tsx        # Driver role dashboard
│   │   ├── Login.tsx                  # Login page
│   │   ├── ModeratorDashboard.tsx     # Moderator role dashboard
│   │   ├── NotificationPopup.tsx      # Notification popup component
│   │   ├── QRScanner.tsx              # QR code scanner component
│   │   ├── ReportIssue.tsx            # Report submission form
│   │   ├── SplashScreen.tsx           # App splash screen
│   │   ├── StudentDashboard.tsx       # Student role dashboard
│   │   ├── StudentRegistration.tsx    # Student registration form
│   │   ├── SuperAdminDashboard.tsx    # Super Admin dashboard
│   │   ├── ThemeToggle.tsx            # Dark/Light mode toggle
│   │   └── ThemeProvider.tsx          # Theme context provider
│   │
│   ├── 📁 config/                      # Configuration files
│   │   └── firebase.ts                # Firebase SDK initialization
│   │
│   ├── 📁 data/                        # Mock data
│   │   └── mockData.ts                # Initial mock data for buses, users
│   │
│   ├── 📁 hooks/                       # Custom React hooks
│   │   └── useFirebaseMessaging.ts    # FCM hook
│   │
│   ├── 📁 types/                       # TypeScript type definitions
│   │   └── index.ts                   # All interfaces and types
│   │
│   ├── 📁 utils/                       # Utility functions
│   │   ├── auth.ts                    # Authentication utilities
│   │   ├── firebaseAuth.ts            # Firebase Auth wrapper
│   │   ├── firestoreService.ts        # All Firestore operations (MAIN)
│   │   ├── firebaseMessaging.ts       # FCM setup and listeners
│   │   ├── sendFirebaseNotification.ts # Notification sending
│   │   └── firebaseAdminSetup.ts      # Firebase Admin SDK setup
│   │
│   ├── App.tsx                         # Main app component (routing)
│   ├── main.tsx                        # Application entry point
│   └── index.css                       # Global styles
│
├── 📁 functions/                       # Firebase Cloud Functions (optional)
│   ├── index.js
│   └── package.json
│
├── 📄 firebase.json                    # Firebase project configuration
├── 📄 firestore.rules                  # Firestore security rules
├── 📄 firestore.indexes.json           # Firestore query indexes
├── 📄 .firebaserc                      # Firebase project ID
├── 📄 package.json                     # Node.js dependencies
├── 📄 tsconfig.json                    # TypeScript configuration
├── 📄 vite.config.ts                   # Vite build configuration
├── 📄 index.html                       # HTML entry point
│
└── 📄 Documentation Files:
    ├── README.md
    ├── FIREBASE_SETUP.md
    ├── BACKEND_SETUP.md
    └── ... (15+ markdown files)
```

---

## File Organization by Functionality

### Authentication & User Management
- `src/utils/auth.ts` - Login, logout, user session
- `src/utils/firebaseAuth.ts` - Firebase Authentication wrapper
- `src/components/Login.tsx` - Login interface
- `src/components/StudentRegistration.tsx` - Registration form
- `src/components/ForgotPassword.tsx` - Password recovery

### Dashboard Components
- `src/components/SuperAdminDashboard.tsx` - Super Admin features
- `src/components/AdminDashboard.tsx` - Admin features
- `src/components/ModeratorDashboard.tsx` - Moderator features
- `src/components/StudentDashboard.tsx` - Student features
- `src/components/DriverDashboard.tsx` - Driver features

### QR Code System
- `src/components/QRScanner.tsx` - QR code scanning
- `src/components/SuperAdminDashboard.tsx` - QR generation logic
- Uses: `html5-qrcode`, `qrcode.react` libraries

### Data Management (Core)
- `src/utils/firestoreService.ts` - **Main service file**
  - Bus operations (CRUD)
  - User operations
  - Notification operations
  - Report operations
  - Real-time subscriptions

### Notifications
- `src/utils/firebaseMessaging.ts` - FCM setup
- `src/utils/sendFirebaseNotification.ts` - Notification sender
- `src/hooks/useFirebaseMessaging.ts` - FCM React hook
- `src/components/NotificationPopup.tsx` - Notification UI

### Reporting System
- `src/components/ReportIssue.tsx` - Report submission form
- `src/utils/firestoreService.ts` - Report save/get functions

---

## Component Dependency Graph

```
App.tsx
├── SplashScreen
├── Login
│   ├── StudentRegistration
│   └── ForgotPassword
├── SuperAdminDashboard
│   ├── UI Components (Button, Card, Table, Dialog, etc.)
│   └── firestoreService
├── AdminDashboard
│   ├── UI Components
│   └── firestoreService
├── ModeratorDashboard
│   ├── UI Components
│   └── firestoreService
├── StudentDashboard
│   ├── QRScanner
│   ├── NotificationPopup
│   ├── ReportIssue
│   └── firestoreService
└── DriverDashboard
    ├── UI Components
    └── firestoreService
```

---

## Data Flow Architecture

### Read Operations Flow:
```
Component → firestoreService → Firebase Firestore → onSnapshot → Component State Update
```

### Write Operations Flow:
```
User Action → Component → firestoreService → Firebase Firestore → Success/Error → UI Feedback
```

### Real-Time Updates Flow:
```
Firestore Change → onSnapshot Listener → firestoreService → Component State → UI Re-render
```

---

## Key Service Functions (firestoreService.ts)

### Bus Operations:
- `getBuses()` - Fetch all buses
- `getBus(busNumber)` - Fetch single bus
- `saveBus(bus)` - Save/update bus
- `saveBuses(buses)` - Batch save
- `deleteBus(busNumber)` - Delete bus
- `incrementBusCapacity(busNumber)` - Atomically increment capacity
- `decrementBusCapacity(busNumber)` - Decrement capacity
- `subscribeToBuses(callback)` - Real-time bus updates

### User Operations:
- `getStudents()` - Fetch all students
- `saveStudent(student)` - Save student
- `updateStudent(student)` - Update student
- Similar for moderators, drivers

### Notification Operations:
- `getNotifications(busNumber?)` - Fetch notifications
- `saveNotification(notification)` - Save notification
- `subscribeToNotifications(callback, busNumber?)` - Real-time notifications

### Report Operations:
- `getReports(studentId?)` - Fetch reports
- `saveReport(report)` - Save report
- `subscribeToReports(callback, busNumber?)` - Real-time reports

---

## Configuration Files

### Firebase Configuration (`src/config/firebase.ts`):
- Firebase SDK initialization
- Firestore database instance
- Firebase Auth instance
- FCM messaging instance

### Firestore Rules (`firestore.rules`):
- Security rules for all collections
- Role-based access control
- Development vs production rules

### Firestore Indexes (`firestore.indexes.json`):
- Composite indexes for queries
- Notifications: busNumber + timestamp
- Reports: studentId + timestamp

### Vite Config (`vite.config.ts`):
- React plugin configuration
- Path aliases
- Build settings
- Server configuration

---

## Technology Stack Summary

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | React | 18.3.1 |
| **Language** | TypeScript | Latest |
| **Build Tool** | Vite | 6.3.5 |
| **UI Library** | Radix UI | Various |
| **Styling** | Tailwind CSS | Latest |
| **Backend** | Firebase | 12.6.0 |
| **Database** | Firestore | Cloud |
| **Auth** | Firebase Auth | Cloud |
| **Notifications** | FCM | Cloud |
| **QR Scanner** | html5-qrcode | 2.3.8 |
| **QR Generator** | qrcode.react | Latest |

---

## External Dependencies Count

- **Total Dependencies:** 54 packages
- **Core Dependencies:** 40 packages
- **Dev Dependencies:** 3 packages
- **UI Components:** 30+ Radix UI components
- **Firebase Packages:** 3 (firebase, firebase-admin)
- **Utility Libraries:** 11 packages

---

## Lines of Code Estimate

| Component Category | Estimated LOC |
|-------------------|---------------|
| Dashboard Components | ~4,000 |
| UI Components | ~2,000 |
| Service/Utils | ~1,500 |
| Types/Config | ~300 |
| **Total** | **~7,800+ lines** |

---

## Build Output

```
build/
├── index.html
├── assets/
│   ├── index-[hash].js        # Main JavaScript bundle
│   ├── index-[hash].css       # Main CSS bundle
│   └── uits-logo-[hash].png   # Optimized images
```

---

## Environment Variables (if needed)

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## Deployment Configuration

- **Build Command:** `npm run build`
- **Output Directory:** `build/`
- **Static Hosting:** Firebase Hosting, Vercel, Netlify
- **Database:** Firebase Firestore (cloud)
- **CDN:** Automatic via hosting platform

---

## Testing Structure (Recommended)

```
tests/
├── unit/
│   ├── utils/
│   └── components/
├── integration/
│   ├── firebase/
│   └── api/
└── e2e/
    └── user-flows/
```

---

This structure provides a complete overview for generating your project documentation.

