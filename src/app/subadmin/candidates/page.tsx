"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn-ui/button";
import { Card, CardContent } from "@/components/shadcn-ui/card";
import { Badge } from "@/components/shadcn-ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-ui/avatar";
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
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  MoreHorizontal,
  FileText,
  Star,
  MessageSquare,
  UserPlus,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { SectionLoader } from "@/components/atoms/loader";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatDistanceToNow } from "date-fns";

// Interface for SubAdmin candidate data
interface SubAdminCandidate {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  currentJobTitle?: string;
  currentCompany?: string;
  yearsOfExperience?: number;
  status: string;
  currentAddress?: {
    city?: string;
    state?: string;
    country?: string;
  };
  skills?: Array<{
    name: string;
    proficiency?: string;
  }>;
  applicationCount: number;
  latestApplicationStatus: string;
  latestApplicationDate?: string;
  applications: Array<{
    _id: string;
    jobId: string;
    jobTitle: string;
    company: string;
    status: string;
    applicationDate: string;
    matchingScore?: {
      overall: number;
    };
  }>;
  createdAt: string;
}

interface CandidatesResponse {
  candidates: SubAdminCandidate[];
  stats: {
    total: number;
    active: number;
    inactive: number;
    blacklisted: number;
    byApplicationStatus: {
      applied: number;
      screening: number;
      interview_scheduled: number;
      interviewed: number;
      offered: number;
      hired: number;
      rejected: number;
    };
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export default function SubAdminCandidatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [applicationStatusFilter, setApplicationStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latestApplicationDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [candidates, setCandidates] = useState<SubAdminCandidate[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    blacklisted: 0,
    byApplicationStatus: {
      applied: 0,
      screening: 0,
      interview_scheduled: 0,
      interviewed: 0,
      offered: 0,
      hired: 0,
      rejected: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Fetch SubAdmin's candidates
  const fetchCandidates = useCallback(async () => {
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

      // Apply application status filter
      if (applicationStatusFilter !== "all") {
        params.set("applicationStatus", applicationStatusFilter);
      }

      // Apply search filter
      if (searchTerm.trim()) {
        params.set("search", searchTerm.trim());
      }

      const response = await fetch(
        `/api/subadmin/candidates?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch candidates");
      }

      const data: CandidatesResponse = await response.json();

      setCandidates(data.candidates);
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to load candidates");
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    activeTab,
    searchTerm,
    sortBy,
    sortOrder,
    applicationStatusFilter,
  ]);

  // Fetch candidates when component mounts or dependencies change
  useEffect(() => {
    if (user?.id) {
      fetchCandidates();
    }
  }, [fetchCandidates, user?.id]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (user?.id) {
        setCurrentPage(1);
        fetchCandidates();
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

  // Handle application status filter change
  const handleApplicationStatusFilterChange = (value: string) => {
    setApplicationStatusFilter(value);
    setCurrentPage(1);
  };

  // Get status display info
  const getStatusInfo = (status: string) => {
    const statusMap = {
      active: { label: "Active", color: "bg-green-100 text-green-800" },
      inactive: { label: "Inactive", color: "bg-gray-100 text-gray-800" },
      blacklisted: { label: "Blacklisted", color: "bg-red-100 text-red-800" },
    };

    return (
      statusMap[status as keyof typeof statusMap] || {
        label: status.charAt(0).toUpperCase() + status.slice(1),
        color: "bg-gray-100 text-gray-800",
      }
    );
  };

  // Get application status display info
  const getApplicationStatusInfo = (status: string) => {
    const statusMap = {
      applied: { label: "Applied", color: "bg-blue-100 text-blue-800" },
      screening: { label: "Screening", color: "bg-yellow-100 text-yellow-800" },
      interview_scheduled: {
        label: "Interview Scheduled",
        color: "bg-purple-100 text-purple-800",
      },
      interviewed: {
        label: "Interviewed",
        color: "bg-orange-100 text-orange-800",
      },
      offered: { label: "Offered", color: "bg-green-100 text-green-800" },
      hired: { label: "Hired", color: "bg-emerald-100 text-emerald-800" },
      rejected: { label: "Rejected", color: "bg-red-100 text-red-800" },
    };

    return (
      statusMap[status as keyof typeof statusMap] || {
        label:
          status.charAt(0).toUpperCase() + status.slice(1).replace("_", " "),
        color: "bg-gray-100 text-gray-800",
      }
    );
  };

  // Render loading state
  const renderLoading = () => {
    return <SectionLoader message="Loading candidates..." height="400px" />;
  };

  // Render candidate card
  const renderCandidateCard = (candidate: SubAdminCandidate) => {
    const statusInfo = getStatusInfo(candidate.status);
    const latestAppStatusInfo = getApplicationStatusInfo(
      candidate.latestApplicationStatus
    );

    return (
      <Card key={candidate._id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Candidate Avatar */}
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={candidate.profilePhoto}
                alt={`${candidate.firstName} ${candidate.lastName}`}
              />
              <AvatarFallback className="text-lg">
                {candidate.firstName[0]}
                {candidate.lastName[0]}
              </AvatarFallback>
            </Avatar>

            {/* Candidate Details */}
            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {candidate.firstName} {candidate.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    {candidate.email}
                  </p>
                  {candidate.phone && (
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <Phone className="w-3 h-3 mr-1" />
                      {candidate.phone}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                  <Badge className={latestAppStatusInfo.color}>
                    {latestAppStatusInfo.label}
                  </Badge>
                </div>
              </div>

              {/* Professional Info */}
              {(candidate.currentJobTitle || candidate.currentCompany) && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Briefcase className="w-4 h-4 mr-2" />
                  <span>
                    {candidate.currentJobTitle && candidate.currentCompany
                      ? `${candidate.currentJobTitle} at ${candidate.currentCompany}`
                      : candidate.currentJobTitle || candidate.currentCompany}
                  </span>
                  {candidate.yearsOfExperience && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{candidate.yearsOfExperience} years exp.</span>
                    </>
                  )}
                </div>
              )}

              {/* Location */}
              {candidate.currentAddress && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>
                    {candidate.currentAddress.city &&
                    candidate.currentAddress.state
                      ? `${candidate.currentAddress.city}, ${candidate.currentAddress.state}`
                      : candidate.currentAddress.city ||
                        candidate.currentAddress.state}
                    {candidate.currentAddress.country &&
                      `, ${candidate.currentAddress.country}`}
                  </span>
                </div>
              )}

              {/* Skills */}
              {candidate.skills && candidate.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {candidate.skills.slice(0, 5).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill.name}
                    </Badge>
                  ))}
                  {candidate.skills.length > 5 && (
                    <Badge variant="secondary" className="text-xs">
                      +{candidate.skills.length - 5} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Applications Summary */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <FileText className="w-4 h-4 mr-2" />
                  <span>
                    {candidate.applicationCount} application
                    {candidate.applicationCount !== 1 ? "s" : ""}
                  </span>
                  {candidate.latestApplicationDate && (
                    <>
                      <span className="mx-2">•</span>
                      <Clock className="w-3 h-3 mr-1" />
                      <span>
                        Latest{" "}
                        {formatDistanceToNow(
                          new Date(candidate.latestApplicationDate),
                          { addSuffix: true }
                        )}
                      </span>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/subadmin/candidates/${candidate._id}`)
                    }
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View Profile
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
                          router.push(`/subadmin/candidates/${candidate._id}`)
                        }
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(
                            `/subadmin/applications?candidateId=${candidate._id}`
                          )
                        }
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Applications ({candidate.applicationCount})
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          window.open(`mailto:${candidate.email}`, "_blank")
                        }
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                      {candidate.phone && (
                        <DropdownMenuItem
                          onClick={() =>
                            window.open(`tel:${candidate.phone}`, "_blank")
                          }
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Call
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          toast.info("Add to shortlist feature coming soon")
                        }
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Add to Shortlist
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          toast.info("Add note feature coming soon")
                        }
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Add Note
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Recent Applications Preview */}
              {candidate.applications.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Recent Applications:
                  </p>
                  <div className="space-y-1">
                    {candidate.applications.slice(0, 2).map((app) => {
                      const appStatusInfo = getApplicationStatusInfo(
                        app.status
                      );
                      return (
                        <div
                          key={app._id}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="font-medium">{app.jobTitle}</span>
                          <div className="flex items-center gap-2">
                            {app.matchingScore && (
                              <span className="text-green-600">
                                {app.matchingScore.overall}%
                              </span>
                            )}
                            <Badge
                              className={`${appStatusInfo.color} text-xs py-0 px-1`}
                            >
                              {appStatusInfo.label}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                    {candidate.applications.length > 2 && (
                      <p className="text-xs text-muted-foreground">
                        +{candidate.applications.length - 2} more applications
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render candidates list
  const renderCandidatesList = () => {
    if (loading) {
      return renderLoading();
    }

    if (candidates.length === 0) {
      return (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No candidates found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? `No candidates match your search "${searchTerm}"`
              : activeTab === "all"
              ? "No candidates have applied to your assigned jobs yet"
              : `No ${activeTab} candidates found`}
          </p>
          {!searchTerm && activeTab === "all" && (
            <p className="text-sm text-muted-foreground">
              Candidates will appear here once they start applying to your jobs.
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {candidates.map(renderCandidateCard)}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="My Candidates"
        description="Manage candidates who have applied to your assigned jobs"
        actions={
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>Total: {stats.total} candidates</span>
          </div>
        }
      />

      {/* Filters and Search */}
      <div className="p-4 md:p-6 border-b bg-gray-50/50">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />

            <Select
              value={applicationStatusFilter}
              onValueChange={handleApplicationStatusFilterChange}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by application status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Application Status</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="interview_scheduled">
                  Interview Scheduled
                </SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="offered">Offered</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latestApplicationDate-desc">
                  Latest Application
                </SelectItem>
                <SelectItem value="createdAt-desc">Recently Added</SelectItem>
                <SelectItem value="firstName-asc">Name A-Z</SelectItem>
                <SelectItem value="firstName-desc">Name Z-A</SelectItem>
                <SelectItem value="yearsOfExperience-desc">
                  Most Experience
                </SelectItem>
                <SelectItem value="applicationCount-desc">
                  Most Applications
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col gap-6">
          {/* Status Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="mb-6">
              <TabsTrigger value="all">
                All Candidates ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
              <TabsTrigger value="inactive">
                Inactive ({stats.inactive})
              </TabsTrigger>
              <TabsTrigger value="blacklisted">
                Blacklisted ({stats.blacklisted})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="w-full">
              {renderCandidatesList()}
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          {candidates.length > 0 && (
            <div className="flex justify-center mt-8">
              <div className="text-sm text-gray-500">
                Showing {candidates.length} of {stats.total} candidates
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
