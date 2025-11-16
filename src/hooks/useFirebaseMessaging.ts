import { useEffect, useState } from 'react';
import { 
  initializeFirebaseMessaging, 
  getStoredToken,
  requestNotificationPermission 
} from '../utils/firebaseMessaging';
import { toast } from 'sonner';

export function useFirebaseMessaging() {
  const [token, setToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      
      // Initialize Firebase Messaging
      initializeFirebaseMessaging()
        .then(() => {
          const storedToken = getStoredToken();
          if (storedToken) {
            setToken(storedToken);
          }
        })
        .catch((error) => {
          console.error('Error initializing Firebase Messaging:', error);
        });
    } else {
      setIsSupported(false);
      console.warn('This browser does not support notifications');
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('Notifications are not supported in this browser');
      return null;
    }

    try {
      const newToken = await requestNotificationPermission();
      if (newToken) {
        setToken(newToken);
        toast.success('Notification permission granted!');
        return newToken;
      } else {
        toast.error('Failed to get notification token');
        return null;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast.error('Failed to request notification permission');
      return null;
    }
  };

  return {
    token,
    isSupported,
    requestPermission,
  };
}

