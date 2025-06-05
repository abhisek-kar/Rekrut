"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn-ui/button";
import { Badge } from "@/components/shadcn-ui/badge";
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
  DropdownMenuLabel,
} from "@/components/shadcn-ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  Table as TableIcon,
  Download,
  Trash2,
  Archive,
  SlidersHorizontal,
  AlignJustify,
  CheckCircle,
  Eye,
  Star,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { JobGridView, JobTableView } from "./JobViewComponents";
import { JobsPagination } from "./JobsPagination";
import { SectionLoader } from "@/components/atoms/loader";
import { JobActionDialogs } from "./dialogs/JobActionDialogs";
import { JobFilters } from "./filters/JobFilters";
import { useJobActions } from "@/hooks/useJobActions";

// Enhanced job interface
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
  visibility: string; // 'public' | 'private'
  featured: boolean;
  isTemplate?: boolean;
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

interface JobsResponse {
  jobs: JobItem[];
  counts: {
    all: number;
    active: number;
    draft: number;
    closed: number;
    archived: number;
    paused: number;
    pending_review: number;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface JobsListViewProps {
  userRole: "admin" | "subadmin";
  apiEndpoint: string;
  createUrl: string;
  viewBaseUrl: string;
  editBaseUrl: string;
}

export type ViewMode = "grid" | "table";

export function JobsListView({
  userRole,
  apiEndpoint,
  createUrl,
  viewBaseUrl,
  editBaseUrl,
}: JobsListViewProps) {
  const router = useRouter();

  // State management
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Advanced filters
  const [filters, setFilters] = useState({
    status: "all",
    department: "all",
    employmentType: "all",
    experienceLevel: "all",
    locationType: "all",
    assignedTo: "all",
    dateRange: "all",
    visibility: "all", // 'all' | 'public' | 'private'
    featured: "all", // 'all' | 'true' | 'false'
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
  });

  // Bulk actions using unified job actions hook
  const jobActions = useJobActions({
    userRole,
    onSuccess: () => {
      setSelectedJobs([]);
      fetchJobs();
    },
  });

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder,
      });

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
      if (!response.ok) throw new Error("Failed to fetch jobs");

      const data: JobsResponse = await response.json();
      setJobs(data.jobs || []);

      setPagination({
        total: data.pagination?.total || 0,
        pages: data.pagination?.pages || 0,
      });
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
      setJobs([]);
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
  ]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Fetch users for assignment (only for admin)
  useEffect(() => {
    if (userRole === "admin") {
      jobActions.fetchUsers();
    }
  }, [userRole, jobActions.fetchUsers]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchJobs();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

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
      case "paused":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending_review":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  // Bulk actions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedJobs(jobs.map((job) => job._id));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleSelectJob = (jobId: string, checked: boolean) => {
    if (checked) {
      setSelectedJobs((prev) => [...prev, jobId]);
    } else {
      setSelectedJobs((prev) => prev.filter((id) => id !== jobId));
    }
  };

  // Export functionality
  const handleExport = async (format: string) => {
    try {
      const params = new URLSearchParams({
        format,
        search: searchTerm,
        ...filters,
      });

      const response = await fetch(
        `${apiEndpoint}/export?${params.toString()}`
      );
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jobs-export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Jobs exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to export jobs");
    }
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: "all",
      department: "all",
      employmentType: "all",
      experienceLevel: "all",
      locationType: "all",
      assignedTo: "all",
      dateRange: "all",
      visibility: "all",
      featured: "all",
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

  // Render job content based on view mode
  const JobContentRenderer = () => {
    if (loading) {
      return <SectionLoader message="Loading jobs..." height="400px" />;
    }

    const commonProps = {
      jobs,
      selectedJobs,
      onSelectJob: handleSelectJob,
      onSelectAll: handleSelectAll,
      viewBaseUrl,
      editBaseUrl,
      userRole,
      loading,
      jobActions,
    };

    switch (viewMode) {
      case "grid":
        return <JobGridView {...commonProps} />;
      case "table":
        return <JobTableView {...commonProps} />;
      default:
        return <JobGridView {...commonProps} />;
    }
  };

  // Render components will be continued...
  return (
    <div className="flex flex-col space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-background rounded-lg ">
        {/* Left section - Search and Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search jobs by title, company, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>

          {/* Sort */}
          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={(value) => {
              const [field, order] = value.split("-");
              setSortBy(field);
              setSortOrder(order);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-48 bg-background">
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

        {/* Right section - View Controls and Actions */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          {/* Selection indicator */}
          {selectedJobs.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                {selectedJobs.length} selected
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
              { mode: "table" as ViewMode, label: "List", Icon: AlignJustify },
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
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("xlsx")}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bulk actions */}
          {selectedJobs.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  Actions ({selectedJobs.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                
                <DropdownMenuItem onClick={() => jobActions.handleJobAction("status", selectedJobs)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Change Status
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => jobActions.handleJobAction("visibility", selectedJobs)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Change Visibility
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => jobActions.handleJobAction("feature", selectedJobs)}>
                  <Star className="h-4 w-4 mr-2" />
                  Feature Actions
                </DropdownMenuItem>
                
                {userRole === "admin" && jobActions.users.length > 0 && (
                  <DropdownMenuItem onClick={() => jobActions.handleJobAction("assign", selectedJobs)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign Jobs
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => jobActions.handleJobAction("archive", selectedJobs)}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Jobs
                </DropdownMenuItem>
                
                <DropdownMenuItem
                  onClick={() => jobActions.handleJobAction("delete", selectedJobs)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Jobs
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Advanced Filters Section */}
      {showFilters && (
        <JobFilters
          filters={filters}
          setFilters={setFilters}
          resetFilters={resetFilters}
          getAppliedFiltersCount={getAppliedFiltersCount}
          userRole={userRole}
        />
      )}

      {/* Main Content */}
      <div className="space-y-6">
        <JobContentRenderer />

        {/* Pagination */}
        {!loading && jobs.length > 0 && (
          <JobsPagination
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

      {/* Unified Job Action Dialogs */}
      <JobActionDialogs
        showStatusDialog={jobActions.showStatusDialog}
        setShowStatusDialog={jobActions.setShowStatusDialog}
        showVisibilityDialog={jobActions.showVisibilityDialog}
        setShowVisibilityDialog={jobActions.setShowVisibilityDialog}
        showFeatureDialog={jobActions.showFeatureDialog}
        setShowFeatureDialog={jobActions.setShowFeatureDialog}
        showAssignDialog={jobActions.showAssignDialog}
        setShowAssignDialog={jobActions.setShowAssignDialog}
        showArchiveDialog={jobActions.showArchiveDialog}
        setShowArchiveDialog={jobActions.setShowArchiveDialog}
        showDeleteDialog={jobActions.showDeleteDialog}
        setShowDeleteDialog={jobActions.setShowDeleteDialog}
        jobCount={selectedJobs.length}
        isBulkAction={selectedJobs.length > 1}
        actionData={jobActions.actionData}
        setActionData={jobActions.setActionData}
        onExecute={jobActions.executeAction}
        users={jobActions.users}
        loadingUsers={jobActions.loadingUsers}
        userRole={userRole}
      />
    </div>
  );
}
