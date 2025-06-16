"use client";

import { useAuth } from "@/context/AuthContext";
import { ApplicationsListView } from "@/components/organisms/applications/ApplicationsListView";

export default function SubAdminApplicationsPage() {
  const { user } = useAuth();

  return <ApplicationsListView userRole="subadmin" userId={user?.id} />;
}
