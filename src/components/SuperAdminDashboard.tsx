import { useState, useEffect } from 'react';
import { SuperAdmin, Bus, Moderator, Driver, Notification, Report } from '../types';
import { getCurrentUser, logout } from '../utils/auth';
import { mockBuses, mockModerators, mockDrivers } from '../data/mockData';
import {
  getBuses,
  saveBus,
  saveBuses,
  deleteBus,
  subscribeToBuses,
  getModerators,
  saveModerator,
  saveModerators,
  deleteModerator,
  getDrivers,
  saveDriver,
  saveDrivers,
  deleteDriver,
  getNotifications,
  saveNotification,
  subscribeToNotifications,
  subscribeToReports,
} from '../utils/firestoreService';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { LogOut, Bus as BusIcon, Users, Plus, Trash2, Edit, Save, X, UserPlus, UserMinus, Send, Bell, AlertTriangle, CheckCircle, QrCode, Download } from 'lucide-react';
import { Badge } from './ui/badge';
import { ThemeToggle } from './ThemeToggle';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { PREBUILT_MESSAGES } from '../constants/notifications';

interface SuperAdminDashboardProps {
  onLogout: () => void;
}

// Notification List Component
function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    const unsubscribe = subscribeToNotifications((updatedNotifications) => {
      setNotifications(updatedNotifications);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadNotifications = async () => {
    try {
      const notifs = await getNotifications();
      setNotifications(notifs);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading notifications...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No notifications sent yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">{notification.busNumber}</Badge>
                <span className="text-xs text-gray-500">
                  {notification.timestamp instanceof Date 
                    ? notification.timestamp.toLocaleString()
                    : new Date(notification.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-900">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                From: {notification.adminName}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SuperAdminDashboard({ onLogout }: SuperAdminDashboardProps) {
  const [superAdmin, setSuperAdmin] = useState<SuperAdmin | null>(null);
  const [buses, setBuses] = useState<Bus[]>(mockBuses);
  const [moderators, setModerators] = useState<Moderator[]>(mockModerators);
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
  const [activeTab, setActiveTab] = useState('buses');

  // Bus management state
  const [isAddingBus, setIsAddingBus] = useState(false);
  const [editingBus, setEditingBus] = useState<string | null>(null);
  const [newBus, setNewBus] = useState({
    number: '',
    route: '',
    driverName: '',
    driverPhone: '',
    adminName: '',
    capacity: 40,
  });

  const [saving, setSaving] = useState(false);

  // Moderator management state
  const [isAddingModerator, setIsAddingModerator] = useState(false);
  const [newModerator, setNewModerator] = useState({
    name: '',
    email: '',
    username: '',
  });

  // Driver management state
  const [isAddingDriver, setIsAddingDriver] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    busNumber: '',
  });

  // Notification state
  const [selectedBus, setSelectedBus] = useState<string>('');
  const [selectedMessage, setSelectedMessage] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');

  // Reports state
  const [reports, setReports] = useState<Report[]>([]);

  // QR Code state
  const [qrCodeBus, setQrCodeBus] = useState<Bus | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.role === 'super_admin') {
      setSuperAdmin(user as SuperAdmin);
    }
    loadData();
    
    // Subscribe to real-time updates
    const unsubscribeBuses = subscribeToBuses((updatedBuses) => {
      setBuses(updatedBuses);
    });
    
    // Subscribe to reports
    const unsubscribeReports = subscribeToReports((updatedReports) => {
      setReports(updatedReports);
    });
    
    return () => {
      unsubscribeBuses();
      unsubscribeReports();
    };
  }, []);

  const loadData = async () => {
    try {
      // Load buses
      const busesData = await getBuses();
      if (busesData.length > 0) {
        setBuses(busesData);
      } else {
        // Initialize with mock data if Firestore is empty
        await saveBuses(mockBuses);
        setBuses(mockBuses);
      }

      // Load moderators
      const moderatorsData = await getModerators();
      if (moderatorsData.length > 0) {
        setModerators(moderatorsData);
      } else {
        // Initialize with mock data if Firestore is empty
        await saveModerators(mockModerators);
        setModerators(mockModerators);
      }

      // Load drivers
      const driversData = await getDrivers();
      if (driversData.length > 0) {
        setDrivers(driversData);
      } else {
        // Initialize with mock data if Firestore is empty
        await saveDrivers(mockDrivers);
        setDrivers(mockDrivers);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data from Firebase');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    onLogout();
  };

  // Bus Management Functions
  const handleAddBus = async () => {
    if (!newBus.number || !newBus.route || !newBus.driverName) {
      toast.error('Please fill in all required fields');
      return;
    }

    const bus: Bus = {
      ...newBus,
      currentStudents: 0,
      status: 'on-time',
      currentLocation: { lat: 23.8103, lng: 90.4125 },
      stops: [],
    };

    setSaving(true);
    try {
      const success = await saveBus(bus);
      if (success) {
        setBuses([...buses, bus]);
        toast.success(`Bus ${bus.number} added successfully`);
        setNewBus({ number: '', route: '', driverName: '', driverPhone: '', adminName: '', capacity: 40 });
        setIsAddingBus(false);
      } else {
        toast.error('Failed to add bus to Firebase');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBus = async (busNumber: string) => {
    if (!confirm(`Are you sure you want to delete ${busNumber}?`)) return;
    setSaving(true);
    try {
      const success = await deleteBus(busNumber);
      if (success) {
        setBuses(buses.filter(b => b.number !== busNumber));
        toast.success(`${busNumber} deleted successfully`);
      } else {
        toast.error('Failed to delete bus from Firebase');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEditBus = (bus: Bus) => {
    setEditingBus(bus.number);
    setNewBus({
      number: bus.number,
      route: bus.route,
      driverName: bus.driverName,
      driverPhone: bus.driverPhone,
      adminName: bus.adminName,
      capacity: bus.capacity,
    });
  };

  const handleSaveBus = async () => {
    if (!editingBus) return;

    const updatedBus = buses.find(bus => bus.number === editingBus);
    if (!updatedBus) return;

    const bus: Bus = {
      ...updatedBus,
      route: newBus.route,
      driverName: newBus.driverName,
      driverPhone: newBus.driverPhone,
      adminName: newBus.adminName,
      capacity: newBus.capacity,
    };

    setSaving(true);
    try {
      const success = await saveBus(bus);
      if (success) {
        setBuses(buses.map(b => b.number === editingBus ? bus : b));
        toast.success(`${editingBus} updated successfully`);
        setEditingBus(null);
        setNewBus({ number: '', route: '', driverName: '', driverPhone: '', adminName: '', capacity: 40 });
      } else {
        toast.error('Failed to update bus in Firebase');
      }
    } finally {
      setSaving(false);
    }
  };

  // Generate QR code data for a bus
  const generateQRCodeData = (bus: Bus): string => {
    // Format QR code data as JSON for easy parsing
    const qrData = {
      busNumber: bus.number,
      route: bus.route,
      driverName: bus.driverName,
      driverPhone: bus.driverPhone,
      adminName: bus.adminName,
      capacity: bus.capacity,
    };
    return JSON.stringify(qrData);
  };

  // Download QR code as image
  const handleDownloadQRCode = (bus: Bus) => {
    try {
      const qrData = generateQRCodeData(bus);
      const size = 256;
      
      // Create a hidden div with QR code
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      document.body.appendChild(tempDiv);
      
      // Import React dynamically
      import('react').then((ReactModule) => {
        import('react-dom/client').then((ReactDOMModule) => {
          const React = ReactModule.default;
          const ReactDOM = ReactDOMModule.default;
          const root = ReactDOM.createRoot(tempDiv);
          
          root.render(
            React.createElement(QRCodeSVG, {
              value: qrData,
              size: size,
              level: 'H',
              marginSize: 4,
            } as any)
          );

          // Wait for rendering then convert to image
          setTimeout(() => {
            const svgElement = tempDiv.querySelector('svg');
            if (svgElement) {
              const svgData = new XMLSerializer().serializeToString(svgElement);
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              if (!ctx) {
                document.body.removeChild(tempDiv);
                toast.error('Failed to create canvas');
                return;
              }
              
              canvas.width = size;
              canvas.height = size;
              
              const img = new Image();
              
              img.onload = () => {
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                  if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `QR_${bus.number.replace(/\s+/g, '_')}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    toast.success('QR code downloaded successfully');
                  }
                  if (document.body.contains(tempDiv)) {
                    document.body.removeChild(tempDiv);
                  }
                }, 'image/png');
              };
              
              img.onerror = () => {
                if (document.body.contains(tempDiv)) {
                  document.body.removeChild(tempDiv);
                }
                toast.error('Failed to generate QR code image');
              };
              
              img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
            } else {
              if (document.body.contains(tempDiv)) {
                document.body.removeChild(tempDiv);
              }
              toast.error('Failed to generate QR code');
            }
          }, 300);
        });
      }).catch((error) => {
        console.error('Error downloading QR code:', error);
        toast.error('Failed to download QR code');
        if (document.body.contains(tempDiv)) {
          document.body.removeChild(tempDiv);
        }
      });
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
    }
  };

  // Moderator Management Functions
  const handleAddModerator = async () => {
    if (!newModerator.name || !newModerator.email || !newModerator.username) {
      toast.error('Please fill in all fields');
      return;
    }

    const moderator: Moderator = {
      id: `moderator_${Date.now()}`,
      username: newModerator.username,
      email: newModerator.email,
      password: 'password123',
      role: 'moderator',
      name: newModerator.name,
      assignedBuses: [],
    };

    const success = await saveModerator(moderator);
    if (success) {
      setModerators([...moderators, moderator]);
      toast.success(`Moderator ${moderator.name} added successfully`);
      setNewModerator({ name: '', email: '', username: '' });
      setIsAddingModerator(false);
    } else {
      toast.error('Failed to add moderator to Firebase');
    }
  };

  const handleDeleteModerator = async (moderatorId: string) => {
    const moderator = moderators.find(m => m.id === moderatorId);
    if (confirm(`Are you sure you want to remove ${moderator?.name}?`)) {
      const success = await deleteModerator(moderatorId);
      if (success) {
        setModerators(moderators.filter(m => m.id !== moderatorId));
        toast.success('Moderator removed successfully');
      } else {
        toast.error('Failed to delete moderator from Firebase');
      }
    }
  };

  // Driver Management Functions
  const handleAddDriver = async () => {
    if (!newDriver.name || !newDriver.email || !newDriver.username || !newDriver.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    const driver: Driver = {
      id: `driver_${Date.now()}`,
      username: newDriver.username,
      email: newDriver.email,
      password: 'password123',
      role: 'driver',
      name: newDriver.name,
      phone: newDriver.phone,
      busNumber: newDriver.busNumber || undefined,
    };

    const success = await saveDriver(driver);
    if (success) {
      setDrivers([...drivers, driver]);
      toast.success(`Driver ${driver.name} added successfully`);
      setNewDriver({ name: '', email: '', username: '', phone: '', busNumber: '' });
      setIsAddingDriver(false);
    } else {
      toast.error('Failed to add driver to Firebase');
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (confirm(`Are you sure you want to remove ${driver?.name}?`)) {
      const success = await deleteDriver(driverId);
      if (success) {
        setDrivers(drivers.filter(d => d.id !== driverId));
        toast.success('Driver removed successfully');
      } else {
        toast.error('Failed to delete driver from Firebase');
      }
    }
  };

  // Notification Functions
  const handleSendNotification = async () => {
    const message = customMessage.trim() || selectedMessage;
    if (!message) {
      toast.error('Please select or type a message');
      return;
    }

    // Send notification to all buses if no bus selected, or to specific bus
    const busNumbers = selectedBus && selectedBus !== "all" ? [selectedBus] : buses.map(b => b.number);

    // Send FCM push notifications
    try {
      const { sendFirebaseNotification } = await import('../utils/sendFirebaseNotification');
      
      if (busNumbers.length === 1) {
        // Single bus
        await sendFirebaseNotification({
          message: message.replace('[X]', busNumbers[0]),
          busNumber: busNumbers[0],
          title: `Bus ${busNumbers[0]} Update`,
          adminName: superAdmin?.name || 'Super Admin',
        });
      } else {
        // Multiple buses (all buses)
        await sendFirebaseNotification({
          message: message,
          busNumber: busNumbers,
          title: 'Bus Management Update',
          adminName: superAdmin?.name || 'Super Admin',
        });
      }
    } catch (error) {
      console.error('Error sending FCM notification:', error);
      // Continue even if FCM fails - still save to Firestore
    }

    // Save to Firestore
    const promises = busNumbers.map(busNumber => {
      const notification: Notification = {
        id: `notif_${Date.now()}_${busNumber}_${Math.random()}`,
        busNumber,
        message: message.replace('[X]', busNumber),
        timestamp: new Date(),
        adminName: superAdmin?.name || 'Super Admin',
      };
      return saveNotification(notification);
    });

    const results = await Promise.all(promises);
    const successCount = results.filter(r => r).length;
    const totalCount = results.length;
    
    if (successCount === totalCount) {
      toast.success(`Notification sent ${selectedBus && selectedBus !== "all" ? `to ${selectedBus}` : 'to all buses'}`);
    } else {
      toast.error(`Failed to save ${totalCount - successCount} of ${totalCount} notifications to Firebase. Check console for details.`);
      console.error('Some notifications failed to save. Check Firestore rules and ensure Firebase is properly configured.');
    }
    
    setCustomMessage('');
    setSelectedMessage('');
    setSelectedBus('');
  };

  if (!superAdmin) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-black/10 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600 dark:bg-purple-700 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Super Admin Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Welcome, {superAdmin.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button onClick={handleLogout} variant="outline" className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-black/10 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('buses')}
              className={`px-4 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'buses'
                  ? 'border-purple-600 text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <BusIcon className="w-4 h-4 inline mr-2" />
              Bus Management
            </button>
            <button
              onClick={() => setActiveTab('moderators')}
              className={`px-4 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'moderators'
                  ? 'border-purple-600 text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Moderators
            </button>
            <button
              onClick={() => setActiveTab('drivers')}
              className={`px-4 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'drivers'
                  ? 'border-purple-600 text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Drivers
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-purple-600 text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Bell className="w-4 h-4 inline mr-2" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-purple-600 text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              Reports
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bus Management Tab */}
        {activeTab === 'buses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Bus Management</h2>
              <Dialog open={isAddingBus} onOpenChange={setIsAddingBus}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Bus
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Bus</DialogTitle>
                    <DialogDescription>Enter bus details below</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Bus Number</Label>
                      <Input
                        value={newBus.number}
                        onChange={(e) => setNewBus({ ...newBus, number: e.target.value })}
                        placeholder="Bus 6"
                      />
                    </div>
                    <div>
                      <Label>Route</Label>
                      <Textarea
                        value={newBus.route}
                        onChange={(e) => setNewBus({ ...newBus, route: e.target.value })}
                        placeholder="Enter route details"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Driver Name</Label>
                      <Input
                        value={newBus.driverName}
                        onChange={(e) => setNewBus({ ...newBus, driverName: e.target.value })}
                        placeholder="Driver Name"
                      />
                    </div>
                    <div>
                      <Label>Driver Phone</Label>
                      <Input
                        value={newBus.driverPhone}
                        onChange={(e) => setNewBus({ ...newBus, driverPhone: e.target.value })}
                        placeholder="+880 1711-123456"
                      />
                    </div>
                    <div>
                      <Label>Admin Name</Label>
                      <Input
                        value={newBus.adminName}
                        onChange={(e) => setNewBus({ ...newBus, adminName: e.target.value })}
                        placeholder="Admin Name"
                      />
                    </div>
                    <div>
                      <Label>Capacity</Label>
                      <Input
                        type="number"
                        value={newBus.capacity}
                        onChange={(e) => setNewBus({ ...newBus, capacity: parseInt(e.target.value) || 40 })}
                        placeholder="40"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddBus} disabled={saving} className="flex-1">{saving ? 'Saving...' : 'Add Bus'}</Button>
                      <Button variant="outline" disabled={saving} onClick={() => setIsAddingBus(false)}>Cancel</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Buses</CardTitle>
                <CardDescription>Manage bus routes, drivers, and details</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bus Number</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {buses.map((bus) => (
                      <TableRow key={bus.number}>
                        <TableCell className="font-medium">{bus.number}</TableCell>
                        <TableCell className="max-w-xs truncate">{bus.route}</TableCell>
                        <TableCell>{bus.driverName}</TableCell>
                        <TableCell>{bus.currentStudents} / {bus.capacity}</TableCell>
                        <TableCell>
                          <Badge variant={bus.status === 'full' ? 'destructive' : bus.status === 'delayed' ? 'default' : 'secondary'}>
                            {bus.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {editingBus === bus.number ? (
                              <>
                                <Button size="sm" onClick={handleSaveBus} disabled={saving}>
                                  <Save className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingBus(null)}>
                                  <X className="w-3 h-3" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => setQrCodeBus(bus)}
                                  title="View QR Code"
                                >
                                  <QrCode className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleEditBus(bus)}>
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDeleteBus(bus.number)} disabled={saving}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {editingBus && (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Bus: {editingBus}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Route</Label>
                    <Textarea
                      value={newBus.route}
                      onChange={(e) => setNewBus({ ...newBus, route: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Driver Name</Label>
                      <Input
                        value={newBus.driverName}
                        onChange={(e) => setNewBus({ ...newBus, driverName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Driver Phone</Label>
                      <Input
                        value={newBus.driverPhone}
                        onChange={(e) => setNewBus({ ...newBus, driverPhone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Admin Name</Label>
                      <Input
                        value={newBus.adminName}
                        onChange={(e) => setNewBus({ ...newBus, adminName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Capacity</Label>
                      <Input
                        type="number"
                        value={newBus.capacity}
                        onChange={(e) => setNewBus({ ...newBus, capacity: parseInt(e.target.value) || 40 })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* QR Code Dialog */}
            <Dialog open={!!qrCodeBus} onOpenChange={(open) => !open && setQrCodeBus(null)}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    QR Code - {qrCodeBus?.number}
                  </DialogTitle>
                  <DialogDescription>
                    Scan this QR code to get bus information
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {qrCodeBus && (
                    <>
                      <div className="flex justify-center p-4 bg-white rounded-lg border-2 border-gray-200">
                        <QRCodeSVG
                          value={generateQRCodeData(qrCodeBus)}
                          size={256}
                          level="H"
                          marginSize={4}
                        />
                      </div>
                      <div className="space-y-2 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <p><strong>Bus:</strong> {qrCodeBus.number}</p>
                        <p><strong>Route:</strong> {qrCodeBus.route}</p>
                        <p><strong>Driver:</strong> {qrCodeBus.driverName}</p>
                        {qrCodeBus.driverPhone && (
                          <p><strong>Driver Phone:</strong> {qrCodeBus.driverPhone}</p>
                        )}
                        {qrCodeBus.adminName && (
                          <p><strong>Admin:</strong> {qrCodeBus.adminName}</p>
                        )}
                        <p><strong>Capacity:</strong> {qrCodeBus.capacity}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => qrCodeBus && handleDownloadQRCode(qrCodeBus)}
                          className="flex-1 gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download QR Code
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setQrCodeBus(null)}
                        >
                          Close
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Moderator Management Tab */}
        {activeTab === 'moderators' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Moderator Management</h2>
              <Dialog open={isAddingModerator} onOpenChange={setIsAddingModerator}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Add Moderator
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Moderator</DialogTitle>
                    <DialogDescription>Enter moderator details</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={newModerator.name}
                        onChange={(e) => setNewModerator({ ...newModerator, name: e.target.value })}
                        placeholder="Moderator Name"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={newModerator.email}
                        onChange={(e) => setNewModerator({ ...newModerator, email: e.target.value })}
                        placeholder="moderator@uits.edu"
                      />
                    </div>
                    <div>
                      <Label>Username</Label>
                      <Input
                        value={newModerator.username}
                        onChange={(e) => setNewModerator({ ...newModerator, username: e.target.value })}
                        placeholder="username"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddModerator} className="flex-1">Add Moderator</Button>
                      <Button variant="outline" onClick={() => setIsAddingModerator(false)}>Cancel</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Moderators</CardTitle>
                <CardDescription>Manage moderators who can send notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {moderators.map((moderator) => (
                      <TableRow key={moderator.id}>
                        <TableCell className="font-medium">{moderator.name}</TableCell>
                        <TableCell>{moderator.email}</TableCell>
                        <TableCell>{moderator.username}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteModerator(moderator.id)}
                          >
                            <UserMinus className="w-3 h-3 mr-1" />
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Driver Management Tab */}
        {activeTab === 'drivers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Driver Management</h2>
              <Dialog open={isAddingDriver} onOpenChange={setIsAddingDriver}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Add Driver
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Driver</DialogTitle>
                    <DialogDescription>Enter driver details</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={newDriver.name}
                        onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                        placeholder="Driver Name"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={newDriver.email}
                        onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                        placeholder="driver@uits.edu"
                      />
                    </div>
                    <div>
                      <Label>Username</Label>
                      <Input
                        value={newDriver.username}
                        onChange={(e) => setNewDriver({ ...newDriver, username: e.target.value })}
                        placeholder="username"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={newDriver.phone}
                        onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                        placeholder="+880 1711-123456"
                      />
                    </div>
                    <div>
                      <Label>Assigned Bus (Optional)</Label>
                      <Select value={newDriver.busNumber || "none"} onValueChange={(value) => setNewDriver({ ...newDriver, busNumber: value === "none" ? "" : value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a bus" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {buses && buses.length > 0 ? buses.map(bus => (
                            <SelectItem key={bus.number} value={bus.number}>{bus.number}</SelectItem>
                          )) : null}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddDriver} className="flex-1">Add Driver</Button>
                      <Button variant="outline" onClick={() => setIsAddingDriver(false)}>Cancel</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Drivers</CardTitle>
                <CardDescription>Manage drivers and their bus assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Assigned Bus</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drivers.map((driver) => (
                      <TableRow key={driver.id}>
                        <TableCell className="font-medium">{driver.name}</TableCell>
                        <TableCell>{driver.email}</TableCell>
                        <TableCell>{driver.phone}</TableCell>
                        <TableCell>
                          {driver.busNumber ? (
                            <Badge>{driver.busNumber}</Badge>
                          ) : (
                            <span className="text-gray-400">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteDriver(driver.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Student Reports</h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Reports</CardTitle>
                <CardDescription>View and manage student reports from Firebase</CardDescription>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No reports submitted yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className={`p-4 border rounded-lg ${
                          report.status === 'resolved'
                            ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                            : 'border-red-200 bg-red-50 dark:bg-red-900/20'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={report.status === 'resolved' ? 'default' : 'destructive'}>
                                {report.status}
                              </Badge>
                              <Badge variant="outline">{report.busNumber}</Badge>
                              <Badge variant="outline">{report.type.replace('_', ' ')}</Badge>
                              <span className="text-xs text-gray-500">
                                {report.timestamp instanceof Date 
                                  ? report.timestamp.toLocaleString()
                                  : new Date(report.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              Student ID: {report.studentId}
                            </p>
                            {report.description && (
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {report.description}
                              </p>
                            )}
                          </div>
                          {report.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  const { updateDoc, doc } = await import('firebase/firestore');
                                  const { db } = await import('../config/firebase');
                                  if (db) {
                                    const reportRef = doc(db, 'reports', report.id);
                                    await updateDoc(reportRef, { status: 'resolved' });
                                    toast.success('Report marked as resolved');
                                  }
                                } catch (error) {
                                  console.error('Error updating report:', error);
                                  toast.error('Failed to update report');
                                }
                              }}
                              className="ml-2"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Mark Resolved
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Send Notification Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Send Notification
                  </CardTitle>
                  <CardDescription>Send notifications to all buses or a specific bus</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Bus (Optional - leave empty for all buses)</Label>
                    <Select value={selectedBus || "all"} onValueChange={setSelectedBus}>
                      <SelectTrigger>
                        <SelectValue placeholder="All buses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Buses</SelectItem>
                        {buses && buses.length > 0 ? buses.map(bus => (
                          <SelectItem key={bus.number} value={bus.number}>
                            {bus.number}
                          </SelectItem>
                        )) : null}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Prebuilt Messages</Label>
                    <Select value={selectedMessage} onValueChange={setSelectedMessage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a prebuilt message" />
                      </SelectTrigger>
                      <SelectContent>
                        {PREBUILT_MESSAGES.map(msg => (
                          <SelectItem key={msg} value={msg}>
                            {msg}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Or Type Custom Message</Label>
                    <Textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Enter your custom notification message..."
                      rows={4}
                    />
                  </div>

                  <Button onClick={handleSendNotification} className="w-full gap-2">
                    <Send className="w-4 h-4" />
                    Send Notification {selectedBus ? `to ${selectedBus}` : 'to All Buses'}
                  </Button>
                </CardContent>
              </Card>

              {/* Read Notifications Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    All Notifications
                  </CardTitle>
                  <CardDescription>View all sent notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <NotificationList />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

