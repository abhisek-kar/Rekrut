"use client";

import { Button } from "@/components/shadcn-ui/button";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import { ArrowLeft, ChevronDown, Download, Mail } from "lucide-react";

interface ApplicationsHeaderProps {
  job?: {
    title: string;
    id: string;
    company?: string;
    location?: { type: string };
  };
  loading?: boolean;
  totalApplications: number;
  selectedCount: number;
  onBulkStatusUpdate: (status: string) => void;
  onBackToJob?: () => void;
  showBackButton?: boolean;
}

export function ApplicationsHeader({
  job,
  loading,
  totalApplications,
  selectedCount,
  onBulkStatusUpdate,
  onBackToJob,
  showBackButton = true,
}: ApplicationsHeaderProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between items-center mt-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {job?.title || "Applications"}
        </h1>
        <p className="text-muted-foreground">
          {job
            ? `${job.company || ""} • ${job.location?.type || ""}`
            : "Manage all job applications"}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6">
        <div className="flex items-center gap-2">
          {showBackButton && onBackToJob && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1 h-9"
              onClick={onBackToJob}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Job
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            {totalApplications}{" "}
            {totalApplications === 1 ? "application" : "applications"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
          {selectedCount > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-1 h-9">
                  Update Status ({selectedCount})
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onBulkStatusUpdate("screening")}
                >
                  Move to Screening
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onBulkStatusUpdate("interview")}
                >
                  Move to Interview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkStatusUpdate("offer")}>
                  Move to Offer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkStatusUpdate("hired")}>
                  Mark as Hired
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onBulkStatusUpdate("rejected")}
                  className="text-destructive"
                >
                  Reject Applications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 h-9">
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export to CSV</DropdownMenuItem>
              <DropdownMenuItem>Export to Excel</DropdownMenuItem>
              <DropdownMenuItem>Export to PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedCount > 0 && (
            <Button variant="outline" size="sm" className="gap-1 h-9">
              <Mail className="h-4 w-4" />
              Email Selected ({selectedCount})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
