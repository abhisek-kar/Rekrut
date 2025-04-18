import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/shadcn-ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/shadcn-ui/form';
import { Input } from '@/components/shadcn-ui/input';
import { Textarea } from '@/components/shadcn-ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn-ui/select';
import { Switch } from '@/components/shadcn-ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/shadcn-ui/card';

const emailSettingsSchema = z.object({
  senderName: z.string().min(2, { message: 'Sender name is required' }),
  senderEmail: z.string().email({ message: 'Invalid email address' }),
  smtpHost: z.string().min(1, { message: 'SMTP host is required' }),
  smtpPort: z.coerce.number().positive({ message: 'SMTP port must be a positive number' }),
  smtpUser: z.string().min(1, { message: 'SMTP username is required' }),
  smtpPassword: z.string().min(1, { message: 'SMTP password is required' }),
  smtpSecure: z.boolean().default(true),
  emailSignature: z.string().optional(),
  applicationConfirmationEnabled: z.boolean().default(true),
  statusChangeNotificationEnabled: z.boolean().default(true),
  interviewScheduleEnabled: z.boolean().default(true),
  rejectionEnabled: z.boolean().default(true),
  offerEnabled: z.boolean().default(true),
});

type EmailSettingsFormValues = z.infer<typeof emailSettingsSchema>;

interface EmailSettingsProps {
  initialData: any;
  onSave: (data: EmailSettingsFormValues) => Promise<void>;
  onTestEmail: () => Promise<void>;
  isLoading: boolean;
}

export function EmailSettings({ initialData, onSave, onTestEmail, isLoading }: EmailSettingsProps) {
  const form = useForm<EmailSettingsFormValues>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      senderName: initialData?.senderName || '',
      senderEmail: initialData?.senderEmail || '',
      smtpHost: initialData?.smtpHost || '',
      smtpPort: initialData?.smtpPort || 587,
      smtpUser: initialData?.smtpUser || '',
      smtpPassword: initialData?.smtpPassword || '',
      smtpSecure: initialData?.smtpSecure !== undefined ? initialData.smtpSecure : true,
      emailSignature: initialData?.emailSignature || '',
      applicationConfirmationEnabled: initialData?.applicationConfirmationEnabled !== undefined
        ? initialData.applicationConfirmationEnabled : true,
      statusChangeNotificationEnabled: initialData?.statusChangeNotificationEnabled !== undefined
        ? initialData.statusChangeNotificationEnabled : true,
      interviewScheduleEnabled: initialData?.interviewScheduleEnabled !== undefined
        ? initialData.interviewScheduleEnabled : true,
      rejectionEnabled: initialData?.rejectionEnabled !== undefined
        ? initialData.rejectionEnabled : true,
      offerEnabled: initialData?.offerEnabled !== undefined
        ? initialData.offerEnabled : true,
    },
  });

  const onSubmit = async (data: EmailSettingsFormValues) => {
    try {
      await onSave(data);
    } catch (error) {
      console.error('Error saving email settings:', error);
    }
  };

  const handleTestEmail = async () => {
    try {
      await onTestEmail();
    } catch (error) {
      console.error('Error sending test email:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Configuration</CardTitle>
        <CardDescription>
          Configure your email server settings and notification preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">SMTP Configuration</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="senderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sender Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Company Recruitment" {...field} />
                      </FormControl>
                      <FormDescription>
                        The name that will appear in the "From" field
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="senderEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sender Email</FormLabel>
                      <FormControl>
                        <Input placeholder="recruitment@example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        The email address that will be used to send emails
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smtpHost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Host</FormLabel>
                      <FormControl>
                        <Input placeholder="smtp.example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smtpPort"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Port</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="587" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smtpUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Username</FormLabel>
                      <FormControl>
                        <Input placeholder="username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smtpPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smtpSecure"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Use Secure Connection (TLS)</FormLabel>
                        <FormDescription>
                          Enable TLS encryption for sending emails
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Email Content</h3>
              <FormField
                control={form.control}
                name="emailSignature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Signature</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Best regards,\nYour Company Recruitment Team"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This signature will be added to all outgoing emails
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Email Notifications</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="applicationConfirmationEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Application Confirmation</FormLabel>
                        <FormDescription>
                          Send confirmation emails when candidates apply
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="statusChangeNotificationEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Status Change Notifications</FormLabel>
                        <FormDescription>
                          Notify candidates when their application status changes
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="interviewScheduleEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Interview Scheduling</FormLabel>
                        <FormDescription>
                          Send interview invitations and reminders
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="rejectionEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Rejection Notifications</FormLabel>
                        <FormDescription>
                          Send emails to rejected candidates
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="offerEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Offer Notifications</FormLabel>
                        <FormDescription>
                          Send job offer emails to candidates
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Settings'}
              </Button>
              <Button type="button" variant="outline" onClick={handleTestEmail} disabled={isLoading}>
                Send Test Email
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
