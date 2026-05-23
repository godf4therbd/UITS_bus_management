import { useState, useEffect, useMemo, useCallback } from 'react';
import { Admin, Bus, Notification, Report } from '../types';
import { getCurrentUser, logout } from '../utils/auth';
import { mockBuses } from '../data/mockData';
import {
  getNotifications,
  subscribeToNotifications,
  getReports,
  subscribeToReports,
} from '../utils/firestoreService';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Toaster, toast } from 'sonner';
import { LogOut, Bus as BusIcon, Send, Users, Clock, AlertCircle, CheckCircle, Bell, AlertTriangle } from 'lucide-react';
import { Badge } from './ui/badge';
import { ThemeToggle } from './ThemeToggle';
import { PREBUILT_MESSAGES } from '../constants/notifications';

interface AdminDashboardProps {
  onLogout: () => void;
}

// Admin Notification List Component
function AdminNotificationList({ admin }: { admin: Admin | null }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const allNotifs = await getNotifications();
        // Filter notifications for admin's assigned buses
        const adminNotifs = admin?.assignedBuses
          ? allNotifs.filter(n => admin.assignedBuses.includes(n.busNumber))
          : allNotifs;
        setNotifications(adminNotifs);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
    const unsubscribe = subscribeToNotifications((updatedNotifications) => {
      // Filter notifications for admin's assigned buses
      const adminNotifs = admin?.assignedBuses
        ? updatedNotifications.filter(n => admin.assignedBuses.includes(n.busNumber))
        : updatedNotifications;
      setNotifications(adminNotifs);
    });
    return () => unsubscribe();
  }, [admin]);

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

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [selectedBus, setSelectedBus] = useState<string>('');
  const [buses, setBuses] = useState<Bus[]>(mockBuses);
  const [selectedMessage, setSelectedMessage] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reports, setReports] = useState<Report[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.role === 'admin') {
      setAdmin(user as Admin);
    }
    
    // Subscribe to reports for assigned buses
    const unsubscribeReports = subscribeToReports((updatedReports) => {
      // Filter reports for admin's assigned buses
      const adminReports = admin?.assignedBuses
        ? updatedReports.filter(r => admin.assignedBuses.includes(r.busNumber))
        : updatedReports;
      setReports(adminReports);
    });
    
    return () => unsubscribeReports();
  }, [admin]);

  const currentBus = useMemo(
    () => buses.find(b => b.number === selectedBus),
    [buses, selectedBus]
  );

  const handleLogout = useCallback(() => {
    logout();
    toast.success('Logged out successfully');
    onLogout();
  }, [onLogout]);

  const handleSendNotification = useCallback(async () => {
    if (!selectedBus) {
      toast.error('Please select a bus first');
      return;
    }

    const message = customMessage.trim() || selectedMessage;
    if (!message) {
      toast.error('Please select or type a message');
      return;
    }

    setSending(true);
    try {
      try {
        const { sendFirebaseNotification } = await import('../utils/sendFirebaseNotification');
        await sendFirebaseNotification({
          message: message.replace('[X]', selectedBus),
          busNumber: selectedBus,
          title: `Bus ${selectedBus} Update`,
          adminName: admin?.name || 'Admin',
        });
      } catch {
        // Continue even if FCM fails - still save to Firestore
      }

      const notification: Notification = {
        id: `notif_${Date.now()}_${Math.random()}`,
        busNumber: selectedBus,
        message: message.replace('[X]', selectedBus),
        timestamp: new Date(),
        adminName: admin?.name || 'Admin',
      };

      const { saveNotification } = await import('../utils/firestoreService');
      const success = await saveNotification(notification);

      if (success) {
        toast.success(`Notification sent to all students on ${selectedBus}`);
        setCustomMessage('');
        setSelectedMessage('');
      } else {
        toast.error('Failed to save notification to Firebase.');
      }
    } finally {
      setSending(false);
    }
  }, [selectedBus, customMessage, selectedMessage, admin, sending]);

  const handleUpdateBusStatus = (status: 'on-time' | 'delayed' | 'full') => {
    if (!selectedBus) {
      toast.error('Please select a bus first');
      return;
    }

    setBuses(buses.map(bus => {
      if (bus.number === selectedBus) {
        return { ...bus, status };
      }
      return bus;
    }));

    toast.success(`${selectedBus} status updated to ${status}`);
  };

  if (!admin) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FFF5F5] to-[#FFE8E8] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-[#F4F4F4] dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#FF6B6B] dark:bg-red-700 rounded-full flex items-center justify-center">
              <BusIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-[#333333] dark:text-white">Admin Dashboard</h1>
              <p className="text-sm text-[#666666] dark:text-gray-400">Welcome, {admin.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              onClick={handleLogout}
              variant="outline"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-[#F4F4F4] dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-[#FF6B6B] text-[#FF6B6B] bg-[#FFF5F5] dark:bg-gray-700 dark:text-red-400 dark:border-red-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <BusIcon className="w-4 h-4 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-[#FF6B6B] text-[#FF6B6B] bg-[#FFF5F5] dark:bg-gray-700 dark:text-red-400 dark:border-red-400'
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
                  ? 'border-[#FF6B6B] text-[#FF6B6B] bg-[#FFF5F5] dark:bg-gray-700 dark:text-red-400 dark:border-red-400'
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bus Selection */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Select Bus</CardTitle>
                <CardDescription>Choose a bus to manage and send notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedBus} onValueChange={setSelectedBus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a bus" />
                  </SelectTrigger>
                  <SelectContent>
                    {admin.assignedBuses.map(busNumber => (
                      <SelectItem key={busNumber} value={busNumber}>
                        {busNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Bus Details */}
          {currentBus && (
            <>
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {currentBus.number} Details
                    <Badge 
                      variant={currentBus.status === 'full' ? 'destructive' : currentBus.status === 'delayed' ? 'default' : 'secondary'}
                      className={currentBus.status === 'on-time' ? 'bg-green-500 hover:bg-green-600' : ''}
                    >
                      {currentBus.status === 'on-time' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {currentBus.status === 'delayed' && <Clock className="w-3 h-3 mr-1" />}
                      {currentBus.status === 'full' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {currentBus.status.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#666666]">Driver</p>
                      <p className="text-[#333333]">{currentBus.driverName}</p>
                      <p className="text-sm text-[#666666]">{currentBus.driverPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#666666]">Admin</p>
                      <p className="text-[#333333]">{currentBus.adminName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#666666]">Capacity</p>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#FF6B6B]" />
                        <p className="text-[#333333]">
                          {currentBus.currentStudents} / {currentBus.capacity}
                        </p>
                      </div>
                    </div>
                    {currentBus.delayMinutes && (
                      <div>
                        <p className="text-sm text-[#666666]">Delay</p>
                        <p className="text-[#FF6B6B]">{currentBus.delayMinutes} minutes</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-[#666666]">Route</p>
                    <p className="text-[#333333]">{currentBus.route}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-[#F4F4F4]">
                    <p className="text-sm text-[#666666] mb-3">Update Bus Status</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUpdateBusStatus('on-time')}
                        variant={currentBus.status === 'on-time' ? 'default' : 'outline'}
                        className={currentBus.status === 'on-time' ? 'bg-green-500 hover:bg-green-600' : ''}
                        size="sm"
                      >
                        On Time
                      </Button>
                      <Button
                        onClick={() => handleUpdateBusStatus('delayed')}
                        variant={currentBus.status === 'delayed' ? 'default' : 'outline'}
                        size="sm"
                      >
                        Delayed
                      </Button>
                      <Button
                        onClick={() => handleUpdateBusStatus('full')}
                        variant={currentBus.status === 'full' ? 'destructive' : 'outline'}
                        size="sm"
                      >
                        Full
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Send Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Send Notification</CardTitle>
                  <CardDescription>Send updates to all students on this bus</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Quick Messages</Label>
                    <Select value={selectedMessage} onValueChange={(value) => {
                      setSelectedMessage(value);
                      setCustomMessage('');
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a message" />
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

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-[#F4F4F4]" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-[#666666]">Or</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customMessage">Custom Message</Label>
                    <Textarea
                      id="customMessage"
                      placeholder="Type your custom message here..."
                      value={customMessage}
                      onChange={(e) => {
                        setCustomMessage(e.target.value);
                        setSelectedMessage('');
                      }}
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleSendNotification}
                    disabled={sending}
                    className="w-full bg-[#FF6B6B] hover:bg-[#E55A5A] text-white gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {sending ? 'Sending...' : 'Send Notification'}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {!currentBus && (
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="py-12 text-center">
                  <BusIcon className="w-16 h-16 text-[#CCCCCC] mx-auto mb-4" />
                  <p className="text-[#666666]">Select a bus to view details and send notifications</p>
                </CardContent>
              </Card>
            </div>
          )}
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
                <CardTitle>Reports for Your Buses</CardTitle>
                <CardDescription>View and manage student reports from your assigned buses</CardDescription>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No reports submitted yet for your buses</p>
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
                  <CardDescription>Send notifications to your assigned buses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Bus</Label>
                    <Select value={selectedBus} onValueChange={setSelectedBus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a bus" />
                      </SelectTrigger>
                      <SelectContent>
                        {admin.assignedBuses.map(busNumber => (
                          <SelectItem key={busNumber} value={busNumber}>
                            {busNumber}
                          </SelectItem>
                        ))}
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

                  <Button onClick={handleSendNotification} disabled={sending} className="w-full gap-2 bg-[#FF6B6B] hover:bg-[#E55A5A]">
                    <Send className="w-4 h-4" />
                    {sending ? 'Sending...' : `Send Notification to ${selectedBus || 'Selected Bus'}`}
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
                  <AdminNotificationList admin={admin} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
