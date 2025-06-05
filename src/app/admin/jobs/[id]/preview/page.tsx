"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { useParams } from "next/navigation";
import React from "react";

export default function JobPreviewPage() {
  const [jobDetails, setJobDetails] = React.useState<any>(null);

  const params = useParams();
  const jobId = params.id as string;

  const getBreadcrumbContext = () => {
    const baseContext = {
      [jobId]: jobDetails?.title || "Job Details",
      edit: "Edit Job",
    };

    return {
      admin: "Admin",
      jobs: "Jobs Management",
      ...baseContext,
    };
  };
  return (
    <div className="min-h-screen flex flex-col ">
      <PageHeader
        title="Job Preview"
        description="Preview the job details before publishing."
        breadcrumbContext={getBreadcrumbContext()}
      />
    </div>
  );
}
