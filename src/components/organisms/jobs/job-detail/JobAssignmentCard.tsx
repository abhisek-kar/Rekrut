'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Button } from "@/components/shadcn-ui/button";
import { UserCheck, UserPlus } from "lucide-react";

interface Recruiter {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface JobAssignmentCardProps {
  assignedRecruiter?: Recruiter | null;
  onAssignRecruiter?: () => void;
  userRole : "admin" | "subadmin";
}

export function JobAssignmentCard({ 
  assignedRecruiter, 
  onAssignRecruiter 
}: JobAssignmentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        {assignedRecruiter ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{assignedRecruiter.firstName} {assignedRecruiter.lastName}</p>
                <p className="text-sm text-muted-foreground">{assignedRecruiter.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={onAssignRecruiter}>
              Change
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">No recruiter assigned to this job yet.</p>
            <Button onClick={onAssignRecruiter}>
              <UserPlus className="mr-2 h-4 w-4" />
              Assign Recruiter
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
