import { useState, useEffect } from 'react';
import { Moderator, Bus, Driver, Notification, Report } from '../types';
import { getCurrentUser, logout } from '../utils/auth';
import { mockBuses, mockModerators, mockDrivers } from '../data/mockData';
import {
  getBuses,
  saveBus,
  subscribeToBuses,
  getModerators,
  getDrivers,
  getNotifications,
  saveNotification,
  subscribeToNotifications,
  getReports,
  subscribeToReports,
} from '../utils/firestoreService';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { LogOut, Bus as BusIcon, Users, Edit, Save, X, Trash2, Send, Bell, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { ThemeToggle } from './ThemeToggle';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

interface ModeratorDashboardProps {
  onLogout: () => void;
}


const PREBUILT_MESSAGES = [
  'Bus is full',
  'Bus is delayed by 10 minutes',
  'Bus is delayed by 15 minutes',
  'Bus is delayed by 20 minutes',
  'Bus will depart shortly',
  'Bus has departed',
  'Traffic on the route - expect delays',
];

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

export function ModeratorDashboard({ onLogout }: ModeratorDashboardProps) {
  const [moderator, setModerator] = useState<Moderator | null>(null);
  const [buses, setBuses] = useState<Bus[]>(mockBuses);
  const [moderators, setModerators] = useState<Moderator[]>(mockModerators);
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
  const [activeTab, setActiveTab] = useState('buses');

  // Bus management state
  const [editingBus, setEditingBus] = useState<string | null>(null);
  const [newBus, setNewBus] = useState({
    number: '',
    route: '',
    driverName: '',
    driverPhone: '',
    adminName: '',
    capacity: 40,
  });

  // Notification state
  const [selectedBus, setSelectedBus] = useState<string>('');
  const [selectedMessage, setSelectedMessage] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');

  // Reports state
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.role === 'moderator') {
      setModerator(user as Moderator);
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
      }

      // Load moderators
      const moderatorsData = await getModerators();
      if (moderatorsData.length > 0) {
        setModerators(moderatorsData);
      }

      // Load drivers
      const driversData = await getDrivers();
      if (driversData.length > 0) {
        setDrivers(driversData);
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

  // Bus Management Functions (read-only, can edit but not add/delete)
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

    const success = await saveBus(bus);
    if (success) {
      setBuses(buses.map(b => b.number === editingBus ? bus : b));
      toast.success(`${editingBus} updated successfully`);
      setEditingBus(null);
      setNewBus({
        number: '',
        route: '',
        driverName: '',
        driverPhone: '',
        adminName: '',
        capacity: 40,
      });
    } else {
      toast.error('Failed to update bus in Firebase');
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
          adminName: moderator?.name || 'Moderator',
        });
      } else {
        // Multiple buses (all buses)
        await sendFirebaseNotification({
          message: message,
          busNumber: busNumbers,
          title: 'Bus Management Update',
          adminName: moderator?.name || 'Moderator',
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
        adminName: moderator?.name || 'Moderator',
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

  if (!moderator) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-black/10 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 dark:bg-blue-700 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Moderator Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Welcome, {moderator.name}</p>
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
                  ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-400'
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
                  ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Moderators
            </button>
            <button
              onClick={() => setActiveTab('drivers')}
              className={`px-4 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'drivers'
                  ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-400'
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
                  ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-400'
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
                  ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-400'
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
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Buses</CardTitle>
                <CardDescription>View and edit bus routes, drivers, and details</CardDescription>
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
                                <Button size="sm" onClick={handleSaveBus}>
                                  <Save className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingBus(null)}>
                                  <X className="w-3 h-3" />
                                </Button>
                              </>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => handleEditBus(bus)}>
                                <Edit className="w-3 h-3" />
                              </Button>
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
          </div>
        )}

        {/* Moderator Management Tab - View Only */}
        {activeTab === 'moderators' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Moderator Management</h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Moderators</CardTitle>
                <CardDescription>View all moderators (read-only)</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Username</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {moderators.map((mod) => (
                      <TableRow key={mod.id}>
                        <TableCell className="font-medium">{mod.name}</TableCell>
                        <TableCell>{mod.email}</TableCell>
                        <TableCell>{mod.username}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Driver Management Tab - View Only */}
        {activeTab === 'drivers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Driver Management</h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Drivers</CardTitle>
                <CardDescription>View all drivers and their bus assignments (read-only)</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Assigned Bus</TableHead>
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

