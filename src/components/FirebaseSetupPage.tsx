import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { addAllMockUsersToFirebase, addSuperAdminToFirebase, addModeratorToFirebase, addDriverToFirebase, addAdminToFirebase } from '../utils/firebaseAdminSetup';
import { mockSuperAdmins, mockModerators, mockDrivers, mockAdmins } from '../data/mockData';
import { toast } from 'sonner';
import { UserPlus, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function FirebaseSetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    superAdmins: number;
    moderators: number;
    drivers: number;
    admins: number;
  } | null>(null);

  const handleAddAllUsers = async () => {
    setIsLoading(true);
    setResults(null);

    try {
      await addAllMockUsersToFirebase();
      
      setResults({
        superAdmins: mockSuperAdmins.length,
        moderators: mockModerators.length,
        drivers: mockDrivers.length,
        admins: mockAdmins.length,
      });

      toast.success('All users have been added to Firebase!');
    } catch (error: any) {
      console.error('Error adding users:', error);
      toast.error(`Error: ${error.message || 'Failed to add users'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuperAdmins = async () => {
    setIsLoading(true);
    try {
      let successCount = 0;
      for (const superAdmin of mockSuperAdmins) {
        const success = await addSuperAdminToFirebase(superAdmin);
        if (success) successCount++;
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      toast.success(`Added ${successCount}/${mockSuperAdmins.length} Super Admins`);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddModerators = async () => {
    setIsLoading(true);
    try {
      let successCount = 0;
      for (const moderator of mockModerators) {
        const success = await addModeratorToFirebase(moderator);
        if (success) successCount++;
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      toast.success(`Added ${successCount}/${mockModerators.length} Moderators`);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdmins = async () => {
    setIsLoading(true);
    try {
      let successCount = 0;
      for (const admin of mockAdmins) {
        const success = await addAdminToFirebase(admin);
        if (success) successCount++;
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      toast.success(`Added ${successCount}/${mockAdmins.length} Admins`);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDrivers = async () => {
    setIsLoading(true);
    try {
      let successCount = 0;
      for (const driver of mockDrivers) {
        const success = await addDriverToFirebase(driver);
        if (success) successCount++;
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      toast.success(`Added ${successCount}/${mockDrivers.length} Drivers`);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-6 h-6" />
              Firebase User Setup
            </CardTitle>
            <CardDescription>
              Add Super Admins, Moderators, Drivers, and Admins to Firebase Authentication and Firestore
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button
                onClick={handleAddAllUsers}
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding Users...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add All Users to Firebase
                  </>
                )}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleAddSuperAdmins}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  Add Super Admins ({mockSuperAdmins.length})
                </Button>

                <Button
                  onClick={handleAddModerators}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  Add Moderators ({mockModerators.length})
                </Button>

                <Button
                  onClick={handleAddAdmins}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  Add Admins ({mockAdmins.length})
                </Button>

                <Button
                  onClick={handleAddDrivers}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  Add Drivers ({mockDrivers.length})
                </Button>
              </div>
            </div>

            {results && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-semibold text-green-900 dark:text-green-100">Setup Complete!</h3>
                </div>
                <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
                  <p>✅ Super Admins: {results.superAdmins}</p>
                  <p>✅ Moderators: {results.moderators}</p>
                  <p>✅ Admins: {results.admins}</p>
                  <p>✅ Drivers: {results.drivers}</p>
                </div>
                <p className="mt-3 text-xs text-green-700 dark:text-green-300">
                  Check Firebase Console to verify the users were added successfully.
                </p>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Default Credentials</h3>
              <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <p><strong>Password for all users:</strong> password123</p>
                <p className="mt-2"><strong>Super Admin:</strong> superadmin@uits.edu</p>
                <p><strong>Moderator:</strong> moderator@uits.edu</p>
                <p><strong>Admin:</strong> admin@uits.edu</p>
                <p><strong>Driver:</strong> driver@uits.edu</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

