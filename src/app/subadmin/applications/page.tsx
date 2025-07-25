"use client";

import { useAuth } from "@/hooks/useAuth";
import { ApplicationsListView } from "@/components/organisms/applications/ApplicationsListView";
import { PageHeader } from "@/components/shared/PageHeader";

export default function SubAdminApplicationsPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Applications Management"
        description="Review and manage applications for your assigned jobs"
      />

      <main className="flex-1 p-4 md:p-6">
        <ApplicationsListView userRole="subadmin" userId={user?.id} />
      </main>
    </div>
  );
}
