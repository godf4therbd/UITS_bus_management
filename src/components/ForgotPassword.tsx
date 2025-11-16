import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import uitsLogo from '../assets/uits-logo.png';

interface ForgotPasswordProps {
  onBack: () => void;
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email or student ID');
      return;
    }

    // Mock password reset
    setTimeout(() => {
      setSubmitted(true);
      toast.success('Password reset link sent!');
    }, 500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-white via-[#FFF5F5] to-[#FFE8E8] p-4">
        <Card className="w-full max-w-md shadow-xl border-[#F4F4F4]">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-[#FF6B6B] rounded-full flex items-center justify-center shadow-md">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-center text-[#333333]">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-center">
              We've sent a password reset link to {email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-[#666666] text-center">
                Click the link in the email to reset your password. If you don't see the email, 
                check your spam folder.
              </p>
              <Button
                onClick={onBack}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-white via-[#FFF5F5] to-[#FFE8E8] p-4">
      <Card className="w-full max-w-md shadow-xl border-[#F4F4F4]">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-[#FF6B6B] rounded-full flex items-center justify-center shadow-md">
              <Mail className="w-12 h-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-center text-[#333333]">
            Forgot Password?
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email or student ID to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email or Student ID</Label>
              <Input
                id="email"
                type="text"
                placeholder="Enter your email or student ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-[#FF6B6B] hover:bg-[#E55A5A] text-white">
              Send Reset Link
            </Button>
            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
