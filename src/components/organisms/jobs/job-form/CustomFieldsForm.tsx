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
import { Button } from '@/components/shadcn-ui/button';
import { Textarea } from '@/components/shadcn-ui/textarea';
import { Checkbox } from '@/components/shadcn-ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/shadcn-ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { JobType } from '@/types/job';
import { Info, Loader2 } from 'lucide-react';

// We'll build this schema dynamically based on the custom fields
const customFieldsSchema = z.object({
  customFields: z.record(z.any()),
});

type CustomFieldsFormValues = z.infer<typeof customFieldsSchema>;

interface CustomFieldDefinition {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'date' | 'number';
  required: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
  entity: 'job' | 'candidate' | 'application';
}

interface CustomFieldsFormProps {
  data: Partial<JobType>;
  onChange: (data: Partial<JobType>) => void;
  onValidityChange: (isValid: boolean) => void;
}

export function CustomFieldsForm({ data, onChange, onValidityChange }: CustomFieldsFormProps) {
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Initialize the form with existing data
  const form = useForm<CustomFieldsFormValues>({
    resolver: zodResolver(customFieldsSchema),
    defaultValues: {
      customFields: data.customFields || {},
    },
    mode: 'onChange',
  });

  // Fetch custom field definitions when component mounts
  useEffect(() => {
    const fetchCustomFields = async () => {
      setLoading(true);
      try {
        // Fetch custom fields for jobs
        const response = await fetch('/api/custom-fields/entities/job');
        if (!response.ok) {
          throw new Error('Failed to fetch custom fields');
        }
        
        const data = await response.json();
        setCustomFields(data.fields || []);
        
        // This form is always valid
        onValidityChange(true);
      } catch (error) {
        console.error('Error fetching custom fields:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomFields();
  }, [onValidityChange]);

  // Update parent component when form values change
  const onSubmit = (values: CustomFieldsFormValues) => {
    onChange(values);
  };

  // Update parent when values change
  useEffect(() => {
    const subscription = form.watch(() => {
      // Auto-submit the form with current values
      onSubmit(form.getValues());
    });
    
    return () => subscription.unsubscribe();
  }, [form, onChange]);

  // Render a custom field based on its type
  const renderCustomField = (field: CustomFieldDefinition) => {
    switch (field.type) {
      case 'text':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={`customFields.${field.name}`}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder={field.placeholder || ''} 
                    {...formField}
                    value={formField.value || ''}
                  />
                </FormControl>
                {field.helpText && (
                  <FormDescription>{field.helpText}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case 'textarea':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={`customFields.${field.name}`}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder={field.placeholder || ''} 
                    className="min-h-20"
                    {...formField}
                    value={formField.value || ''}
                  />
                </FormControl>
                {field.helpText && (
                  <FormDescription>{field.helpText}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case 'select':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={`customFields.${field.name}`}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <Select
                  value={formField.value || ''}
                  onValueChange={formField.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.helpText && (
                  <FormDescription>{field.helpText}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case 'checkbox':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={`customFields.${field.name}`}
            render={({ field: formField }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={!!formField.value}
                    onCheckedChange={formField.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </FormLabel>
                  {field.helpText && (
                    <FormDescription>{field.helpText}</FormDescription>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case 'radio':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={`customFields.${field.name}`}
            render={({ field: formField }) => (
              <FormItem className="space-y-3">
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={formField.onChange}
                    defaultValue={formField.value}
                    className="flex flex-col space-y-1"
                  >
                    {field.options?.map((option) => (
                      <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={option} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {option}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                {field.helpText && (
                  <FormDescription>{field.helpText}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case 'date':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={`customFields.${field.name}`}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input 
                    type="date"
                    {...formField}
                    value={formField.value || ''}
                  />
                </FormControl>
                {field.helpText && (
                  <FormDescription>{field.helpText}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case 'number':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={`customFields.${field.name}`}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    placeholder={field.placeholder || ''} 
                    {...formField}
                    value={formField.value || ''}
                  />
                </FormControl>
                {field.helpText && (
                  <FormDescription>{field.helpText}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Loading custom fields...</p>
          </div>
        ) : customFields.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Info className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No Custom Fields</h3>
              <p className="text-center text-muted-foreground mt-1 max-w-md">
                No custom fields have been configured for jobs. Custom fields can be
                added by an administrator in the settings area.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {customFields.map((field) => renderCustomField(field))}
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}
