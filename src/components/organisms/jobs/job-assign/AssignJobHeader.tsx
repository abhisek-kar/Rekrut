"use client";

import { Briefcase, ArrowLeft } from "lucide-react";
import { Button } from "@/components/shadcn-ui/button";
import { Badge } from "@/components/shadcn-ui/badge";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import { JobType } from "@/types/job";

interface AssignJobHeaderProps {
  job: JobType | null;
  loading: boolean;
  onBack: () => void;
}

export function AssignJobHeader({
  job,
  loading,
  onBack,
}: AssignJobHeaderProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="mb-4 -ml-3 p-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Job
        </Button>
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2 mt-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="mb-4 -ml-3 p-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Jobs
        </Button>
        <div className="p-6 text-center">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Job Not Found</h3>
          <p className="text-muted-foreground mt-1">
            This job may have been deleted or is unavailable.
          </p>
        </div>
      </div>
    );
  }

  // Helper to display and format job type
  const getJobTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      "full-time": "Full-time",
      "part-time": "Part-time",
      contract: "Contract",
      internship: "Internship",
    };
    return typeMap[type] || type;
  };

  // Helper to get status badge variant
  const getStatusVariant = (status: string) => {
    const variantMap: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      draft: "secondary",
      active: "default",
      closed: "outline",
      archived: "destructive",
    };
    return variantMap[status] || "default";
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-4 -ml-3 p-2">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Job
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
        <p className="text-muted-foreground">{job.company}</p>

        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant={getStatusVariant(job.status)}>
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </Badge>
          <Badge variant="outline">
            {getJobTypeText(job.employmentType as string)}
          </Badge>
          <Badge variant="outline">
            {job.location.type.charAt(0).toUpperCase() +
              job.location.type.slice(1)}
          </Badge>
        </div>
      </div>
    </div>
  );
}
