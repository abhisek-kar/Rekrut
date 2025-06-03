"use client";

import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn-ui/tabs";
import { ProfileForm } from "@/components/admin/profile-form";
import { PasswordForm } from "@/components/admin/password-form";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/shared/PageHeader";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Profile Settings"
        description=" Manage your personal information and security settings"
      />
      <main className="flex-1 p-6">
        <div className="flex flex-col gap-6">
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="space-y-6">
              <ProfileForm />
            </TabsContent>
            <TabsContent value="security" className="space-y-6">
              <PasswordForm />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
