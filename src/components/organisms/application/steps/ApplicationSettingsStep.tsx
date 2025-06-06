import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Label } from '@/components/shadcn-ui/label';
import { Textarea } from '@/components/shadcn-ui/textarea';
import { Switch } from '@/components/shadcn-ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn-ui/select';
import { ApplicationData } from '../MultiStepApplicationForm';
import { ChevronRight, ChevronLeft, Settings, Calendar } from 'lucide-react';

interface ApplicationSettingsStepProps {
  data: ApplicationData;
  updateData: (updates: Partial<ApplicationData>) => void;
}

const ApplicationSettingsStep: React.FC<ApplicationSettingsStepProps> = ({ 
  data, 
  updateData 
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Application Settings
          </CardTitle>
          <CardDescription>
            Customize your application preferences and add any additional information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="additionalMessage">Additional Message</Label>
              <Textarea
                id="additionalMessage"
                value={data.additionalMessage || ''}
                onChange={(e) => updateData({ additionalMessage: e.target.value })}
                placeholder="Write a brief message to the hiring manager explaining why you're interested in this position..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                This message will be included with your application (optional but recommended)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="availableStartDate">Earliest Start Date</Label>
              <input
                type="date"
                id="availableStartDate"
                value={data.availableStartDate ? data.availableStartDate.toISOString().split('T')[0] : ''}
                onChange={(e) => updateData({ 
                  availableStartDate: e.target.value ? new Date(e.target.value) : undefined 
                })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label>Work Preferences</Label>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="font-medium">Willing to Relocate</Label>
                    <p className="text-sm text-muted-foreground">
                      Are you open to relocating for this position?
                    </p>
                  </div>
                  <Switch
                    checked={data.willingToRelocate ?? false}
                    onCheckedChange={(checked) => updateData({ willingToRelocate: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredWorkType">Preferred Work Type</Label>
                  <Select
                    value={data.preferredWorkType || ''}
                    onValueChange={(value) => updateData({ preferredWorkType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select work type preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationSettingsStep;
