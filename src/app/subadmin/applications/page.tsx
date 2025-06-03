"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/shadcn-ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { Badge } from "@/components/shadcn-ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn-ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn-ui/tabs";
import { Input } from "@/components/shadcn-ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import { 
  Users, 
  Search, 
  Filter,
  Eye,
  MessageSquare,
  Calendar,
  MoreHorizontal,
  FileText,
  Mail,
  Phone,
  Briefcase,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { SectionLoader } from "@/components/atoms/loader";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatDistanceToNow } from "date-fns";

// Interface for SubAdmin application data
interface SubAdminApplication {
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
  };
  candidate: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePhoto?: string;
  };
}

interface ApplicationsResponse {
  applications: SubAdminApplication[];
  counts: {
    all: number;
    applied: number;
    screening: number;
    interview_scheduled: number;
    interviewed: number;
    offered: number;
    hired: number;
    rejected: number;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export default function SubAdminApplicationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("applicationDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [applications, setApplications] = useState<SubAdminApplication[]>([]);
  const [counts, setCounts] = useState({
    all: 0,
    applied: 0,
    screening: 0,
    interview_scheduled: 0,
    interviewed: 0,
    offered: 0,
    hired: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Get jobId from URL params if specified
  const jobIdFilter = searchParams.get('jobId');

  // Fetch SubAdmin's applications
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder,
      });

      // Apply status filter based on active tab
      if (activeTab !== "all") {
        params.set("status", activeTab);
      }

      // Apply job filter if specified
      if (jobIdFilter) {
        params.set("jobId", jobIdFilter);
      }

      // Apply search filter
      if (searchTerm.trim()) {
        params.set("search", searchTerm.trim());
      }

      const response = await fetch(`/api/subadmin/applications?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data: ApplicationsResponse = await response.json();
      
      setApplications(data.applications);
      setCounts(data.counts);

    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeTab, searchTerm, sortBy, sortOrder, jobIdFilter]);

  // Fetch applications when component mounts or dependencies change
  useEffect(() => {
    if (user?.id) {
      fetchApplications();
    }
  }, [fetchApplications, user?.id]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (user?.id) {
        setCurrentPage(1);
        fetchApplications();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    const [field, order] = value.split("-");
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
  };

  // Handle status update
  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: newStatus,
          reason: `Status updated by ${user?.firstName} ${user?.lastName}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Refresh applications
      fetchApplications();
      toast.success(`Application status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update application status");
    }
  };

  // Get status display info
  const getStatusInfo = (status: string) => {
    const statusMap = {
      applied: { label: "Applied", color: "bg-blue-100 text-blue-800", icon: FileText },
      screening: { label: "Screening", color: "bg-yellow-100 text-yellow-800", icon: Eye },
      interview_scheduled: { label: "Interview Scheduled", color: "bg-purple-100 text-purple-800", icon: Calendar },
      interviewed: { label: "Interviewed", color: "bg-orange-100 text-orange-800", icon: MessageSquare },
      offered: { label: "Offered", color: "bg-green-100 text-green-800", icon: CheckCircle },
      hired: { label: "Hired", color: "bg-emerald-100 text-emerald-800", icon: Star },
      rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: XCircle },
    };
    
    return statusMap[status as keyof typeof statusMap] || {
      label: status.charAt(0).toUpperCase() + status.slice(1),
      color: "bg-gray-100 text-gray-800",
      icon: AlertCircle
    };
  };

  // Render loading state
  const renderLoading = () => {
    return <SectionLoader message="Loading applications..." height="400px" />;
  };

  // Render application card
  const renderApplicationCard = (application: SubAdminApplication) => {
    const statusInfo = getStatusInfo(application.status);
    const StatusIcon = statusInfo.icon;

    return (
      <Card key={application._id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Candidate Avatar */}
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={application.candidate.profilePhoto} 
                alt={`${application.candidate.firstName} ${application.candidate.lastName}`}
              />
              <AvatarFallback>
                {application.candidate.firstName[0]}{application.candidate.lastName[0]}
              </AvatarFallback>
            </Avatar>

            {/* Application Details */}
            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {application.candidate.firstName} {application.candidate.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    {application.candidate.email}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={statusInfo.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                  {application.matchingScore && (
                    <Badge variant="outline">
                      {application.matchingScore.overall}% match
                    </Badge>
                  )}
                </div>
              </div>

              {/* Job Info */}
              <div className="flex items-center text-sm text-muted-foreground">
                <Briefcase className="w-4 h-4 mr-2" />
                <span className="font-medium">{application.job.title}</span>
                <span className="mx-2">•</span>
                <span>{application.job.company}</span>
              </div>

              {/* Application Meta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  Applied {formatDistanceToNow(new Date(application.applicationDate), { addSuffix: true })}
                  {application.source && (
                    <>
                      <span className="mx-2">•</span>
                      <span>Source: {application.source}</span>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/subadmin/applications/${application._id}`)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Review
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/subadmin/applications/${application._id}`)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(application.resume.url, '_blank')}>
                        <FileText className="w-4 h-4 mr-2" />
                        View Resume
                      </DropdownMenuItem>
                      {application.coverLetter && (
                        <DropdownMenuItem onClick={() => window.open(application.coverLetter!.url, '_blank')}>
                          <FileText className="w-4 h-4 mr-2" />
                          View Cover Letter
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleStatusUpdate(application._id, 'screening')}>
                        Move to Screening
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusUpdate(application._id, 'interview_scheduled')}>
                        Schedule Interview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusUpdate(application._id, 'offered')}>
                        Make Offer
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleStatusUpdate(application._id, 'rejected')}
                        className="text-red-600"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render applications list
  const renderApplicationsList = () => {
    if (loading) {
      return renderLoading();
    }

    if (applications.length === 0) {
      return (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No applications found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? `No applications match your search "${searchTerm}"`
              : jobIdFilter
              ? "No applications for this job yet"
              : activeTab === "all"
              ? "No applications have been submitted for your assigned jobs yet"
              : `No ${activeTab.replace('_', ' ')} applications found`}
          </p>
          {!searchTerm && !jobIdFilter && activeTab === "all" && (
            <p className="text-sm text-muted-foreground">
              Applications will appear here once candidates start applying to your jobs.
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {applications.map(renderApplicationCard)}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title={jobIdFilter ? "Job Applications" : "My Applications"}
        description={
          jobIdFilter 
            ? "Manage applications for your assigned job"
            : "Manage applications for all your assigned jobs"
        }
        actions={
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>Total: {counts.all} applications</span>
          </div>
        }
      />

      {/* Filters and Search */}
      <div className="p-4 md:p-6 border-b bg-gray-50/50">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by candidate name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="applicationDate-desc">Newest First</SelectItem>
                <SelectItem value="applicationDate-asc">Oldest First</SelectItem>
                <SelectItem value="candidate.lastName-asc">Candidate A-Z</SelectItem>
                <SelectItem value="candidate.lastName-desc">Candidate Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col gap-6">
          {/* Status Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">
                All ({counts.all})
              </TabsTrigger>
              <TabsTrigger value="applied">
                Applied ({counts.applied})
              </TabsTrigger>
              <TabsTrigger value="screening">
                Screening ({counts.screening})
              </TabsTrigger>
              <TabsTrigger value="interview_scheduled">
                Interview ({counts.interview_scheduled})
              </TabsTrigger>
              <TabsTrigger value="interviewed">
                Interviewed ({counts.interviewed})
              </TabsTrigger>
              <TabsTrigger value="offered">
                Offered ({counts.offered})
              </TabsTrigger>
              <TabsTrigger value="hired">
                Hired ({counts.hired})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({counts.rejected})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="w-full">
              {renderApplicationsList()}
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          {applications.length > 0 && (
            <div className="flex justify-center mt-8">
              <div className="text-sm text-gray-500">
                Showing {applications.length} of {counts.all} applications
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}