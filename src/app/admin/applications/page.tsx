"use client";

import { useAuth } from "@/context/AuthContext";
import { ApplicationsListView } from "@/components/organisms/applications/ApplicationsListView";

export default function AdminApplicationsPage() {
  const { user } = useAuth();

  return <ApplicationsListView userRole="admin" userId={user?.id} />;
}
