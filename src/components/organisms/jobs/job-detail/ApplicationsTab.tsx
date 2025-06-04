'use client';

import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/shadcn-ui/card";
import { Button } from "@/components/shadcn-ui/button";
import { Users } from 'lucide-react';

interface ApplicationsTabProps {
  jobId: string;
  applicationsCount: number;
  userRole?: 'admin' | 'subadmin'; // Add userRole prop
}

export function ApplicationsTab({ jobId, applicationsCount, userRole = 'admin' }: ApplicationsTabProps) {
  const router = useRouter();

  // Get role-based routes
  const getApplicationsRoute = () => {
    const prefix = userRole === 'admin' ? '/admin' : '/subadmin';
    return `${prefix}/applications?jobId=${jobId}`;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Applications</CardTitle>
        <CardDescription>
          All candidate applications for this job
        </CardDescription>
      </CardHeader>
      <CardContent>
        {applicationsCount > 0 ? (
          <div className="text-center py-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-medium">{applicationsCount} Applications</h3>
            <p className="text-muted-foreground mt-1 max-w-md mx-auto">
              This job has received {applicationsCount} applications. Review them to find the right candidate.
            </p>
            <Button className="mt-4" onClick={() => router.push(getApplicationsRoute())}>
              View All Applications
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No Applications Yet</h3>
            <p className="text-muted-foreground mt-1 max-w-md mx-auto">
              This job hasn&apos;t received any applications yet. Applications will appear here once candidates apply.
            </p>
            <Button className="mt-4" onClick={() => router.push(getApplicationsRoute())}>
              View Applications Page
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
