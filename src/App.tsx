import { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { Login } from './components/Login';
import { ForgotPassword } from './components/ForgotPassword';
import { StudentRegistration } from './components/StudentRegistration';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { DriverDashboard } from './components/DriverDashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { ModeratorDashboard } from './components/ModeratorDashboard';
import { FirebaseSetupPage } from './components/FirebaseSetupPage';
import { getCurrentUser } from './utils/auth';
import { Toaster } from './components/ui/sonner';
import { useFirebaseMessaging } from './hooks/useFirebaseMessaging';
import { onMessageListener } from './utils/firebaseMessaging';

type Screen = 
  | 'splash' 
  | 'login' 
  | 'forgot-password' 
  | 'register' 
  | 'super-admin-dashboard'
  | 'moderator-dashboard'
  | 'admin-dashboard' 
  | 'student-dashboard' 
  | 'driver-dashboard'
  | 'firebase-setup';

export default function App() {
  // Check URL parameter for setup page (e.g., ?setup=true)
  const urlParams = new URLSearchParams(window.location.search);
  const showSetup = urlParams.get('setup') === 'true';
  
  const [currentScreen, setCurrentScreen] = useState<Screen>(
    showSetup ? 'firebase-setup' : 'splash'
  );
  const { token, isSupported, requestPermission } = useFirebaseMessaging();

  useEffect(() => {
    // Check if user is already logged in
    const user = getCurrentUser();
    if (user) {
      if (user.role === 'super_admin') {
        setCurrentScreen('super-admin-dashboard');
      } else if (user.role === 'moderator') {
        setCurrentScreen('moderator-dashboard');
      } else if (user.role === 'admin') {
        setCurrentScreen('admin-dashboard');
      } else if (user.role === 'student') {
        setCurrentScreen('student-dashboard');
      } else if (user.role === 'driver') {
        setCurrentScreen('driver-dashboard');
      }
    } else {
      // If no user, show splash then login
      // Splash screen will handle transition to login
    }
  }, []);

  // Set up Firebase message listener
  useEffect(() => {
    if (isSupported) {
      onMessageListener()
        .then((payload) => {
          console.log('Foreground message received:', payload);
        })
        .catch((error) => {
          console.error('Error in message listener:', error);
        });
    }
  }, [isSupported]);

  const handleSplashComplete = () => {
    const user = getCurrentUser();
    if (!user) {
      setCurrentScreen('login');
    }
  };

  const handleLogin = () => {
    const user = getCurrentUser();
    if (user?.role === 'super_admin') {
      setCurrentScreen('super-admin-dashboard');
    } else if (user?.role === 'moderator') {
      setCurrentScreen('moderator-dashboard');
    } else if (user?.role === 'admin') {
      setCurrentScreen('admin-dashboard');
    } else if (user?.role === 'student') {
      setCurrentScreen('student-dashboard');
    } else if (user?.role === 'driver') {
      setCurrentScreen('driver-dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentScreen('login');
  };

  const handleRegister = () => {
    setCurrentScreen('student-dashboard');
  };

  return (
    <>
      {currentScreen === 'splash' && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      
      {currentScreen === 'login' && (
        <Login
          onLogin={handleLogin}
          onForgotPassword={() => setCurrentScreen('forgot-password')}
          onRegister={() => setCurrentScreen('register')}
        />
      )}
      
      {currentScreen === 'forgot-password' && (
        <ForgotPassword onBack={() => setCurrentScreen('login')} />
      )}
      
      {currentScreen === 'register' && (
        <StudentRegistration
          onBack={() => setCurrentScreen('login')}
          onRegister={handleRegister}
        />
      )}
      
      {currentScreen === 'super-admin-dashboard' && (
        <SuperAdminDashboard onLogout={handleLogout} />
      )}
      
      {currentScreen === 'moderator-dashboard' && (
        <ModeratorDashboard onLogout={handleLogout} />
      )}
      
      {currentScreen === 'admin-dashboard' && (
        <AdminDashboard onLogout={handleLogout} />
      )}
      
      {currentScreen === 'student-dashboard' && (
        <StudentDashboard onLogout={handleLogout} />
      )}
      
      {currentScreen === 'driver-dashboard' && (
        <DriverDashboard onLogout={handleLogout} />
      )}

      {currentScreen === 'firebase-setup' && (
        <FirebaseSetupPage />
      )}

      <Toaster position="top-right" />
    </>
  );
}
