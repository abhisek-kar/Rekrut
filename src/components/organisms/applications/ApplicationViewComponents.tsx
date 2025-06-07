"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/shadcn-ui/card";
import { Badge } from "@/components/shadcn-ui/badge";
import { Button } from "@/components/shadcn-ui/button";
import { Checkbox } from "@/components/shadcn-ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn-ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn-ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import {
  Eye,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Star,
  Briefcase,
  User,
  MoreHorizontal,
  FileText,
  Download,
  Edit3,
  Archive,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

// Application interface (same as in ApplicationsListView)
interface ApplicationItem {
  _id: string;
  applicationDate: string;
  status: string;
  source?: string;
  matchingScore?: {
    overall: number;
    skills?: number;
    experience?: number;
    education?: number;
  };
  resume: {
    url: string;
    filename: string;
  };
  coverLetter?: {
    url: string;
    filename: string;
  };
  job: {
    _id: string;
    title: string;
    company: string;
    department?: string;
  };
  candidate: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profilePhoto?: string;
  };
  notes?: Array<{
    _id: string;
    content: string;
    createdBy: string;
    createdAt: string;
  }>;
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface ApplicationViewProps {
  applications: ApplicationItem[];
  selectedApplications: string[];
  onSelectApplication: (applicationId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  viewBaseUrl: string;
  userRole: "admin" | "subadmin";
  loading: boolean;
  applicationActions?: any;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

// Helper function to get initials
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

// Helper function to format score
const formatScore = (score?: { overall: number }) => {
  if (!score) return null;
  return `${score.overall}%`;
};

// Grid View Component
export function ApplicationsGridView({
  applications,
  selectedApplications,
  onSelectApplication,
  viewBaseUrl,
  userRole,
  applicationActions,
  getStatusColor,
  getStatusLabel,
}: ApplicationViewProps) {
  const router = useRouter();

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No applications found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {applications.map((application) => (
        <Card key={application._id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            {/* Header with checkbox and status */}
            <div className="flex items-start justify-between mb-4">
              <Checkbox
                checked={selectedApplications.includes(application._id)}
                onCheckedChange={(checked) =>
                  onSelectApplication(application._id, checked as boolean)
                }
              />
              <Badge className={getStatusColor(application.status)}>
                {getStatusLabel(application.status)}
              </Badge>
            </div>

            {/* Candidate Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={application.candidate.profilePhoto}
                    alt={`${application.candidate.firstName} ${application.candidate.lastName}`}
                  />
                  <AvatarFallback>
                    {getInitials(
                      `${application.candidate.firstName} ${application.candidate.lastName}`
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-gray-900 truncate">
                    {application.candidate.firstName} {application.candidate.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {application.candidate.email}
                  </p>
                </div>
              </div>

              {/* Job Info */}
              <div className="flex items-center text-sm text-gray-600">
                <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
                <div className="truncate">
                  <div className="font-medium truncate">{application.job.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {application.job.company}
                  </div>
                </div>
              </div>

              {/* Match Score */}
              {application.matchingScore && (
                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  <span className="font-medium text-green-600">
                    {formatScore(application.matchingScore)} match
                  </span>
                </div>
              )}

              {/* Source */}
              {application.source && (
                <div className="flex items-center text-sm text-gray-600">
                  <div className="px-2 py-1 bg-secondary rounded text-xs">
                    {application.source}
                  </div>
                </div>
              )}

              {/* Notes indicator */}
              {application.notes && application.notes.length > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <span>{application.notes.length} note(s)</span>
                </div>
              )}

              {/* Assigned To (Admin view) */}
              {userRole === "admin" && application.assignedTo && (
                <div className="text-xs text-gray-500">
                  Assigned to: {application.assignedTo.firstName}{" "}
                  {application.assignedTo.lastName}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="text-xs text-gray-500 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDistanceToNow(new Date(application.applicationDate), {
                    addSuffix: true,
                  })}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`${viewBaseUrl}/${application._id}`)}
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(application.resume.url, "_blank")}
                  >
                    <FileText className="w-3 h-3" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`${viewBaseUrl}/${application._id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => window.open(application.resume.url, "_blank")}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Resume
                      </DropdownMenuItem>
                      {application.coverLetter && (
                        <DropdownMenuItem
                          onClick={() => window.open(application.coverLetter!.url, "_blank")}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Cover Letter
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => window.open(`mailto:${application.candidate.email}`, "_blank")}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
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
export function ApplicationsTableView({
  applications,
  selectedApplications,
  onSelectApplication,
  onSelectAll,
  viewBaseUrl,
  userRole,
  applicationActions,
  getStatusColor,
  getStatusLabel,
}: ApplicationViewProps) {
  const router = useRouter();

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No applications found</h3>
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
                checked={
                  selectedApplications.length === applications.length &&
                  applications.length > 0
                }
                onCheckedChange={(checked) => onSelectAll(checked as boolean)}
              />
            </TableHead>
            <TableHead>Candidate</TableHead>
            <TableHead>Job</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Score</TableHead>
            {userRole === "admin" && <TableHead>Assigned To</TableHead>}
            <TableHead>Applied</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((application) => (
            <TableRow key={application._id} className="hover:bg-muted/50">
              <TableCell>
                <Checkbox
                  checked={selectedApplications.includes(application._id)}
                  onCheckedChange={(checked) =>
                    onSelectApplication(application._id, checked as boolean)
                  }
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={application.candidate.profilePhoto}
                      alt={`${application.candidate.firstName} ${application.candidate.lastName}`}
                    />
                    <AvatarFallback>
                      {getInitials(
                        `${application.candidate.firstName} ${application.candidate.lastName}`
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {application.candidate.firstName} {application.candidate.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {application.candidate.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{application.job.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {application.job.company}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(application.status)}>
                  {getStatusLabel(application.status)}
                </Badge>
              </TableCell>
              <TableCell>
                {application.source ? (
                  <div className="px-2 py-1 bg-secondary rounded text-xs inline-block">
                    {application.source}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {application.matchingScore ? (
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    <span className="font-medium text-green-600">
                      {formatScore(application.matchingScore)}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              {userRole === "admin" && (
                <TableCell>
                  {application.assignedTo ? (
                    <div className="text-sm">
                      {application.assignedTo.firstName} {application.assignedTo.lastName}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
              )}
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(application.applicationDate), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`${viewBaseUrl}/${application._id}`)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(application.resume.url, "_blank")}
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`${viewBaseUrl}/${application._id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => window.open(application.resume.url, "_blank")}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Resume
                      </DropdownMenuItem>
                      {application.coverLetter && (
                        <DropdownMenuItem
                          onClick={() => window.open(application.coverLetter!.url, "_blank")}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Cover Letter
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => window.open(`mailto:${application.candidate.email}`, "_blank")}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                      {application.candidate.phone && (
                        <DropdownMenuItem
                          onClick={() => window.open(`tel:${application.candidate.phone}`, "_blank")}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Call
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
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
