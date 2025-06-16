"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn-ui/button";
import { Badge } from "@/components/shadcn-ui/badge";
import { Checkbox } from "@/components/shadcn-ui/checkbox";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import {
  Search,
  SlidersHorizontal,
  Download,
  MoreHorizontal,
  AlignJustify,
  TableIcon,
  Eye,
  Star,
  MessageSquare,
  User,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Archive,
  Trash2,
  UserPlus,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SectionLoader } from "@/components/atoms/loader";
import { ApplicationsPagination } from "./ApplicationsPagination";
import { ApplicationFilters } from "./filters/ApplicationFilters";
import {
  ApplicationsTableView,
  ApplicationsGridView,
} from "./ApplicationViewComponents";
import { ApplicationActionDialogs } from "./dialogs/ApplicationActionDialogs";
import { useApplicationActions } from "@/hooks/useApplicationActions";

// Enhanced application interface
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

interface ApplicationsResponse {
  applications: ApplicationItem[];
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

interface FilterOptions {
  status: string;
  job: string;
  source: string;
  dateRange: string;
  assignedTo: string;
  matchScore: string;
  interviewStatus: string;
  rating: string;
  hasReview: string;
}

interface ApplicationsListViewProps {
  userRole: "admin" | "subadmin";
  userId?: string;
  jobId?: string;
}

export type ViewMode = "grid" | "table";

export function ApplicationsListView({
  userRole,
  userId,
  jobId,
}: ApplicationsListViewProps) {
  const router = useRouter();

  // Derive API endpoint and view base URL from user role
  const apiEndpoint =
    userRole === "admin" ? "/api/applications" : "/api/subadmin/applications";
  const viewBaseUrl =
    userRole === "admin" ? "/admin/applications" : "/subadmin/applications";

  // State management
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplications, setSelectedApplications] = useState<string[]>(
    []
  );
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("applicationDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Status counts
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

  // Advanced filters
  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    job: "all",
    source: "all",
    dateRange: "all",
    assignedTo: "all",
    matchScore: "all",
    interviewStatus: "all",
    rating: "all",
    hasReview: "all",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
  });

  // Initialize application actions
  const applicationActions = useApplicationActions({
    userRole,
    onSuccess: () => {
      fetchApplications(); // Refresh data after action
      setSelectedApplications([]); // Clear selection
    },
  });

  // Selection handlers
  const handleSelectApplication = (applicationId: string, checked: boolean) => {
    if (checked) {
      setSelectedApplications((prev) => [...prev, applicationId]);
    } else {
      setSelectedApplications((prev) =>
        prev.filter((id) => id !== applicationId)
      );
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApplications(applications.map((app) => app._id));
    } else {
      setSelectedApplications([]);
    }
  };

  // Navigation helpers
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Fetch applications
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

      // Apply jobId filter if provided
      if (jobId) {
        params.set("jobId", jobId);
      }

      // Apply status filter
      if (filters.status !== "all") {
        params.set("status", filters.status);
      }

      // Apply search
      if (searchTerm.trim()) {
        params.set("search", searchTerm.trim());
      }

      // Apply advanced filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() && value !== "all") {
          params.set(key, value);
        }
      });

      const response = await fetch(`${apiEndpoint}?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch applications");

      const data: ApplicationsResponse = await response.json();
      setApplications(data.applications || []);
      setCounts(data.counts || counts);

      setPagination({
        total: data.pagination?.total || 0,
        pages: data.pagination?.pages || 0,
      });
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    sortBy,
    sortOrder,
    filters,
    apiEndpoint,
    jobId,
  ]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchApplications();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Status helpers
  const getStatusColor = (status: string) => {
    const statusColors = {
      applied: "bg-blue-100 text-blue-800",
      screening: "bg-yellow-100 text-yellow-800",
      interview_scheduled: "bg-purple-100 text-purple-800",
      interviewed: "bg-orange-100 text-orange-800",
      offered: "bg-green-100 text-green-800",
      hired: "bg-emerald-100 text-emerald-800",
      rejected: "bg-red-100 text-red-800",
    };
    return (
      statusColors[status as keyof typeof statusColors] ||
      "bg-gray-100 text-gray-800"
    );
  };

  const getStatusLabel = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: "all",
      job: "all",
      source: "all",
      dateRange: "all",
      assignedTo: "all",
      matchScore: "all",
      interviewStatus: "all",
      rating: "all",
      hasReview: "all",
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Count applied filters
  const getAppliedFiltersCount = () => {
    let count = 0;
    if (searchTerm.trim()) count++;
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") count++;
    });
    return count;
  };

  // Render application content based on view mode
  const ApplicationContentRenderer = () => {
    if (loading) {
      return <SectionLoader message="Loading applications..." height="400px" />;
    }

    const commonProps = {
      applications,
      selectedApplications,
      onSelectApplication: handleSelectApplication,
      onSelectAll: handleSelectAll,
      viewBaseUrl,
      userRole,
      loading,
      applicationActions,
      getStatusColor,
      getStatusLabel,
    };

    switch (viewMode) {
      case "grid":
        return <ApplicationsGridView {...commonProps} />;
      case "table":
        return <ApplicationsTableView {...commonProps} />;
      default:
        return <ApplicationsGridView {...commonProps} />;
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-background rounded-lg">
        {/* Left section - Search and Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by candidate name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Sort dropdown */}
              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={(value) => {
                  const [field, order] = value.split("-");
                  setSortBy(field);
                  setSortOrder(order);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applicationDate-desc">
                    Newest First
                  </SelectItem>
                  <SelectItem value="applicationDate-asc">
                    Oldest First
                  </SelectItem>
                  <SelectItem value="candidate.lastName-asc">
                    Candidate A-Z
                  </SelectItem>
                  <SelectItem value="candidate.lastName-desc">
                    Candidate Z-A
                  </SelectItem>
                  <SelectItem value="status-asc">Status A-Z</SelectItem>
                  <SelectItem value="job.title-asc">Job Title A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Right section - View Controls and Actions */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
              {/* Selection indicator */}
              {selectedApplications.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="px-3 py-1">
                    {selectedApplications.length} selected
                  </Badge>
                </div>
              )}

              {/* Filter toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "transition-colors p-2 relative",
                  showFilters && "bg-muted border-primary text-primary"
                )}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {getAppliedFiltersCount() > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 w-5 p-0 text-xs flex items-center justify-center bg-foreground text-background rounded-full"
                  >
                    {getAppliedFiltersCount()}
                  </Badge>
                )}
              </Button>

              {/* Enhanced View mode toggle */}
              <div className="flex items-center gap-2 p-1 border rounded-lg bg-muted">
                {[
                  { mode: "grid" as ViewMode, label: "Grid", Icon: TableIcon },
                  {
                    mode: "table" as ViewMode,
                    label: "List",
                    Icon: AlignJustify,
                  },
                ].map(({ mode, label, Icon }) => {
                  const isActive = viewMode === mode;
                  return (
                    <Button
                      key={mode}
                      size="sm"
                      onClick={() => setViewMode(mode)}
                      className={cn(
                        "flex items-center gap-1 px-3 py-2 rounded-md transition-colors",
                        isActive
                          ? "bg-foreground text-background"
                          : "bg-background text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {label}
                    </Button>
                  );
                })}
              </div>

              {/* Export dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                  <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Bulk actions dropdown */}
              {selectedApplications.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4 mr-2" />
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>

                    <DropdownMenuItem
                      onClick={() =>
                        applicationActions.handleApplicationAction(
                          "status",
                          selectedApplications
                        )
                      }
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Change Status
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() =>
                        applicationActions.handleApplicationAction(
                          "assign",
                          selectedApplications
                        )
                      }
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign Recruiter
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() =>
                        applicationActions.handleApplicationAction(
                          "note",
                          selectedApplications
                        )
                      }
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add Note
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() =>
                        applicationActions.handleApplicationAction(
                          "archive",
                          selectedApplications
                        )
                      }
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() =>
                        applicationActions.handleApplicationAction(
                          "delete",
                          selectedApplications
                        )
                      }
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Advanced Filters Section */}
          {showFilters && (
            <ApplicationFilters
              filters={filters}
              setFilters={setFilters}
              resetFilters={resetFilters}
              getAppliedFiltersCount={getAppliedFiltersCount}
              userRole={userRole}
              jobId={jobId}
            />
          )}

          {/* Main Content */}
          <div className="space-y-6">
            <ApplicationContentRenderer />

            {/* Pagination */}
            {!loading && applications.length > 0 && (
              <ApplicationsPagination
                currentPage={currentPage}
                totalPages={pagination.pages}
                totalItems={pagination.total}
                itemsPerPage={itemsPerPage}
                onPageChange={goToPage}
                onItemsPerPageChange={(newItemsPerPage) => {
                  setItemsPerPage(newItemsPerPage);
                  setCurrentPage(1);
                }}
              />
            )}
          </div>

          {/* Application Action Dialogs */}
          <ApplicationActionDialogs
            showStatusDialog={applicationActions.showStatusDialog}
            setShowStatusDialog={applicationActions.setShowStatusDialog}
            showAssignDialog={applicationActions.showAssignDialog}
            setShowAssignDialog={applicationActions.setShowAssignDialog}
            showNoteDialog={applicationActions.showNoteDialog}
            setShowNoteDialog={applicationActions.setShowNoteDialog}
            showArchiveDialog={applicationActions.showArchiveDialog}
            setShowArchiveDialog={applicationActions.setShowArchiveDialog}
            showDeleteDialog={applicationActions.showDeleteDialog}
            setShowDeleteDialog={applicationActions.setShowDeleteDialog}
            applicationCount={selectedApplications.length}
            isBulkAction={selectedApplications.length > 1}
            actionData={applicationActions.actionData}
            setActionData={applicationActions.setActionData}
            onExecute={applicationActions.executeAction}
            users={applicationActions.users}
          />
        </div>
  );
}
