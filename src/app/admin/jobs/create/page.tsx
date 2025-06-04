"use client";

import SharedJobForm from "@/components/organisms/jobs/shared-job-form";

export default function AdminCreateJobPage() {
  return (
    <SharedJobForm
      userRole="admin"
      initialLocationMode="remote"
      redirectPath="/admin/jobs"
      breadcrumbContext={{
        'admin': 'Admin',
        'jobs': 'Jobs',
        'create': 'Create New Job'
      }}
    />
  );
}