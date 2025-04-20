'use client';

import React, { useEffect, useState } from 'react';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/shadcn-ui/form';
import { Input } from '@/components/shadcn-ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/shadcn-ui/radio-group";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { JobType } from '@/types/job';

// Define form validation schema
const basicInfoSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters'),
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  department: z.string().optional(),
  location: z.object({
    type: z.enum(['remote', 'onsite', 'hybrid']),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
  }),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship']),
  experienceLevel: z.enum(['entry', 'mid', 'senior']),
});

type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;

interface BasicInfoFormProps {
  data: Partial<JobType>;
  onChange: (data: Partial<JobType>) => void;
  onValidityChange: (isValid: boolean) => void;
}

export function BasicInfoForm({ data, onChange, onValidityChange }: BasicInfoFormProps) {
  // Initialize the form with existing data
  const form = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      title: data.title || '',
      company: data.company || '',
      department: data.department || '',
      location: {
        type: data.location?.type || 'onsite',
        address: data.location?.address || '',
        city: data.location?.city || '',
        state: data.location?.state || '',
        country: data.location?.country || '',
        postalCode: data.location?.postalCode || '',
      },
      employmentType: data.employmentType || 'full-time',
      experienceLevel: data.experienceLevel || 'mid',
    },
    mode: 'onChange',
  });

  // Track form validity and update parent component
  const [showLocationFields, setShowLocationFields] = useState(
    data.location?.type !== 'remote'
  );

  // Update parent component when form values change
  const onSubmit = (values: BasicInfoFormValues) => {
    onChange(values);
  };

  // Update parent on form validity changes
  useEffect(() => {
    const subscription = form.watch(() => {
      // Get values and check if required fields are filled
      const values = form.getValues();
      const isValid = !!values.title && !!values.company &&
        !!values.location?.type && !!values.employmentType && !!values.experienceLevel;
      
      onValidityChange(isValid);
      
      // Auto-submit the form with current values
      onSubmit(values);
    });
    
    return () => subscription.unsubscribe();
  }, [form, onValidityChange, onChange]);

  // Handle location type change
  const handleLocationTypeChange = (value: string) => {
    setShowLocationFields(value !== 'remote');
    form.setValue('location.type', value as 'remote' | 'onsite' | 'hybrid');
    
    // Clear location fields if remote
    if (value === 'remote') {
      form.setValue('location.address', '');
      form.setValue('location.city', '');
      form.setValue('location.state', '');
      form.setValue('location.country', '');
      form.setValue('location.postalCode', '');
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        {/* Job Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g. Senior Software Engineer" {...field} />
              </FormControl>
              <FormDescription>
                Choose a clear and specific title that accurately describes the position
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Company */}
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g. Acme Corporation" {...field} />
              </FormControl>
              <FormDescription>
                Enter the company or organization name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Department */}
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Engineering, Marketing, HR" {...field} />
              </FormControl>
              <FormDescription>
                Specify the department or team (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Location Type */}
        <FormField
          control={form.control}
          name="location.type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Type <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={handleLocationTypeChange}
                  className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="onsite" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Onsite</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="remote" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Remote</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="hybrid" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Hybrid</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Location Address Fields (conditional) */}
        {showLocationFields && (
          <div className="space-y-6 border p-4 rounded-md">
            <h3 className="font-medium">Location Details</h3>
            
            {/* Address */}
            <FormField
              control={form.control}
              name="location.address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 123 Main Street" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* City and State */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="location.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. San Francisco" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. California" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Country and Postal Code */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="location.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. United States" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location.postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 94103" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}
        
        {/* Employment Type */}
        <FormField
          control={form.control}
          name="employmentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employment Type <span className="text-destructive">*</span></FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the type of employment for this position
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Experience Level */}
        <FormField
          control={form.control}
          name="experienceLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience Level <span className="text-destructive">*</span></FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Indicate the experience level required for this role
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
