"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn-ui/button";
import { Card, CardContent } from "@/components/shadcn-ui/card";
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
  DropdownMenuCheckboxItem,
} from "@/components/shadcn-ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn-ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn-ui/tabs";
import {
  Search,
  Filter,
  MoreHorizontal,
  Grid3X3,
  Table as TableIcon,
  Eye,
  Edit3,
  Calendar,
  MapPin,
  Briefcase,
  Users,
  Download,
  Trash2,
  Copy,
  Archive,
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  SlidersHorizontal,
  AlignJustify,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { JobGridView, JobTableView } from "./JobViewComponents";
import { JobsPagination } from "./JobsPagination";
import { SectionLoader } from "@/components/atoms/loader";

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
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Advanced filters
  const [filters, setFilters] = useState({
    department: "all",
    employmentType: "all",
    experienceLevel: "all",
    locationType: "all",
    assignedTo: "all",
    dateRange: "all",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
  });

  // Counts for tabs
  const [counts, setCounts] = useState({
    all: 0,
    active: 0,
    draft: 0,
    closed: 0,
    archived: 0,
  });

  // Bulk actions dialog
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>("");

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
      if (activeTab !== "all") {
        params.set("status", activeTab);
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
      setCounts(
        data.counts || {
          all: 0,
          active: 0,
          draft: 0,
          closed: 0,
          archived: 0,
        }
      );
      setPagination({
        total: data.pagination?.total || 0,
        pages: data.pagination?.pages || 0,
      });
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
      setJobs([]);
      // Reset counts to default on error
      setCounts({
        all: 0,
        active: 0,
        draft: 0,
        closed: 0,
        archived: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    activeTab,
    searchTerm,
    sortBy,
    sortOrder,
    filters,
    apiEndpoint,
  ]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

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
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Selection handlers
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

  // Bulk actions
  const handleBulkAction = async (action: string) => {
    setBulkAction(action);
    setShowBulkDialog(true);
  };

  const executeBulkAction = async () => {
    try {
      // Implementation depends on your API
      const response = await fetch(`${apiEndpoint}/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: bulkAction,
          jobIds: selectedJobs,
        }),
      });

      if (!response.ok) throw new Error("Bulk action failed");

      toast.success(`Bulk ${bulkAction} completed successfully`);
      setSelectedJobs([]);
      fetchJobs();
    } catch (error) {
      toast.error(`Failed to ${bulkAction} selected jobs`);
    } finally {
      setShowBulkDialog(false);
    }
  };

  // Export functionality
  const handleExport = async (format: string) => {
    try {
      const params = new URLSearchParams({
        format,
        status: activeTab !== "all" ? activeTab : "",
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
      department: "all",
      employmentType: "all",
      experienceLevel: "all",
      locationType: "all",
      assignedTo: "all",
      dateRange: "all",
    });
    setSearchTerm("");
    setActiveTab("all");
    setCurrentPage(1);
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
              "transition-colors p-2",
              showFilters && "bg-muted border-primary text-primary"
            )}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
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
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBulkAction("archive")}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("close")}>
                  <X className="h-4 w-4 mr-2" />
                  Close Selected
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleBulkAction("delete")}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Advanced Filters Section */}
      {showFilters && (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Advanced Filters
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Department
                </label>
                <Select
                  value={filters.department}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, department: value }))
                  }
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Employment Type
                </label>
                <Select
                  value={filters.employmentType}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, employmentType: value }))
                  }
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Experience Level
                </label>
                <Select
                  value={filters.experienceLevel}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, experienceLevel: value }))
                  }
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Location Type
                </label>
                <Select
                  value={filters.locationType}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, locationType: value }))
                  }
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="onsite">Onsite</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Quick Actions
                </label>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="w-full bg-background"
                  size="sm"
                >
                  Reset All Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          setCurrentPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="all">All ({counts?.all || 0})</TabsTrigger>
          <TabsTrigger value="active">
            Active ({counts?.active || 0})
          </TabsTrigger>
          <TabsTrigger value="draft">Drafts ({counts?.draft || 0})</TabsTrigger>
          <TabsTrigger value="closed">
            Closed ({counts?.closed || 0})
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archived ({counts?.archived || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
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
        </TabsContent>
      </Tabs>

      {/* Bulk action confirmation dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {bulkAction} {selectedJobs.length}{" "}
              selected job(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={executeBulkAction}
              variant={bulkAction === "delete" ? "destructive" : "default"}
            >
              Confirm {bulkAction}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
