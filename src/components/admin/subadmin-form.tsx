"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Upload, Eye, EyeOff, RefreshCw } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";
import { Switch } from "@/components/shadcn-ui/switch";
import { Card, CardContent } from "@/components/shadcn-ui/card";
import { Checkbox } from "@/components/shadcn-ui/checkbox";
import { Separator } from "@/components/shadcn-ui/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-ui/avatar";

// Define the permissions
const availablePermissions = [
  { id: "job_create", label: "Create Jobs" },
  { id: "job_edit", label: "Edit Jobs" },
  { id: "job_delete", label: "Delete Jobs" },
  { id: "job_publish", label: "Publish Jobs" },
  { id: "candidate_view", label: "View Candidates" },
  { id: "candidate_create", label: "Create Candidates" },
  { id: "candidate_edit", label: "Edit Candidates" },
  { id: "application_view", label: "View Applications" },
  { id: "application_process", label: "Process Applications" },
  { id: "interview_schedule", label: "Schedule Interviews" },
];

// Form validation schema
const subadminFormSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .optional(),
  status: z.enum(["active", "inactive"]),
  sendSetupEmail: z.boolean().default(true),
  permissions: z.array(z.string()),
  profilePhoto: z.any().optional(), // File upload handling
});

// Types for the form values
export type SubadminFormValues = z.infer<typeof subadminFormSchema>;

// Function to generate a strong password
function generateStrongPassword(length = 12) {
  const uppercaseChars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercaseChars = "abcdefghijkmnopqrstuvwxyz";
  const numberChars = "23456789";
  const specialChars = "!@#$%^&*_-+=";

  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;

  // Ensure at least one of each character type
  let password =
    uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length)) +
    lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length)) +
    numberChars.charAt(Math.floor(Math.random() * numberChars.length)) +
    specialChars.charAt(Math.floor(Math.random() * specialChars.length));

  // Fill the rest of the password
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
}

// SubAdmin form props
interface SubadminFormProps {
  initialData?: Partial<SubadminFormValues>;
  isEditing?: boolean;
  onSuccess?: (data: any) => void;
}

export function SubadminForm({
  initialData,
  isEditing = false,
  onSuccess,
}: SubadminFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(
    (initialData?.profilePhoto as string) || null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [selectAllPermissions, setSelectAllPermissions] = useState(false);

  // Initialize form with default values or provided data
  const form = useForm<SubadminFormValues>({
    resolver: zodResolver(subadminFormSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      password: "",
      status: initialData?.status || "active",
      sendSetupEmail:
        initialData?.sendSetupEmail !== undefined
          ? initialData.sendSetupEmail
          : true,
      permissions: initialData?.permissions || [],
      profilePhoto: undefined,
    },
  });

  // Effect to handle "select all permissions" checkbox
  useEffect(() => {
    const permissions = form.watch("permissions");
    setSelectAllPermissions(
      permissions.length === availablePermissions.length &&
        availablePermissions.every((p) => permissions.includes(p.id))
    );
  }, [form.watch("permissions")]);

  // Handler for "select all permissions" checkbox
  const handleSelectAllPermissions = (checked: boolean) => {
    if (checked) {
      form.setValue(
        "permissions",
        availablePermissions.map((p) => p.id)
      );
    } else {
      form.setValue("permissions", []);
    }
    setSelectAllPermissions(checked);
  };

  // Handle password generation
  const handleGeneratePassword = () => {
    const newPassword = generateStrongPassword();
    form.setValue("password", newPassword);
    toast.success("Strong password generated");
  };

  // Handle form submission
  const onSubmit = async (data: SubadminFormValues) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Append all text fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "profilePhoto" && key !== "permissions") {
          formData.append(key, String(value));
        }
      });

      // Append permissions as JSON
      formData.append("permissions", JSON.stringify(data.permissions));

      // Append profile photo if it exists
      if (data.profilePhoto && data.profilePhoto instanceof File) {
        formData.append("profilePhoto", data.profilePhoto);
      }

      // Determine API endpoint and method
      const url = isEditing
        ? `/api/users/subadmins/${initialData?.id}`
        : "/api/users/subadmins";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      const result = await response.json();

      toast.success(
        isEditing
          ? "SubAdmin updated successfully"
          : "SubAdmin created successfully"
      );

      if (onSuccess) {
        onSuccess(result);
      } else {
        router.push("/admin/users");
        router.refresh();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save SubAdmin"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle profile photo change
  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      form.setValue("profilePhoto", file);

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
        <div className="grid gap-6 md:grid-cols-2">
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
                        {form.watch("firstName")?.[0]}
                        {form.watch("lastName")?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                      onClick={() =>
                        document.getElementById("profile-photo-input")?.click()
                      }
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
                          disabled={isEditing}
                        />
                      </FormControl>
                      {isEditing && (
                        <FormDescription>
                          Email address cannot be changed
                        </FormDescription>
                      )}
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
                        <Input
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isEditing && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <FormControl>
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...field}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-shrink-0"
                            onClick={handleGeneratePassword}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Generate
                          </Button>
                        </div>
                        <FormDescription>
                          Leave blank to generate a secure password and send
                          setup email
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Access Settings</h3>
                <Separator />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Inactive accounts cannot log in to the system
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isEditing && (
                  <FormField
                    control={form.control}
                    name="sendSetupEmail"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Send Setup Email
                          </FormLabel>
                          <FormDescription>
                            Send an email with account setup instructions
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
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel>Permissions</FormLabel>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="selectAll"
                        checked={selectAllPermissions}
                        onCheckedChange={handleSelectAllPermissions}
                      />
                      <label
                        htmlFor="selectAll"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Select All
                      </label>
                    </div>
                  </div>
                  <FormDescription>
                    Select the permissions for this SubAdmin
                  </FormDescription>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {availablePermissions.map((permission) => (
                      <FormField
                        key={permission.id}
                        control={form.control}
                        name="permissions"
                        render={({ field }) => (
                          <FormItem
                            key={permission.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(permission.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...field.value,
                                        permission.id,
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== permission.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {permission.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/users")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{isEditing ? "Update SubAdmin" : "Create SubAdmin"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
