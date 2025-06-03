"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn-ui/button";
import { Card, CardContent } from "@/components/shadcn-ui/card";
import { Badge } from "@/components/shadcn-ui/badge";
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
  PlusCircle, 
  Briefcase, 
  Users, 
  Search, 
  Filter,
  Eye,
  Edit3,
  MoreHorizontal,
  Calendar,
  MapPin
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { SectionLoader } from "@/components/atoms/loader";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatDistanceToNow } from "date-fns";

// Interface for SubAdmin job data
interface SubAdminJob {
  _id: string;
  title: string;
  company: string;
  department?: string;
  location: {
    type: string;
    city?: string;
    state?: string;
  };
  status: string;
  employmentType: string;
  experienceLevel: string;
  createdAt: string;
  updatedAt: string;
  applicationCounts?: {
    total: number;
    new: number;
    interviewing: number;
    offered: number;
    hired: number;
  };
}

interface JobsResponse {
  jobs: SubAdminJob[];
  counts: {
    all: number;
    active: number;
    draft: number;
    closed: number;
    archived: number;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export default function SubAdminJobsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [jobs, setJobs] = useState<SubAdminJob[]>([]);
  const [counts, setCounts] = useState({
    all: 0,
    active: 0,
    draft: 0,
    closed: 0,
    archived: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Fetch SubAdmin's assigned jobs
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder
      });

      // Apply status filter based on active tab
      if (activeTab !== "all") {
        params.set("status", activeTab === "active" ? "published" : activeTab);
      }

      // Apply search filter
      if (searchTerm.trim()) {
        params.set("search", searchTerm.trim());
      }

      const response = await fetch(`/api/subadmin/jobs?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data: JobsResponse = await response.json();
      
      // Jobs already come with application counts from the API
      setJobs(data.jobs);
      setCounts(data.counts);

    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load your assigned jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeTab, searchTerm, sortBy, sortOrder, user?.id]);

  // Fetch jobs when component mounts or dependencies change
  useEffect(() => {
    if (user?.id) {
      fetchJobs();
    }
  }, [fetchJobs, user?.id]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (user?.id) {
        setCurrentPage(1); // Reset to first page on search
        fetchJobs();
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

  // Render loading state
  const renderLoading = () => {
    return <SectionLoader message="Loading your assigned jobs..." height="400px" />;
  };

  // Render job card
  const renderJobCard = (job: SubAdminJob) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "active":
        case "published":
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
      switch (status) {
        case "published":
          return "Active";
        case "draft":
          return "Draft";
        case "closed":
          return "Closed";
        case "archived":
          return "Archived";
        default:
          return status.charAt(0).toUpperCase() + status.slice(1);
      }
    };

    return (
      <Card key={job._id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg text-gray-900">{job.title}</h3>
                <Badge className={getStatusColor(job.status)}>
                  {getStatusLabel(job.status)}
                </Badge>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Briefcase className="w-4 h-4 mr-2" />
                <span>{job.company}</span>
                {job.department && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{job.department}</span>
                  </>
                )}
              </div>

              <div className="flex items-center text-sm text-gray-600 mb-3">
                <MapPin className="w-4 h-4 mr-2" />
                <span>
                  {job.location.type.charAt(0).toUpperCase() + job.location.type.slice(1)}
                  {job.location.city && ` • ${job.location.city}`}
                  {job.location.state && `, ${job.location.state}`}
                </span>
                <span className="mx-2">•</span>
                <span>{job.employmentType}</span>
                <span className="mx-2">•</span>
                <span>{job.experienceLevel} level</span>
              </div>

              {job.applicationCounts && (
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{job.applicationCounts.total} applications</span>
                  {job.applicationCounts.new > 0 && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {job.applicationCounts.new} new
                    </span>
                  )}
                  {job.applicationCounts.interviewing > 0 && (
                    <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                      {job.applicationCounts.interviewing} interviewing
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Updated {formatDistanceToNow(new Date(job.updatedAt), { addSuffix: true })}
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/subadmin/jobs/${job._id}`)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/subadmin/jobs/${job._id}/edit`)}
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/subadmin/applications?jobId=${job._id}`)}>
                        View Applications
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/jobs/${job._id}/duplicate`)}>
                        Duplicate Job
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(`${window.location.origin}/jobs/${job._id}`)}>
                        Copy Job Link
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

  // Render jobs list
  const renderJobsList = () => {
    if (loading) {
      return renderLoading();
    }

    if (jobs.length === 0) {
      return (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No assigned jobs found</h3>
          <p className="text-muted-foreground mb-4">
            {activeTab === "all"
              ? searchTerm 
                ? `No jobs match your search "${searchTerm}"`
                : "You don't have any assigned jobs yet"
              : `No ${activeTab} jobs found`}
          </p>
          {activeTab === "all" && !searchTerm && (
            <p className="text-sm text-muted-foreground">
              Contact your admin to get jobs assigned to you, or create a new job posting.
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map(renderJobCard)}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="My Assigned Jobs"
        description="Manage and track your assigned job postings"
        actions={
          <Button
            onClick={() => router.push("/subadmin/jobs/create")}
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Create New Job
          </Button>
        }
      />

      {/* Filters and Search */}
      <div className="p-4 md:p-6 border-b bg-gray-50/50">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search jobs..."
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
                <SelectItem value="updatedAt-desc">Recently Updated</SelectItem>
                <SelectItem value="createdAt-desc">Recently Created</SelectItem>
                <SelectItem value="title-asc">Title A-Z</SelectItem>
                <SelectItem value="title-desc">Title Z-A</SelectItem>
                <SelectItem value="company-asc">Company A-Z</SelectItem>
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
                All Jobs ({counts.all})
              </TabsTrigger>
              <TabsTrigger value="active">
                Active ({counts.active})
              </TabsTrigger>
              <TabsTrigger value="draft">
                Drafts ({counts.draft})
              </TabsTrigger>
              <TabsTrigger value="closed">
                Closed ({counts.closed})
              </TabsTrigger>
              <TabsTrigger value="archived">
                Archived ({counts.archived})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="w-full">
              {renderJobsList()}
            </TabsContent>
          </Tabs>

          {/* Pagination could be added here */}
          {jobs.length > 0 && (
            <div className="flex justify-center mt-8">
              <div className="text-sm text-gray-500">
                Showing {jobs.length} of {counts.all} assigned jobs
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}