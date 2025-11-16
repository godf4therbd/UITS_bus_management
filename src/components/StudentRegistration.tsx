import { useState } from 'react';
import { Student } from '../types';
import { registerStudent, setCurrentUser } from '../utils/auth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { ArrowLeft, UserPlus } from 'lucide-react';
import uitsLogo from "../assets/uits-logo.png";


interface StudentRegistrationProps {
  onBack: () => void;
  onRegister: () => void;
}

export function StudentRegistration({ onBack, onRegister }: StudentRegistrationProps) {
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    batch: '',
    phone: '',
    bloodGroup: '',
    emergencyContact: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.studentId || !formData.name || !formData.batch || 
        !formData.phone || !formData.bloodGroup || !formData.emergencyContact ||
        !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Generate email from studentId
      const email = `${formData.studentId.toLowerCase()}@uits.edu`;

      // Create student object
      const student: Student = {
        id: `student_${Date.now()}`,
        username: formData.studentId,
        email: email,
        password: formData.password,
        role: 'student',
        name: formData.name,
        studentId: formData.studentId,
        batch: formData.batch,
        phone: formData.phone,
        bloodGroup: formData.bloodGroup,
        emergencyContact: formData.emergencyContact,
      };

      // Register to Firebase (this will also save to localStorage as fallback)
      const success = await registerStudent(student, formData.password);
      
      if (success) {
        // Set current user and proceed
        setCurrentUser(student);
        toast.success('Registration successful! Your data has been saved to Firebase.');
        onRegister();
      } else {
        // Registration failed, but data might be saved to localStorage as fallback
        setCurrentUser(student);
        toast.warning('Registration completed with local storage. Firebase sync may have failed.');
        onRegister();
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(`Registration failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-white via-[#FFF5F5] to-[#FFE8E8] p-4">
      <Card className="w-full max-w-2xl shadow-xl border-[#F4F4F4]">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md p-3">
              <img src={uitsLogo} alt="UITS Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <CardTitle className="text-center text-[#333333]">
            Student Registration
          </CardTitle>
          <CardDescription className="text-center">
            Create your account to access the bus management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID *</Label>
                <Input
                  id="studentId"
                  placeholder="e.g., S001"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Ahmed Hasan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch">Batch Number *</Label>
                <Input
                  id="batch"
                  placeholder="e.g., 2023"
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., +880 1611-111111"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group *</Label>
                <Select
                  value={formData.bloodGroup}
                  onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
                >
                  <SelectTrigger id="bloodGroup">
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact *</Label>
                <Input
                  id="emergencyContact"
                  type="tel"
                  placeholder="e.g., +880 1711-111111"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onBack}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-[#FF6B6B] hover:bg-[#E55A5A] text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Register'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
