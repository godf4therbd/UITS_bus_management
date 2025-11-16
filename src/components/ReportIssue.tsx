import { useState } from 'react';
import { Report } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { toast } from 'sonner';
import { AlertTriangle, Clock, Users, Droplets, FileText, Send } from 'lucide-react';

interface ReportIssueProps {
  studentId: string;
  busNumber?: string;
  onSubmit: (report: Omit<Report, 'id' | 'timestamp' | 'status'>) => void;
}

const reportTypes = [
  {
    value: 'bus_late',
    label: 'Bus is Late',
    icon: Clock,
    description: 'Report if your bus is running late',
  },
  {
    value: 'behaviour_issue',
    label: 'Behaviour Issue',
    icon: Users,
    description: 'Report inappropriate behavior on the bus',
  },
  {
    value: 'accident',
    label: 'Accident',
    icon: AlertTriangle,
    description: 'Report an accident or emergency situation',
  },
  {
    value: 'bus_hygiene',
    label: 'Bus Hygiene',
    icon: Droplets,
    description: 'Report cleanliness or hygiene issues',
  },
  {
    value: 'other',
    label: 'Other',
    icon: FileText,
    description: 'Report any other issue',
  },
];

export function ReportIssue({ studentId, busNumber, onSubmit }: ReportIssueProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedType) {
      toast.error('Please select a report type');
      return;
    }

    if (!busNumber) {
      toast.error('Please scan QR code first to select your bus');
      return;
    }

    // Call onSubmit (which is async and handles the submission)
    await onSubmit({
      studentId,
      busNumber,
      type: selectedType as Report['type'],
      description: description.trim() || undefined,
    });

    // Only clear form if submission was successful (onSubmit handles success/error messages)
    setSelectedType('');
    setDescription('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#FF6B6B]" />
          Report an Issue
        </CardTitle>
        <CardDescription>
          Report any issues or concerns about your bus
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>Select Issue Type</Label>
            <RadioGroup value={selectedType} onValueChange={setSelectedType}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reportTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <label
                      key={type.value}
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedType === type.value
                          ? 'border-[#FF6B6B] bg-[#FFF5F5]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4 text-[#FF6B6B]" />
                          <span className="font-medium text-sm">{type.label}</span>
                        </div>
                        <p className="text-xs text-gray-500">{type.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Details (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide more information about the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#FF6B6B] hover:bg-[#E55A5A] text-white gap-2"
            disabled={!selectedType || !busNumber}
          >
            <Send className="w-4 h-4" />
            Submit Report
          </Button>

          {!busNumber && (
            <p className="text-sm text-[#FF6B6B] text-center">
              Please scan the QR code first to select your bus
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}


