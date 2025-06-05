"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn-ui/button";
import { PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { JobsListView } from "@/components/organisms/jobs/JobsListView";

export default function SubAdminJobsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="My Assigned Jobs"
        description="Manage and track your assigned job postings"
        actions={
          <Button
            onClick={() => router.push("/subadmin/jobs/create")}
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Create New Job
          </Button>
        }
      />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <JobsListView
          userRole="subadmin"
          apiEndpoint="/api/subadmin/jobs"
          createUrl="/subadmin/jobs/create"
          viewBaseUrl="/subadmin/jobs"
          editBaseUrl="/subadmin/jobs"
        />
      </main>
    </div>
  );
}
