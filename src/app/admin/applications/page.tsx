"use client";

import { useAuth } from "@/context/AuthContext";
import { ApplicationsListView } from "@/components/organisms/applications/ApplicationsListView";
import { PageHeader } from "@/components/shared/PageHeader";

export default function AdminApplicationsPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Applications Management"
        description="Review and manage all job applications across the platform"
      />

      <main className="flex-1 p-4 md:p-6">
        <ApplicationsListView userRole="admin" userId={user?.id} />
      </main>
    </div>
  );
}
