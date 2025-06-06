"use client";

import React from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { NotificationCenter } from "@/components/organisms/notifications/NotificationCenter";

export default function SubAdminNotificationsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Notifications"
        description="Stay updated with job assignments and application activities"
      />

      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <NotificationCenter variant="page" />
        </div>
      </main>
    </div>
  );
}
