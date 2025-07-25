"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/shadcn-ui/badge";
import { Button } from "@/components/shadcn-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import {
  Building,
  MapPin,
  Calendar,
  MoreVertical,
  Edit,
  Copy,
  ArrowUpRight,
  UserPlus,
  Share2,
  Eye,
  Archive,
  Trash2,
} from "lucide-react";
import { JobType } from "@/types/job";

interface JobHeaderProps {
  job: JobType;
  onStatusUpdate: (status: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAssignRecruiter: () => void;
}

// Job status badges configuration
const statusColors: Record<string, string> = {
  draft: "bg-gray-200 text-gray-800",
  active: "bg-green-100 text-green-800",
  closed: "bg-amber-100 text-amber-800",
  archived: "bg-red-100 text-red-800",
};

// Job type badges configuration
const jobTypeColors: Record<string, string> = {
  "full-time": "bg-blue-100 text-blue-800",
  "part-time": "bg-purple-100 text-purple-800",
  contract: "bg-orange-100 text-orange-800",
  internship: "bg-teal-100 text-teal-800",
};

export function JobHeader({
  job,
  onStatusUpdate,
  onDuplicate,
  onDelete,
  onAssignRecruiter,
}: JobHeaderProps) {
  const router = useRouter();

  // Format date for display
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
          {job.featured && (
            <Badge variant="default" className="bg-yellow-500">
              Featured
            </Badge>
          )}
        </div>
        <div className="flex items-center mt-2 text-muted-foreground">
          <Building className="h-4 w-4 mr-1" />
          <span>{job.company}</span>
          {job.department && (
            <>
              <span className="mx-1">•</span>
              <span>{job.department}</span>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          <Badge className={statusColors[job.status]}>
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </Badge>
          <Badge className={jobTypeColors[job.employmentType || "full-time"]}>
            {job.employmentType}
          </Badge>
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="capitalize">
              {job.location?.type || "Not specified"}
              {job.location?.type !== "remote" && job.location?.city && (
                <> • {job.location.city}</>
              )}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>Posted: {formatDate(job.createdAt)}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:items-end">
        <div className="flex gap-2">
          <Button
            onClick={() => router.push(`/jobs/${job._id}/edit`)}
            className="gap-1"
          >
            <Edit className="h-4 w-4" />
            Edit Job
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate Job
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.open(`/apply/${job._id}`, "_blank")}
              >
                <ArrowUpRight className="mr-2 h-4 w-4" />
                View Public Page
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAssignRecruiter}>
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Recruiter
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  /* Share functionality */
                }}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share Job
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onStatusUpdate("active")}
                disabled={job.status === "active"}
              >
                <Eye className="mr-2 h-4 w-4 text-green-600" />
                Publish Job
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusUpdate("closed")}
                disabled={job.status === "closed"}
              >
                <Archive className="mr-2 h-4 w-4 text-amber-600" />
                Close Job
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Job
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-xs text-muted-foreground mt-1 sm:text-right">
          ID: {job._id}
        </p>
      </div>
    </div>
  );
}
