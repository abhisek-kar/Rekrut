"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/shadcn-ui/card";
import { Skeleton } from "@/components/shadcn-ui/skeleton";

export default function AdminApplicationsPage() {
  const router = useRouter();
  
  // Redirect to the applications page
  useEffect(() => {
    router.push("/applications");
  }, [router]);
  
  // Show loading state while redirecting
  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <CardTitle>Applications Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <div className="text-center text-sm text-muted-foreground mt-2">
              Redirecting to Applications Management...
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
