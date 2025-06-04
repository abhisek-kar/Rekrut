import { PageHeader } from "@/components/shared/PageHeader";
import React from "react";

export default function JobPreviewPage() {
  return (
    <div className="min-h-screen flex flex-col ">
      <PageHeader
        title="Job Preview"
        description="Preview the job details before publishing."
      />
    </div>
  );
}
