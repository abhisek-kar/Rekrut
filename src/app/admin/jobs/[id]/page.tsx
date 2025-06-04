"use client";

import { useParams } from "next/navigation";
import SharedJobView from "@/components/organisms/jobs/shared-job-view";

export default function AdminJobDetailsPage() {
  const params = useParams();
  const jobId = params.id as string;

  return <SharedJobView jobId={jobId} userRole="admin" />;
}
