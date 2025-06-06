import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import { Label } from '@/components/shadcn-ui/label';
import { Checkbox } from '@/components/shadcn-ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn-ui/select';
import { ApplicationData } from '../MultiStepApplicationForm';
import { MapPin } from 'lucide-react';

interface AddressInfoStepProps {
  data: ApplicationData;
  updateData: (updates: Partial<ApplicationData>) => void;
}

const countries = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'Germany',
  'France',
  'India',
  'Singapore',
  'Netherlands',
  'Sweden',
  'Other'
];

const AddressInfoStep: React.FC<AddressInfoStepProps> = ({ data, updateData }) => {
  const handleCurrentAddressChange = (field: string, value: string) => {
    updateData({
      currentAddress: {
        ...data.currentAddress,
        [field]: value,
      } as ApplicationData['currentAddress'],
    });
  };

  const handlePermanentAddressChange = (field: string, value: string) => {
    updateData({
      permanentAddress: {
        ...data.permanentAddress,
        [field]: value,
      } as ApplicationData['permanentAddress'],
    });
  };

  const handleSameAsPermanentChange = (checked: boolean) => {
    updateData({ 
      isSameAsPermanent: checked,
      permanentAddress: checked ? data.currentAddress : data.permanentAddress
    });
  };

  const isValid = 
    data.currentAddress?.street && 
    data.currentAddress?.city && 
    data.currentAddress?.country &&
    data.preferredLocation;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Information
          </CardTitle>
          <CardDescription>
            Please provide your current and permanent address details, along with your preferred work location.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Current Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Current Address</h3>
              
              <div className="space-y-2">
                <Label htmlFor="currentStreet">
                  Street Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="currentStreet"
                  value={data.currentAddress?.street || ''}
                  onChange={(e) => handleCurrentAddressChange('street', e.target.value)}
                  placeholder="Enter your street address"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentCity">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="currentCity"
                    value={data.currentAddress?.city || ''}
                    onChange={(e) => handleCurrentAddressChange('city', e.target.value)}
                    placeholder="Enter your city"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentState">State/Province</Label>
                  <Input
                    id="currentState"
                    value={data.currentAddress?.state || ''}
                    onChange={(e) => handleCurrentAddressChange('state', e.target.value)}
                    placeholder="Enter your state/province"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPostalCode">Postal Code</Label>
                  <Input
                    id="currentPostalCode"
                    value={data.currentAddress?.postalCode || ''}
                    onChange={(e) => handleCurrentAddressChange('postalCode', e.target.value)}
                    placeholder="Enter your postal code"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentCountry">
                    Country <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={data.currentAddress?.country || ''}
                    onValueChange={(value) => handleCurrentAddressChange('country', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Same as Current Address Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sameAsPermanent"
                checked={data.isSameAsPermanent || false}
                onCheckedChange={handleSameAsPermanentChange}
              />
              <Label htmlFor="sameAsPermanent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Permanent address is same as current address
              </Label>
            </div>

            {/* Permanent Address */}
            {!data.isSameAsPermanent && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Permanent Address</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="permanentStreet">Street Address</Label>
                  <Input
                    id="permanentStreet"
                    value={data.permanentAddress?.street || ''}
                    onChange={(e) => handlePermanentAddressChange('street', e.target.value)}
                    placeholder="Enter your permanent street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="permanentCity">City</Label>
                    <Input
                      id="permanentCity"
                      value={data.permanentAddress?.city || ''}
                      onChange={(e) => handlePermanentAddressChange('city', e.target.value)}
                      placeholder="Enter your city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="permanentState">State/Province</Label>
                    <Input
                      id="permanentState"
                      value={data.permanentAddress?.state || ''}
                      onChange={(e) => handlePermanentAddressChange('state', e.target.value)}
                      placeholder="Enter your state/province"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="permanentPostalCode">Postal Code</Label>
                    <Input
                      id="permanentPostalCode"
                      value={data.permanentAddress?.postalCode || ''}
                      onChange={(e) => handlePermanentAddressChange('postalCode', e.target.value)}
                      placeholder="Enter your postal code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="permanentCountry">Country</Label>
                    <Select
                      value={data.permanentAddress?.country || ''}
                      onValueChange={(value) => handlePermanentAddressChange('country', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Preferred Location */}
            <div className="space-y-2">
              <Label htmlFor="preferredLocation">
                Preferred Work Location <span className="text-destructive">*</span>
              </Label>
              <Input
                id="preferredLocation"
                value={data.preferredLocation || ''}
                onChange={(e) => updateData({ preferredLocation: e.target.value })}
                placeholder="e.g., New York, San Francisco, Remote, Flexible"
                required
              />
              <p className="text-xs text-muted-foreground">
                Specify your preferred city/region for work, or mention if you prefer remote work
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddressInfoStep;
