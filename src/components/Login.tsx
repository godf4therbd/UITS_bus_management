import { useState } from 'react';
import { loginByEmail, setCurrentUser } from '../utils/auth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import uitsLogo from '../assets/uits-logo.png';
import { ThemeToggle } from './ThemeToggle';
import { Loader2 } from 'lucide-react';
import { logger } from '../utils/logger';

interface LoginProps {
  onLogin: () => void;
  onForgotPassword: () => void;
  onRegister: () => void;
}

export function Login({ onLogin, onForgotPassword, onRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const user = await loginByEmail(email, password);
      if (user) {
        setCurrentUser(user);
        toast.success(`Welcome, ${user.name}!`);
        onLogin();
      } else {
        if (email.toLowerCase().endsWith('@uits.edu')) {
          toast.error('Invalid credentials. Please check your email and password.');
        } else {
          toast.error('Invalid credentials');
        }
      }
    } catch (error: any) {
      logger.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email. Please register first.');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address format.');
      } else {
        toast.error(`Login failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        {/* iOS Style Card Container */}
        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-0 overflow-hidden">
          {/* Header Section */}
          <CardHeader className="px-6 pt-8 pb-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center shadow-sm p-2">
                <img
                  src={uitsLogo}
                  alt="UITS Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                UITS Bus Management
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400 text-sm">
                Sign in to continue
              </CardDescription>
            </div>
          </CardHeader>

          {/* Form Section */}
          <CardContent className="px-6 pb-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="studentId@uits.edu (e.g., s001@uits.edu)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                />
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm text-blue-600 dark:text-blue-400 font-medium"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 !bg-red-600 hover:!bg-red-700 text-white font-semibold rounded-xl shadow-sm active:scale-[0.98] transition-all disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : 'Sign In'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Demo Credentials</span>
              </div>
            </div>

            {/* Demo Credentials - iOS Style List */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <div className="px-4 py-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Student</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">student@uits.edu</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">password123</div>
                </div>
                <div className="px-4 py-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Super Admin</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">superadmin@uits.edu</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">password123</div>
                </div>
                <div className="px-4 py-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Moderator</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">moderator@uits.edu</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">password123</div>
                </div>
                <div className="px-4 py-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Driver</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">driver@uits.edu</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">password123</div>
                </div>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onRegister}
                  className="text-blue-600 dark:text-blue-400 font-semibold"
                >
                  Sign up
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
