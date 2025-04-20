'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/shadcn-ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn-ui/table";
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
} from "lucide-react";
import { JobType } from '@/types/job';

interface JobTableViewProps {
  jobs: JobType[];
  selectedJobs: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  onSelect: (jobId: string) => void;
  onSelectAll: () => void;
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

export function JobTableView({
  jobs,
  selectedJobs,
  sortBy,
  sortOrder,
  onSort,
  onSelect,
  onSelectAll,
  onBulkAction
}: JobTableViewProps) {
  const router = useRouter();
  
  return (
    <Card>
      <CardContent className="p-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={selectedJobs.length === jobs.length && jobs.length > 0}
                    onChange={onSelectAll}
                  />
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => onSort("title")}
                >
                  Job Title
                  {sortBy === "title" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead 
                  className="hidden md:table-cell cursor-pointer"
                  onClick={() => onSort("createdAt")}
                >
                  Posted Date
                  {sortBy === "createdAt" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Applications</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job._id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={selectedJobs.includes(job._id)}
                      onChange={() => onSelect(job._id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      <Link 
                        href={`/jobs/${job._id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {job.title}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>{job.company}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-3 w-3 text-muted-foreground" />
                      <span className="capitalize">{job.location?.type || "Not specified"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge className={jobTypeColors[job.employmentType] || "bg-gray-100"}>
                      {job.employmentType}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDate(job.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[job.status]}>
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {job.applicationCount || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push(`/jobs/${job._id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/jobs/${job._id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Job
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/jobs/${job._id}/applications`)}>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {selectedJobs.length > 0 ? (
            <div className="flex items-center gap-2">
              <span>{selectedJobs.length} selected</span>
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
          ) : (
            <span>
              {jobs.length} job{jobs.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
