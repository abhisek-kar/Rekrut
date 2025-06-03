"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/shadcn-ui/card";
import { SectionLoader } from "@/components/atoms/loader";

export default function SubAdminJobsPage() {
  const router = useRouter();
  
  // Redirect to the assigned jobs API endpoint
  useEffect(() => {
    // For SubAdmins, we specifically want to show only their assigned jobs
    // We'll redirect to the main jobs page but will ensure the jobs
    // displayed are only those assigned to the current SubAdmin
    router.push("/jobs?assigned=true");
  }, [router]);
  
  // Show loading state while redirecting
  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <CardTitle>My Assigned Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <SectionLoader message="Redirecting to Assigned Jobs..." height="200px" />
        </CardContent>
      </Card>
    </div>
  );
}
