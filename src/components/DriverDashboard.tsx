import { useState, useEffect } from 'react';
import { Driver, Bus, Notification } from '../types';
import { getCurrentUser, logout } from '../utils/auth';
import { mockBuses } from '../data/mockData';
import {
  getNotifications,
  subscribeToNotifications,
} from '../utils/firestoreService';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { LogOut, Bus as BusIcon, Users, MapPin, Bell } from 'lucide-react';
import { Badge } from './ui/badge';
import uitsLogo from '../assets/uits-logo.png';
import { ThemeToggle } from './ThemeToggle';

interface DriverDashboardProps {
  onLogout: () => void;
}

const DRIVERS_KEY = 'uits_drivers';

export function DriverDashboard({ onLogout }: DriverDashboardProps) {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [buses] = useState<Bus[]>(mockBuses);
  const [selectedBusNumber, setSelectedBusNumber] = useState<string>('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.role === 'driver') {
      const driverUser = user as Driver;
      setDriver(driverUser);
      // Set initial bus selection
      if (driverUser.busNumber) {
        setSelectedBusNumber(driverUser.busNumber);
      }
    }
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const allNotifs = await getNotifications(selectedBusNumber || undefined);
        setNotifications(allNotifs);
      } catch (error) {
        console.error('Error loading notifications:', error);
        setNotifications([]);
      }
    };

    loadNotifications();
    const unsubscribe = subscribeToNotifications((updatedNotifications) => {
      // Filter by selected bus if one is selected
      const filtered = selectedBusNumber
        ? updatedNotifications.filter(n => n.busNumber === selectedBusNumber)
        : updatedNotifications;
      setNotifications(filtered);
    }, selectedBusNumber || undefined);
    
    return () => unsubscribe();
  }, [selectedBusNumber]);

  const handleBusSelection = (busNumber: string) => {
    setSelectedBusNumber(busNumber);
    if (driver) {
      // Update driver's bus assignment in localStorage
      const storedDrivers = localStorage.getItem(DRIVERS_KEY);
      if (storedDrivers) {
        const drivers: Driver[] = JSON.parse(storedDrivers);
        const updatedDrivers = drivers.map(d => {
          if (d.id === driver.id) {
            return { ...d, busNumber };
          }
          return d;
        });
        localStorage.setItem(DRIVERS_KEY, JSON.stringify(updatedDrivers));
      }
      // Update current driver state
      setDriver({ ...driver, busNumber });
    }
    toast.success(`Selected ${busNumber}`);
    loadNotifications();
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    onLogout();
  };

  const currentBus = selectedBusNumber ? buses.find(b => b.number === selectedBusNumber) : null;

  if (!driver) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FFF5F5] to-[#FFE8E8] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-[#F4F4F4] dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm p-2">
              <img
                src={uitsLogo}
                alt="UITS Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-[#333333] dark:text-white">Driver Dashboard</h1>
              <p className="text-sm text-[#666666] dark:text-gray-400">Welcome, {driver.name}</p>
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
              {notifications.length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">{notifications.length}</Badge>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Driver Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-[#666666]">Name</p>
                  <p className="text-[#333333]">{driver.name}</p>
                </div>
                <div>
                  <p className="text-sm text-[#666666]">Phone</p>
                  <p className="text-[#333333]">{driver.phone}</p>
                </div>
                <div className="space-y-2">
                  <Label>Select Bus</Label>
                  <Select value={selectedBusNumber} onValueChange={handleBusSelection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a bus" />
                    </SelectTrigger>
                    <SelectContent>
                      {buses.map(bus => (
                        <SelectItem key={bus.number} value={bus.number}>
                          {bus.number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedBusNumber && (
                  <div>
                    <p className="text-sm text-[#666666]">Selected Bus</p>
                    <Badge className="bg-[#FF6B6B]">{selectedBusNumber}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>


            {currentBus && (
              <Card>
                <CardHeader>
                  <CardTitle>Today's Route</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentBus.stops.map((stop, index) => (
                      <div key={stop.name} className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0 ${
                          index === 0 ? 'bg-green-500' : 
                          index === currentBus.stops.length - 1 ? 'bg-[#FF6B6B]' : 
                          'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-[#333333]">{stop.name}</p>
                          <p className="text-xs text-[#666666]">{stop.estimatedTime}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Bus Details & Map */}
          <div className="lg:col-span-2 space-y-6">
            {currentBus ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {currentBus.number} Details
                      <Badge 
                        variant={currentBus.status === 'full' ? 'destructive' : currentBus.status === 'delayed' ? 'default' : 'secondary'}
                        className={currentBus.status === 'on-time' ? 'bg-green-500 hover:bg-green-600' : ''}
                      >
                        {currentBus.status.toUpperCase()}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-[#666666]">Admin</p>
                        <p className="text-[#333333]">{currentBus.adminName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[#666666]">Current Passengers</p>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#FF6B6B]" />
                          <p className="text-[#333333]">
                            {currentBus.currentStudents} / {currentBus.capacity}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-[#666666] mb-2">Route</p>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[#FF6B6B] flex-shrink-0 mt-1" />
                        <p className="text-[#333333]">{currentBus.route}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#F4F4F4]">
                      <div className="text-center">
                        <p className="text-2xl text-[#FF6B6B]">{currentBus.currentStudents}</p>
                        <p className="text-xs text-[#666666]">Students</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl text-[#FF6B6B]">{currentBus.stops.length}</p>
                        <p className="text-xs text-[#666666]">Stops</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl text-[#FF6B6B]">
                          {currentBus.delayMinutes || 0}m
                        </p>
                        <p className="text-xs text-[#666666]">Delay</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BusIcon className="w-16 h-16 text-[#CCCCCC] mx-auto mb-4" />
                  <p className="text-[#666666] mb-4">Please select a bus to view details</p>
                  <Select value={selectedBusNumber} onValueChange={handleBusSelection}>
                    <SelectTrigger className="max-w-xs mx-auto">
                      <SelectValue placeholder="Choose a bus" />
                    </SelectTrigger>
                    <SelectContent>
                      {buses.map(bus => (
                        <SelectItem key={bus.number} value={bus.number}>
                          {bus.number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  {notifications.length === 0 
                    ? 'No notifications yet' 
                    : `You have ${notifications.length} notification${notifications.length > 1 ? 's' : ''}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No notifications to display</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => {
                      // Ensure timestamp is properly parsed
                      const timestamp = notification.timestamp instanceof Date 
                        ? notification.timestamp 
                        : new Date(notification.timestamp);
                      
                      return (
                        <div
                          key={notification.id}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">{notification.busNumber}</Badge>
                                <span className="text-xs text-gray-500">
                                  {timestamp.toLocaleString()}
                                </span>
                              </div>
                              <p className="text-gray-900">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                From: {notification.adminName}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
