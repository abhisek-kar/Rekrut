"use client";

import { useParams } from "next/navigation";
import SharedJobEdit from "@/components/organisms/jobs/shared-job-edit";

export default function SubAdminEditJobPage() {
  const params = useParams();
  const jobId = params.id as string;

  return <SharedJobEdit jobId={jobId} userRole="subadmin" />;
}