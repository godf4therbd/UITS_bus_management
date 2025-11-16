import { useState, useEffect, useMemo } from 'react';
import { Student, Bus, Notification, Report } from '../types';
import { getCurrentUser, logout, updateStudent } from '../utils/auth';
import { mockBuses } from '../data/mockData';
import {
  getNotifications,
  subscribeToNotifications,
  saveReport,
  incrementBusCapacity,
  getBus,
  subscribeToBuses,
} from '../utils/firestoreService';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { LogOut, Bus as BusIcon, Users, MapPin, QrCode, ScanLine, Bell, AlertTriangle } from 'lucide-react';
import { Badge } from './ui/badge';
import { NotificationPopup } from './NotificationPopup';
import { QRScanner } from './QRScanner';
import { ReportIssue } from './ReportIssue';
import uitsLogo from '../assets/uits-logo.png';
import { ThemeToggle } from './ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface StudentDashboardProps {
  onLogout: () => void;
}

export function StudentDashboard({ onLogout }: StudentDashboardProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [buses] = useState<Bus[]>(mockBuses);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<Set<string>>(new Set());
  const [shownNotificationIds, setShownNotificationIds] = useState<Set<string>>(new Set());
  const [showScanner, setShowScanner] = useState(false);
  const [scannedBus, setScannedBus] = useState<Bus | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.role === 'student') {
      setStudent(user as Student);
      // Check if bus was already scanned
      if (user.busNumber) {
        const bus = buses.find(b => b.number === user.busNumber);
        if (bus) {
          setScannedBus(bus);
        }
      }
    }
  }, [buses]);

  // Subscribe to notifications from Firestore
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const notifs = await getNotifications();
        setNotifications(notifs);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();
    const unsubscribe = subscribeToNotifications((updatedNotifications) => {
      setNotifications(updatedNotifications);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to buses for real-time capacity updates
  useEffect(() => {
    const unsubscribe = subscribeToBuses((updatedBuses) => {
      // Update scannedBus if it exists in the updated buses
      if (scannedBus) {
        const updatedBus = updatedBuses.find(b => b.number === scannedBus.number);
        if (updatedBus) {
          setScannedBus(updatedBus);
        }
      }
    });
    return () => unsubscribe();
  }, [scannedBus]);

  // Load dismissed and shown notification IDs from localStorage on mount
  useEffect(() => {
    const storedDismissed = localStorage.getItem('dismissed_notifications');
    if (storedDismissed) {
      try {
        const dismissedIds = JSON.parse(storedDismissed);
        setDismissedNotificationIds(new Set(dismissedIds));
        // Also mark dismissed as shown
        setShownNotificationIds(new Set(dismissedIds));
      } catch (error) {
        console.error('Error loading dismissed notifications:', error);
      }
    }
    
    const storedShown = localStorage.getItem('shown_notifications');
    if (storedShown) {
      try {
        const shownIds = JSON.parse(storedShown);
        setShownNotificationIds(new Set(shownIds));
      } catch (error) {
        console.error('Error loading shown notifications:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    onLogout();
  };

  const handleDismissNotification = (id: string) => {
    // Mark notification as dismissed (don't remove from list, just hide from popup)
    const newDismissed = new Set(dismissedNotificationIds);
    newDismissed.add(id);
    setDismissedNotificationIds(newDismissed);
    
    // Also mark as shown
    const newShown = new Set(shownNotificationIds);
    newShown.add(id);
    setShownNotificationIds(newShown);
    
    // Save to localStorage
    localStorage.setItem('dismissed_notifications', JSON.stringify(Array.from(newDismissed)));
    localStorage.setItem('shown_notifications', JSON.stringify(Array.from(newShown)));
  };

  // Mark notification as shown when it appears in popup
  const handleNotificationShown = (id: string) => {
    if (!shownNotificationIds.has(id)) {
      const newShown = new Set(shownNotificationIds);
      newShown.add(id);
      setShownNotificationIds(newShown);
      localStorage.setItem('shown_notifications', JSON.stringify(Array.from(newShown)));
    }
  };

  // Get notifications for popup (only show unshown, latest one)
  const popupNotifications = useMemo(() => {
    // Filter out dismissed and already shown notifications
    const unshown = notifications.filter(n => 
      !dismissedNotificationIds.has(n.id) && !shownNotificationIds.has(n.id)
    );
    
    if (unshown.length === 0) return [];
    
    // Return only the latest notification
    const sorted = unshown.sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
      const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
      return timeB - timeA; // Sort descending (newest first)
    });
    
    return [sorted[0]]; // Return only the latest
  }, [notifications, dismissedNotificationIds, shownNotificationIds]);

  // Mark notification as shown when it appears in popup (only once)
  useEffect(() => {
    if (popupNotifications.length > 0) {
      const notificationId = popupNotifications[0].id;
      if (!shownNotificationIds.has(notificationId) && !dismissedNotificationIds.has(notificationId)) {
        // Mark as shown immediately to prevent duplicate popups
        const newShown = new Set(shownNotificationIds);
        newShown.add(notificationId);
        setShownNotificationIds(newShown);
        localStorage.setItem('shown_notifications', JSON.stringify(Array.from(newShown)));
      }
    }
  }, [popupNotifications.length > 0 ? popupNotifications[0]?.id : null, shownNotificationIds, dismissedNotificationIds]);

  const parseQRCodeData = (qrText: string) => {
    // Try to parse as JSON first
    try {
      const jsonData = JSON.parse(qrText);
      if (jsonData.busNumber || jsonData['Bus ID']) {
        return jsonData;
      }
    } catch (e) {
      // Not JSON, continue with text parsing
    }

    // Parse text format like:
    // Bus ID: UITS_BUS_04
    // 
    // Status: ON-TIME
    // 
    // Driver: Shafiq Islam
    // etc.
    // Handle blank lines between fields
    const lines = qrText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const data: any = {};

    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      
      // Bus ID (case-insensitive)
      if (lowerLine.includes('bus id:')) {
        const match = line.match(/bus id:\s*(.+)/i);
        if (match) data.busId = match[1].trim();
      } 
      // Status (case-insensitive)
      else if (lowerLine.includes('status:')) {
        const match = line.match(/status:\s*(.+)/i);
        if (match) {
          const statusText = match[1].trim().toUpperCase();
          // Convert ON-TIME, DELAYED, FULL to lowercase with hyphen
          if (statusText === 'ON-TIME' || statusText === 'ON TIME') {
            data.status = 'on-time';
          } else if (statusText === 'DELAYED') {
            data.status = 'delayed';
          } else if (statusText === 'FULL') {
            data.status = 'full';
          } else {
            data.status = statusText.toLowerCase().replace('_', '-');
          }
        }
      } 
      // Driver (case-insensitive)
      else if (lowerLine.includes('driver:')) {
        const match = line.match(/driver:\s*(.+)/i);
        if (match) data.driverName = match[1].trim();
      } 
      // Phone (case-insensitive)
      else if (lowerLine.includes('phone:')) {
        const match = line.match(/phone:\s*(.+)/i);
        if (match) data.driverPhone = match[1].trim();
      } 
      // Capacity (case-insensitive)
      else if (lowerLine.includes('capacity:')) {
        const match = line.match(/capacity:\s*(.+)/i);
        if (match) {
          const capacityText = match[1].trim();
          const numMatch = capacityText.match(/(\d+)\s*\/\s*(\d+)/);
          if (numMatch) {
            data.currentStudents = parseInt(numMatch[1]);
            data.capacity = parseInt(numMatch[2]);
          }
        }
      } 
      // Route (case-insensitive)
      else if (lowerLine.includes('route:')) {
        const match = line.match(/route:\s*(.+)/i);
        if (match) data.route = match[1].trim();
      } 
      // Admin (case-insensitive)
      else if (lowerLine.includes('admin:')) {
        const match = line.match(/admin:\s*(.+)/i);
        if (match) data.adminName = match[1].trim();
      }
    });

    return data;
  };

  const handleScanSuccess = async (decodedText: string) => {
    try {
      // Try to parse as JSON first (new format from Super Admin)
      let qrData: any = {};
      try {
        qrData = JSON.parse(decodedText);
      } catch (e) {
        // If not JSON, use the old text parsing format
        qrData = parseQRCodeData(decodedText);
      }
      
      // Extract Bus ID and find matching bus
      let busNumber: string | undefined;
      
      if (qrData.busNumber) {
        // If busNumber is directly provided (from JSON)
        busNumber = qrData.busNumber;
      } else if (qrData.busId) {
        // Extract number from Bus ID (e.g., UITS_BUS_04 -> Bus 4)
        const busNumberMatch = qrData.busId.match(/(\d+)$/);
        if (busNumberMatch) {
          const busNum = parseInt(busNumberMatch[1]);
          const foundBus = buses.find(b => {
            const busNumMatch = b.number.match(/(\d+)$/);
            return busNumMatch && parseInt(busNumMatch[1]) === busNum;
          });
          if (foundBus) {
            busNumber = foundBus.number;
          }
        }
      }

      if (!busNumber) {
        toast.error('Bus not found. Please scan a valid bus QR code.');
        return;
      }

      // Increment bus capacity in Firebase
      const result = await incrementBusCapacity(busNumber);
      
      if (!result.success) {
        if (result.isFull) {
          toast.error(`Bus ${busNumber} is already full (${result.currentStudents}/${result.capacity}). Cannot join.`);
        } else {
          toast.error('Failed to update bus capacity. Please try again.');
        }
        return;
      }

      // Get updated bus data from Firebase
      const updatedBusData = await getBus(busNumber);
      
      if (!updatedBusData) {
        toast.error('Failed to fetch bus information. Please try again.');
        return;
      }

      // Use QR code data to fill in missing information
      const updatedBus: Bus = {
        ...updatedBusData,
        driverName: qrData.driverName || updatedBusData.driverName,
        driverPhone: qrData.driverPhone || updatedBusData.driverPhone,
        route: qrData.route || updatedBusData.route,
        adminName: qrData.adminName || updatedBusData.adminName,
        currentStudents: result.currentStudents,
        status: result.isFull ? 'full' : updatedBusData.status,
      };

      setScannedBus(updatedBus);
      
      if (student) {
        const updatedStudent = { ...student, busNumber: updatedBus.number };
        setStudent(updatedStudent);
        updateStudent(updatedStudent);
      }
      
      const availableSeats = result.capacity - result.currentStudents;
      toast.success(
        `QR Code scanned! Connected to ${updatedBus.number}. ${availableSeats} seat${availableSeats !== 1 ? 's' : ''} available.`
      );
    } catch (error) {
      console.error('Error parsing QR code:', error);
      toast.error('Failed to parse QR code. Please try again.');
    }
  };

  const handleReportSubmit = async (reportData: Omit<Report, 'id' | 'timestamp' | 'status'>) => {
    try {
      // Validate required fields
      if (!reportData.studentId) {
        toast.error('Student ID is required');
        return;
      }
      if (!reportData.busNumber) {
        toast.error('Bus number is required. Please scan QR code first.');
        return;
      }
      if (!reportData.type) {
        toast.error('Report type is required');
        return;
      }

      const newReport: Report = {
        ...reportData,
        id: `report_${Date.now()}`,
        timestamp: new Date(),
        status: 'pending',
      };

      console.log('Submitting report:', newReport);

      // Store reports in Firestore
      const { saveReport: saveReportToFirestore } = await import('../utils/firestoreService');
      const success = await saveReportToFirestore(newReport);
      
      if (success) {
        toast.success('Report submitted successfully!');
      } else {
        toast.error('Failed to submit report. Please check console for details and try again.');
      }
    } catch (error: any) {
      console.error('Error in handleReportSubmit:', error);
      toast.error(`Failed to submit report: ${error.message || 'Unknown error'}`);
    }
  };

  // Count unread notifications (not dismissed)
  const unreadNotifications = notifications.filter(n => !dismissedNotificationIds.has(n.id)).length;

  if (!student) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Notifications Popup - Only shows latest notification */}
      <NotificationPopup notifications={popupNotifications} onDismiss={handleDismissNotification} />

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-black/10 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={uitsLogo} alt="UITS Logo" className="w-12 h-12 object-contain" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">UITS Bus Management</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Student Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <span className="text-sm">{student.name}</span>
                    {student.studentId && (
                      <span className="text-xs text-gray-500">({student.studentId})</span>
                    )}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs and Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 border-b border-black/10 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 relative">
                <Bell className="w-4 h-4" />
                Notifications
                {unreadNotifications > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {unreadNotifications}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="report" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Report
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* QR Scan Card - Always visible */}
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <QrCode className="w-10 h-10 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Scan QR Code</CardTitle>
                <CardDescription className="text-base mt-2">
                  Scan the QR code on your bus to view real-time information, schedules, and track your bus location. Works best with Google Chrome browser on mobile devices.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => setShowScanner(true)}
                  className="w-full !bg-red-600 hover:!bg-red-700 !text-white h-14 text-lg font-semibold gap-3 shadow-lg border-0"
                  size="lg"
                  style={{ backgroundColor: '#dc2626', color: 'white' }}
                >
                  <ScanLine className="w-6 h-6" style={{ color: 'white' }} />
                  Scan Now
                </Button>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Click the button above to scan your bus QR code. The rear camera will open automatically.
                </p>
              </CardContent>
            </Card>

            {/* Bus Information - Show if scanned */}
            {scannedBus && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bus Information Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {scannedBus.number} Details
                      <Badge 
                        variant={scannedBus.status === 'full' ? 'destructive' : scannedBus.status === 'delayed' ? 'default' : 'secondary'}
                        className={scannedBus.status === 'on-time' ? 'bg-green-500 hover:bg-green-600' : ''}
                      >
                        {scannedBus.status.toUpperCase()}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Driver</p>
                        <p className="text-gray-900 font-medium">{scannedBus.driverName}</p>
                        <p className="text-sm text-gray-500">{scannedBus.driverPhone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Capacity</p>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#FF6B6B]" />
                          <p className="text-gray-900 font-medium">
                            {scannedBus.currentStudents} / {scannedBus.capacity} students
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {scannedBus.capacity - scannedBus.currentStudents} seat{scannedBus.capacity - scannedBus.currentStudents !== 1 ? 's' : ''} available
                        </p>
                        {scannedBus.status === 'full' && (
                          <p className="text-sm text-[#FF6B6B] mt-1 font-medium">⚠️ Bus is full!</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Route</p>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[#FF6B6B] flex-shrink-0 mt-1" />
                        <p className="text-gray-900">{scannedBus.route}</p>
                      </div>
                    </div>
                    {scannedBus.delayMinutes && (
                      <div className="bg-[#FFF5F5] border border-[#FFE8E8] rounded-lg p-3">
                        <p className="text-sm text-[#FF6B6B]">
                          ⚠️ Bus is delayed by {scannedBus.delayMinutes} minutes
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Admin</p>
                      <p className="text-gray-900">{scannedBus.adminName}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Student Information Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Your Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Student ID</p>
                      <p className="text-gray-900 font-medium">{student.studentId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Batch</p>
                      <p className="text-gray-900 font-medium">{student.batch}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="text-gray-900 font-medium">{student.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Blood Group</p>
                      <p className="text-gray-900 font-medium">{student.bloodGroup}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Emergency Contact</p>
                      <p className="text-gray-900 font-medium">{student.emergencyContact}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  {notifications.length === 0 
                    ? 'No notifications yet' 
                    : `${unreadNotifications} unread of ${notifications.length} total notification${notifications.length > 1 ? 's' : ''}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No notifications to display</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {notifications
                      .sort((a, b) => {
                        // Sort by timestamp (newest first)
                        const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
                        const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
                        return timeB - timeA;
                      })
                      .map((notification) => {
                        const isDismissed = dismissedNotificationIds.has(notification.id);
                        return (
                          <div
                            key={notification.id}
                            className={`p-4 border rounded-lg hover:bg-gray-50 ${
                              isDismissed 
                                ? 'border-gray-200 bg-gray-50 opacity-75' 
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline">{notification.busNumber}</Badge>
                                  {!isDismissed && (
                                    <Badge variant="default" className="bg-blue-500 text-white text-xs">
                                      New
                                    </Badge>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {notification.timestamp instanceof Date 
                                      ? notification.timestamp.toLocaleString()
                                      : new Date(notification.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <p className={`${isDismissed ? 'text-gray-600' : 'text-gray-900'}`}>
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  From: {notification.adminName}
                                </p>
                              </div>
                              {!isDismissed && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDismissNotification(notification.id)}
                                  className="ml-2"
                                  title="Mark as read"
                                >
                                  ×
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Report Tab */}
          <TabsContent value="report" className="space-y-4 mt-6">
            <ReportIssue
              studentId={student.studentId}
              busNumber={scannedBus?.number}
              onSubmit={handleReportSubmit}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* QR Scanner Dialog */}
      <QRScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}
