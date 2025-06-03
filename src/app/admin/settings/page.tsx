"use client";

import React, { useState, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn-ui/tabs";

import { toast } from "sonner";
import { GeneralSettings } from "@/components/admin/settings/general-settings";
import { EmailSettings } from "@/components/admin/settings/email-settings";
import {
  CustomFieldsManager,
  CustomField,
} from "@/components/admin/settings/custom-fields-manager";
import { PageHeader } from "@/components/shared/PageHeader";

// Types
interface GeneralSettings {
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyWebsite?: string;
  companyAddress?: string;
  jobBoardTitle?: string;
  jobBoardDescription?: string;
  defaultLanguage?: string;
  defaultCurrency?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
}

interface EmailSettings {
  senderName?: string;
  senderEmail?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  emailSignature?: string;
  applicationConfirmationEnabled?: boolean;
  statusChangeNotificationEnabled?: boolean;
  interviewScheduleEnabled?: boolean;
  rejectionEnabled?: boolean;
  offerEnabled?: boolean;
}

// Sample data for testing when API fails
const sampleGeneralSettings = {
  companyName: "Rekrut ATS",
  companyEmail: "contact@rekrut.com",
  companyPhone: "+1 (555) 123-4567",
  companyWebsite: "https://rekrut.example.com",
  companyAddress: "123 Recruitment Street, HR City, 12345",
  jobBoardTitle: "Careers at Rekrut",
  jobBoardDescription:
    "Find your dream job through our specialized recruitment platform",
  defaultLanguage: "en",
  defaultCurrency: "USD",
  timezone: "America/New_York",
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12h",
};

const sampleEmailSettings = {
  senderName: "Rekrut Recruitment",
  senderEmail: "recruitment@rekrut.com",
  smtpHost: "smtp.example.com",
  smtpPort: 587,
  smtpUser: "rekrut_mail",
  smtpPassword: "********",
  smtpSecure: true,
  emailSignature: "Best regards,\nThe Rekrut Team\nwww.rekrut.example.com",
  applicationConfirmationEnabled: true,
  statusChangeNotificationEnabled: true,
  interviewScheduleEnabled: true,
  rejectionEnabled: true,
  offerEnabled: true,
};

const sampleCustomFields: CustomField[] = [
  {
    _id: "1",
    name: "experience_years",
    label: "Years of Experience",
    type: "text",
    entity: "candidate",
    placeholder: "Enter years of experience",
    helpText: "Total number of years in this profession",
    validation: { required: true },
    isVisible: true,
    visibleTo: ["admin", "subadmin"],
    order: 0,
    createdBy: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "2",
    name: "remote_preference",
    label: "Remote Work Preference",
    type: "select",
    entity: "job",
    options: [
      { value: "remote", label: "Fully Remote" },
      { value: "hybrid", label: "Hybrid" },
      { value: "onsite", label: "On-site" },
    ],
    validation: { required: false },
    isVisible: true,
    visibleTo: ["admin", "subadmin", "candidate"],
    order: 1,
    createdBy: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(true);
  const [generalSettings, setGeneralSettings] =
    useState<GeneralSettings | null>(null);
  const [emailSettings, setEmailSettings] = useState<EmailSettings | null>(
    null
  );
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  // Fetch general settings
  useEffect(() => {
    const fetchGeneralSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/settings?category=general");

        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Authentication error. Please log in again.");
            // Use sample data for development
            setGeneralSettings(sampleGeneralSettings);
            return;
          }
          throw new Error("Failed to fetch general settings");
        }

        const data = await response.json();
        setGeneralSettings(data.settings?.general || {});
      } catch (error) {
        console.error("Error fetching general settings:", error);
        toast.error("Failed to load general settings");
        // Use sample data for development
        setGeneralSettings(sampleGeneralSettings);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === "general") {
      fetchGeneralSettings();
    }
  }, [activeTab]);

  // Fetch email settings
  useEffect(() => {
    const fetchEmailSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/settings?category=email");

        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Authentication error. Please log in again.");
            // Use sample data for development
            setEmailSettings(sampleEmailSettings);
            return;
          }
          throw new Error("Failed to fetch email settings");
        }

        const data = await response.json();
        setEmailSettings(data.settings?.email || {});
      } catch (error) {
        console.error("Error fetching email settings:", error);
        toast.error("Failed to load email settings");
        // Use sample data for development
        setEmailSettings(sampleEmailSettings);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === "email") {
      fetchEmailSettings();
    }
  }, [activeTab]);

  // Fetch custom fields
  useEffect(() => {
    const fetchCustomFields = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/custom-fields");

        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Authentication error. Please log in again.");
            // Use sample data for development
            setCustomFields(sampleCustomFields);
            return;
          }
          throw new Error("Failed to fetch custom fields");
        }

        const data = await response.json();
        setCustomFields(data.fields || []);
      } catch (error) {
        console.error("Error fetching custom fields:", error);
        toast.error("Failed to load custom fields");
        // Use sample data for development
        setCustomFields(sampleCustomFields);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === "custom-fields") {
      fetchCustomFields();
    }
  }, [activeTab]);

  // Save general settings
  const handleSaveGeneralSettings = async (data: GeneralSettings) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: "general",
          settings: data,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save general settings");
      }

      setGeneralSettings(data);
      toast.success("General settings updated successfully");
    } catch (error) {
      console.error("Error saving general settings:", error);
      toast.error("Failed to save general settings");
    } finally {
      setIsLoading(false);
    }
  };

  // Save email settings
  const handleSaveEmailSettings = async (data: EmailSettings) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: "email",
          settings: data,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save email settings");
      }

      setEmailSettings(data);
      toast.success("Email settings updated successfully");
    } catch (error) {
      console.error("Error saving email settings:", error);
      toast.error("Failed to save email settings");
    } finally {
      setIsLoading(false);
    }
  };

  // Send test email
  const handleSendTestEmail = async () => {
    try {
      toast.info("Sending test email...");
      const response = await fetch("/api/admin/settings/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error("Failed to send test email");
      }

      toast.success("Test email sent successfully");
    } catch (error) {
      console.error("Error sending test email:", error);
      toast.error("Failed to send test email");
    }
  };

  // Add custom field
  const handleAddCustomField = async (field: Omit<CustomField, "_id">) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/custom-fields", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(field),
      });

      if (!response.ok) {
        throw new Error("Failed to add custom field");
      }

      const data = await response.json();
      setCustomFields([...customFields, data.field]);
      toast.success("Custom field added successfully");
    } catch (error) {
      console.error("Error adding custom field:", error);
      toast.error("Failed to add custom field");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit custom field
  const handleEditCustomField = async (
    id: string,
    field: Partial<CustomField>
  ) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/custom-fields/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(field),
      });

      if (!response.ok) {
        throw new Error("Failed to update custom field");
      }

      const data = await response.json();
      setCustomFields(customFields.map((f) => (f._id === id ? data.field : f)));
      toast.success("Custom field updated successfully");
    } catch (error) {
      console.error("Error updating custom field:", error);
      toast.error("Failed to update custom field");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete custom field
  const handleDeleteCustomField = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/custom-fields/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete custom field");
      }

      setCustomFields(customFields.filter((f) => f._id !== id));
      toast.success("Custom field deleted successfully");
    } catch (error) {
      console.error("Error deleting custom field:", error);
      toast.error("Failed to delete custom field");
    } finally {
      setIsLoading(false);
    }
  };

  // Reorder custom field
  const handleReorderCustomField = async (
    id: string,
    direction: "up" | "down"
  ) => {
    try {
      // Find the current field and its index
      const fieldIndex = customFields.findIndex((f) => f._id === id);
      if (fieldIndex === -1) return;

      const field = customFields[fieldIndex];

      // Find the field to swap with
      const swapIndex = direction === "up" ? fieldIndex - 1 : fieldIndex + 1;
      if (swapIndex < 0 || swapIndex >= customFields.length) return;

      const swapField = customFields[swapIndex];

      // Update orders
      const newOrder = swapField.order;
      const swapOrder = field.order;

      // Update both fields
      await Promise.all([
        handleEditCustomField(id, { order: newOrder }),
        handleEditCustomField(swapField._id, { order: swapOrder }),
      ]);

      // Update local state to show reordering immediately
      const updatedFields = [...customFields];
      updatedFields[fieldIndex].order = newOrder;
      updatedFields[swapIndex].order = swapOrder;
      updatedFields.sort((a, b) => a.order - b.order);

      setCustomFields(updatedFields);
      toast.success("Field order updated");
    } catch (error) {
      console.error("Error reordering custom field:", error);
      toast.error("Failed to reorder field");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="System Settings"
        description="Configure your application's global settings and preferences"
      />

      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col gap-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-1 md:grid-cols-3 h-auto">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="custom-fields">Custom Fields</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <GeneralSettings
                initialData={generalSettings}
                onSave={handleSaveGeneralSettings}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="email" className="space-y-6">
              <EmailSettings
                initialData={emailSettings ?? {}}
                onSave={handleSaveEmailSettings}
                onTestEmail={handleSendTestEmail}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="custom-fields" className="space-y-6">
              <CustomFieldsManager
                fields={customFields}
                loading={isLoading}
                onAddField={handleAddCustomField}
                onEditField={handleEditCustomField}
                onDeleteField={handleDeleteCustomField}
                onReorderField={handleReorderCustomField}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
