"use client";

import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import NotificationsPage from '@/app/admin/notifications/page';

export default function SubAdminNotificationsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="My Notifications"
        description="Stay updated with your assigned jobs and applications"
      />
      
      <main className="flex-1">
        <NotificationsPage />
      </main>
    </div>
  );
}
