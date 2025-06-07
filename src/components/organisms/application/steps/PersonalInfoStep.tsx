import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import { Label } from '@/components/shadcn-ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn-ui/select';
import { Textarea } from '@/components/shadcn-ui/textarea';
import { ApplicationData } from '../MultiStepApplicationForm';
import { ChevronRight, User } from 'lucide-react';

interface PersonalInfoStepProps {
  data: ApplicationData;
  updateData: (updates: Partial<ApplicationData>) => void;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ data, updateData }) => {
  const isValid = data.firstName && data.lastName && data.email && data.phone;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Please provide your basic contact information and professional links.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={data.firstName}
                  onChange={(e) => updateData({ firstName: e.target.value })}
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={data.lastName}
                  onChange={(e) => updateData({ lastName: e.target.value })}
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => updateData({ email: e.target.value })}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={data.phone}
                onChange={(e) => updateData({ phone: e.target.value })}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinProfile">LinkedIn Profile (Optional)</Label>
              <Input
                id="linkedinProfile"
                type="url"
                value={data.linkedinProfile || ''}
                onChange={(e) => updateData({ linkedinProfile: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolioWebsite">Portfolio Website (Optional)</Label>
              <Input
                id="portfolioWebsite"
                type="url"
                value={data.portfolioWebsite || ''}
                onChange={(e) => updateData({ portfolioWebsite: e.target.value })}
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalInfoStep;
