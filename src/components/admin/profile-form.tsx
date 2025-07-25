"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { ButtonLoader } from "@/components/atoms/loader";

import { Button } from "@/components/shadcn-ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn-ui/form";
import { Input } from "@/components/shadcn-ui/input";
import { Card, CardContent } from "@/components/shadcn-ui/card";
import { Separator } from "@/components/shadcn-ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn-ui/avatar";
import { useAuth } from "@/hooks/useAuth";

// Profile form validation schema
const profileFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }).optional(),
  phone: z.string().optional(),
  profilePhoto: z.any().optional(), // File upload handling
});

// Types for the form values
export type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Helper function to get initials
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function ProfileForm() {
  const { user, refreshSession } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(
    user?.profilePhoto || null
  );

  // Initialize form with user data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email,
      phone: user?.phone || "",
      profilePhoto: undefined,
    },
  });

  // Handle form submission
  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      
      // Append all text fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'profilePhoto' && key !== 'email' && value) {
          formData.append(key, String(value));
        }
      });
      
      // Append profile photo if it exists
      if (data.profilePhoto && data.profilePhoto instanceof File) {
        formData.append('profilePhoto', data.profilePhoto);
      }

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }

      await refreshSession();
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle profile photo change
  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      form.setValue('profilePhoto', file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <Separator />

              <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profilePhotoPreview || ""} />
                    <AvatarFallback className="text-lg">
                      {getInitials(`${form.watch("firstName")} ${form.watch("lastName")}`)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                    onClick={() => document.getElementById('profile-photo-input')?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <input
                  id="profile-photo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePhotoChange}
                />
                <p className="text-sm text-muted-foreground">
                  Upload a profile photo (optional)
                </p>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="john.doe@example.com" 
                        {...field} 
                        disabled={true}
                      />
                    </FormControl>
                    <FormDescription>
                      Email address cannot be changed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <ButtonLoader size="sm" />
                Updating...
              </>
            ) : (
              "Update Profile"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
