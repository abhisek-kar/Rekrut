"use client";

import SharedJobForm from "@/components/organisms/jobs/shared-job-form";

export default function SubAdminCreateJobPage() {
  return (
    <SharedJobForm
      userRole="subadmin"
      initialLocationMode="remote"
      redirectPath="/subadmin/jobs"
      breadcrumbContext={{
        'subadmin': 'SubAdmin',
        'jobs': 'Jobs',
        'create': 'Create New Job'
      }}
    />
  );
}