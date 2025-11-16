import { useEffect, useState } from 'react';
import { Notification } from '../types';
import { X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationPopupProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export function NotificationPopup({ notifications, onDismiss }: NotificationPopupProps) {
  // Show only the latest/current notification (most recent one)
  const latestNotification = notifications.length > 0 
    ? notifications.sort((a, b) => {
        const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
        const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
        return timeB - timeA; // Sort descending (newest first)
      })[0]
    : null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <AnimatePresence>
        {latestNotification && (
          <NotificationItem
            key={latestNotification.id}
            notification={latestNotification}
            onDismiss={onDismiss}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({ notification, onDismiss }: { notification: Notification; onDismiss: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  useEffect(() => {
    // Auto dismiss after 8 seconds (reduced from 10)
    const timer = setTimeout(() => {
      if (!hasBeenDismissed) {
        setIsVisible(false);
        setTimeout(() => {
          onDismiss(notification.id);
          setHasBeenDismissed(true);
        }, 300);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [notification.id, onDismiss, hasBeenDismissed]);

  const handleDismiss = () => {
    if (hasBeenDismissed) return; // Prevent multiple dismissals
    
    setHasBeenDismissed(true);
    setIsVisible(false);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 100, scale: isVisible ? 1 : 0.9 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className="bg-[#FF6B6B] text-white rounded-lg shadow-2xl p-4 flex gap-3 items-start min-w-[320px]"
    >
      <div className="bg-white/20 rounded-full p-2 flex-shrink-0">
        <Bell className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm opacity-90">
            Admin - {notification.busNumber}
          </p>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 hover:bg-white/20 rounded-full p-1 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="break-words">{notification.message}</p>
        <p className="text-xs opacity-75 mt-2">
          {new Date(notification.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </motion.div>
  );
}
