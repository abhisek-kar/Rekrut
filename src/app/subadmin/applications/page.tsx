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

export default function SubadminApplicationsPage() {
  const router = useRouter();
  
  // Redirect to the applications page with filter for subadmin assigned jobs
  useEffect(() => {
    router.push("/applications?assigned=true");
  }, [router]);
  
  // Show loading state while redirecting
  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <CardTitle>My Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <SectionLoader message="Redirecting to Applications Management..." height="200px" />
        </CardContent>
      </Card>
    </div>
  );
}
