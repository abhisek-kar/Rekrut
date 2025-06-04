'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Button } from "@/components/shadcn-ui/button";
import { Badge } from "@/components/shadcn-ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import {
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Archive,
  Trash2,
  MapPin,
  Briefcase,
  Calendar,
  Users,
  Building,
} from "lucide-react";
import { JobType } from '@/types/job';

interface JobGridViewProps {
  jobs: JobType[];
  selectedJobs: string[];
  userRole?: 'admin' | 'subadmin'; // Add userRole prop
  onSelect: (jobId: string) => void;
  onBulkAction: (action: string) => void;
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

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function JobGridView({
  jobs,
  selectedJobs,
  userRole = 'admin',
  onSelect,
  onBulkAction
}: JobGridViewProps) {
  const router = useRouter();

  // Get role-based routes
  const getJobRoutes = (jobId: string) => {
    const prefix = userRole === 'admin' ? '/admin' : '/subadmin';
    return {
      view: `${prefix}/jobs/${jobId}`,
      edit: `${prefix}/jobs/${jobId}/edit`,
      applications: `${prefix}/applications?jobId=${jobId}`,
    };
  };
  
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <Card key={job._id} className={selectedJobs.includes(job._id) ? 'border-primary' : ''}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg font-medium">
                  <Link 
                    href={getJobRoutes(job._id).view}
                    className="hover:text-primary hover:underline"
                  >
                    {job.title}
                  </Link>
                </CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building className="mr-1 h-3 w-3" />
                  {job.company}
                </div>
              </div>
              <div className="flex space-x-2">
                <Badge className={statusColors[job.status]}>
                  {job.status}
                </Badge>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={selectedJobs.includes(job._id)}
                  onChange={() => onSelect(job._id)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{job.location?.type || "Not specified"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Badge className={jobTypeColors[job.employmentType || ''] || "bg-gray-100"}>
                    {job.employmentType || 'Not specified'}
                  </Badge>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  Posted: {formatDate(job.createdAt)}
                </div>
                <div className="flex items-center text-sm">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  {job.applicationCount || 0} applications
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(getJobRoutes(job._id).view)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(getJobRoutes(job._id).edit)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Job
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(getJobRoutes(job._id).applications)}>
                    <Briefcase className="mr-2 h-4 w-4" />
                    View Applications
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate Job
                  </DropdownMenuItem>
                  {job.status !== "archived" && (
                    <DropdownMenuItem onClick={() => onBulkAction("archive")}>
                      <Archive className="mr-2 h-4 w-4" />
                      Archive Job
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => onBulkAction("delete")}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Job
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {selectedJobs.length > 0 && (
        <div className="mt-4 p-4 bg-muted rounded-md flex items-center justify-between">
          <span>{selectedJobs.length} selected</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction("archive")}
            >
              <Archive className="mr-2 h-4 w-4" />
              Archive Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={() => onBulkAction("delete")}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
