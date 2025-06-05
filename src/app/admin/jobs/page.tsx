"use client";

import React from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { JobsListView } from "@/components/organisms/jobs/JobsListView";
import { Button } from "@/components/shadcn-ui/button";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminJobsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Jobs Management"
        description="Manage all job postings across the platform"
        actions={
          <Button
            onClick={() => router.push("/admin/jobs/create")}
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Create New Job
          </Button>
        }
      />

      <main className="flex-1 p-4 md:p-6">
        <JobsListView
          userRole="admin"
          apiEndpoint="/api/jobs"
          createUrl="/admin/jobs/create"
          viewBaseUrl="/admin/jobs"
          editBaseUrl="/admin/jobs"
        />
      </main>
    </div>
  );
}
