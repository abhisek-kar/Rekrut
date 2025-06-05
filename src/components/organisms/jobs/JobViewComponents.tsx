"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/shadcn-ui/card";
import { Badge } from "@/components/shadcn-ui/badge";
import { Button } from "@/components/shadcn-ui/button";
import { Checkbox } from "@/components/shadcn-ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn-ui/table";
import {
  Eye,
  Edit3,
  MoreHorizontal,
  Calendar,
  MapPin,
  Briefcase,
  Users,
  Copy,
  Archive,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface JobItem {
  _id: string;
  title: string;
  company: string;
  department?: string;
  location: {
    type: string;
    city?: string;
    state?: string;
    country?: string;
  };
  status: string;
  employmentType: string;
  experienceLevel: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  applicationCounts?: {
    total: number;
    new: number;
    interviewing: number;
    offered: number;
    hired: number;
  };
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
}

interface JobViewProps {
  jobs: JobItem[];
  selectedJobs: string[];
  onSelectJob: (jobId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  viewBaseUrl: string;
  editBaseUrl: string;
  userRole: "admin" | "subadmin";
  loading: boolean;
}

// Status helpers
const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "draft":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "closed":
      return "bg-red-100 text-red-800 border-red-200";
    case "archived":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-blue-100 text-blue-800 border-blue-200";
  }
};

const getStatusLabel = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Format salary range
const formatSalary = (salary?: {
  min?: number;
  max?: number;
  currency?: string;
}) => {
  if (!salary || (!salary.min && !salary.max)) return null;

  const currency = salary.currency || "USD";
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  if (salary.min && salary.max) {
    return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
  } else if (salary.min) {
    return `From ${formatter.format(salary.min)}`;
  } else if (salary.max) {
    return `Up to ${formatter.format(salary.max)}`;
  }
  return null;
};

// Grid View Component
export function JobGridView({
  jobs,
  selectedJobs,
  onSelectJob,
  viewBaseUrl,
  editBaseUrl,
  userRole,
}: JobViewProps) {
  const router = useRouter();

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No jobs found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {jobs.map((job) => (
        <Card key={job._id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <Checkbox
                checked={selectedJobs.includes(job._id)}
                onCheckedChange={(checked) =>
                  onSelectJob(job._id, checked as boolean)
                }
              />
              <Badge className={getStatusColor(job.status)}>
                {getStatusLabel(job.status)}
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                  {job.title}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Briefcase className="w-4 h-4 mr-2" />
                  <span>{job.company}</span>
                  {job.department && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{job.department}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>
                  {job.location.type.charAt(0).toUpperCase() +
                    job.location.type.slice(1)}
                  {job.location.city && ` • ${job.location.city}`}
                  {job.location.state && `, ${job.location.state}`}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  {job.employmentType}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {job.experienceLevel} level
                </Badge>
              </div>

              {job.salary && (
                <div className="text-sm font-medium text-green-600">
                  {formatSalary(job.salary)}
                </div>
              )}

              {job.applicationCounts && (
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{job.applicationCounts.total} applications</span>
                  {job.applicationCounts.new > 0 && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {job.applicationCounts.new} new
                    </span>
                  )}
                </div>
              )}

              {userRole === "admin" && job.assignedTo && (
                <div className="text-xs text-gray-500">
                  Assigned to: {job.assignedTo.firstName}{" "}
                  {job.assignedTo.lastName}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="text-xs text-gray-500 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDistanceToNow(new Date(job.updatedAt), {
                    addSuffix: true,
                  })}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`${viewBaseUrl}/${job._id}`)}
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`${editBaseUrl}/${job._id}/edit`)
                    }
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          navigator.clipboard.writeText(
                            `${window.location.origin}/jobs/${job._id}`
                          )
                        }
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Table View Component
export function JobTableView({
  jobs,
  selectedJobs,
  onSelectJob,
  onSelectAll,
  viewBaseUrl,
  editBaseUrl,
  userRole,
}: JobViewProps) {
  const router = useRouter();

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No jobs found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedJobs.length === jobs.length && jobs.length > 0}
                onCheckedChange={(checked) => onSelectAll(checked as boolean)}
              />
            </TableHead>
            <TableHead>Job Title</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applications</TableHead>
            {userRole === "admin" && <TableHead>Assigned To</TableHead>}
            <TableHead>Updated</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job._id} className="hover:bg-muted/50">
              <TableCell>
                <Checkbox
                  checked={selectedJobs.includes(job._id)}
                  onCheckedChange={(checked) =>
                    onSelectJob(job._id, checked as boolean)
                  }
                />
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{job.title}</div>
                  {job.department && (
                    <div className="text-sm text-gray-500">
                      {job.department}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{job.company}</TableCell>
              <TableCell>
                <div>
                  <div className="capitalize">{job.location.type}</div>
                  {job.location.city && (
                    <div className="text-sm text-gray-500">
                      {job.location.city}
                      {job.location.state && `, ${job.location.state}`}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="text-sm">{job.employmentType}</div>
                  <div className="text-xs text-gray-500">
                    {job.experienceLevel}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(job.status)}>
                  {getStatusLabel(job.status)}
                </Badge>
              </TableCell>
              <TableCell>
                {job.applicationCounts ? (
                  <div>
                    <div className="font-medium">
                      {job.applicationCounts.total}
                    </div>
                    {job.applicationCounts.new > 0 && (
                      <div className="text-xs text-blue-600">
                        {job.applicationCounts.new} new
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              {userRole === "admin" && (
                <TableCell>
                  {job.assignedTo ? (
                    <div className="text-sm">
                      {job.assignedTo.firstName} {job.assignedTo.lastName}
                    </div>
                  ) : (
                    <span className="text-gray-400">Unassigned</span>
                  )}
                </TableCell>
              )}
              <TableCell className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(job.updatedAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`${viewBaseUrl}/${job._id}`)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      router.push(`${editBaseUrl}/${job._id}/edit`)
                    }
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          navigator.clipboard.writeText(
                            `${window.location.origin}/jobs/${job._id}`
                          )
                        }
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
