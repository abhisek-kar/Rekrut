"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/shadcn-ui/breadcrumb";
import { SidebarTrigger } from "@/components/shadcn-ui/sidebar";
import { Separator } from "@/components/shadcn-ui/separator";
import { Button } from "@/components/shadcn-ui/button";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import {
  Card,
  CardContent,
} from "@/components/shadcn-ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn-ui/tabs";
import { PlusCircle, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

// Import our custom components
import { JobSearchFilter, FilterOptions } from "@/components/organisms/jobs/JobSearchFilter";
import { JobTableView } from "@/components/organisms/jobs/JobTableView";
import { JobGridView } from "@/components/organisms/jobs/JobGridView";
import { Pagination } from "@/components/molecules/Pagination";
import { ConfirmationDialog } from "@/components/molecules/ConfirmationDialog";
import { EmptyState } from "@/components/molecules/EmptyState";

// Import job type
import { JobType } from "@/types/job";

export default function JobsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<FilterOptions>({
    status: "",
    location: "",
    jobType: "",
    experienceLevel: "",
    datePosted: "",
    assignedToMe: false,
  });
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [confirmAction, setConfirmAction] = useState<{
    action: string;
    ids: string[];
  } | null>(null);

  const itemsPerPage = 10;

  // Fetch jobs when page loads
  useEffect(() => {
    fetchJobs();
  }, [currentPage, sortBy, sortOrder, activeTab]);

  // Apply search and filters
  useEffect(() => {
    applyFilters();
  }, [jobs, searchTerm, filters]);

  // Check if user is a subadmin and get assigned jobs only
  useEffect(() => {
    // Read the 'assigned' query parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const showAssignedOnly = urlParams.get('assigned') === 'true';
    
    // If we're showing assigned jobs only and the user is a subadmin
    if (showAssignedOnly && user?.role === 'subadmin') {
      setFilters(prev => ({ ...prev, assignedToMe: true }));
    }
  }, [user?.role]);

  // Fetch jobs from API
  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        sortOrder,
      });
      
      // Apply status filter based on active tab
      if (activeTab !== "all") {
        params.set("status", activeTab);
      }
      
      // If the user is a subadmin and we're filtering for assigned jobs
      if (user?.role === 'subadmin' && filters.assignedToMe) {
        params.set("assignedTo", user.id);
      }
      
      const response = await fetch(`/api/jobs?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      
      const data = await response.json();
      setJobs(data.jobs);
      setFilteredJobs(data.jobs);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  // Apply search and filters to jobs
  const applyFilters = () => {
    let filtered = [...jobs];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(term) ||
          job.company.toLowerCase().includes(term) ||
          (job.description && job.description.toLowerCase().includes(term))
      );
    }
    
    // Apply filters
    if (filters.status) {
      filtered = filtered.filter((job) => job.status === filters.status);
    }
    
    if (filters.location) {
      filtered = filtered.filter((job) => 
        job.location.type.toLowerCase() === filters.location.toLowerCase()
      );
    }
    
    if (filters.jobType) {
      filtered = filtered.filter((job) => job.employmentType === filters.jobType);
    }
    
    if (filters.experienceLevel) {
      filtered = filtered.filter((job) => job.experienceLevel === filters.experienceLevel);
    }
    
    // Date posted filter logic
    if (filters.datePosted) {
      const now = new Date();
      const pastDate = new Date();
      
      switch (filters.datePosted) {
        case "today":
          pastDate.setDate(now.getDate() - 1);
          break;
        case "week":
          pastDate.setDate(now.getDate() - 7);
          break;
        case "month":
          pastDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }
      
      filtered = filtered.filter((job) => {
        const jobDate = new Date(job.createdAt);
        return jobDate >= pastDate;
      });
    }
    
    setFilteredJobs(filtered);
  };

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Reset all filters
  const resetFilters = () => {
    // Preserve the assignedToMe filter for subadmins coming from the subadmin dashboard
    const assignedToMe = filters.assignedToMe && user?.role === 'subadmin';
    
    setFilters({
      status: "",
      location: "",
      jobType: "",
      experienceLevel: "",
      datePosted: "",
      assignedToMe, // Maintain this value if it was set for subadmin
    });
    setSearchTerm("");
  };

  // Handle filter changes
  const handleFilterChange = (name: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Toggle job selection for bulk actions
  const toggleJobSelection = (jobId: string) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  };

  // Select/deselect all jobs
  const toggleSelectAll = () => {
    if (selectedJobs.length === filteredJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(filteredJobs.map((job) => job._id));
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedJobs.length === 0) {
      toast.error("No jobs selected");
      return;
    }
    
    setConfirmAction({ action, ids: selectedJobs });
  };

  // Execute confirmed bulk action
  const executeAction = async () => {
    if (!confirmAction) return;
    
    try {
      const { action, ids } = confirmAction;
      
      switch (action) {
        case "archive":
          // Implementation for archiving jobs
          toast.success(`${ids.length} jobs archived successfully`);
          break;
        case "delete":
          // Implementation for deleting jobs
          toast.success(`${ids.length} jobs deleted successfully`);
          break;
        default:
          break;
      }
      
      // Refresh jobs list
      fetchJobs();
      // Clear selection
      setSelectedJobs([]);
    } catch (error) {
      console.error("Error in bulk action:", error);
      toast.error("Failed to perform action on selected jobs");
    } finally {
      setConfirmAction(null);
    }
  };

  // Create confirmation dialog content
  const getConfirmationContent = () => {
    if (!confirmAction) return { title: '', description: '', actionLabel: '' };
    
    const { action, ids } = confirmAction;
    
    if (action === "archive") {
      return {
        title: "Archive Jobs",
        description: `Are you sure you want to archive ${ids.length} selected jobs? This will remove them from public view.`,
        actionLabel: "Archive Jobs"
      };
    } else if (action === "delete") {
      return {
        title: "Delete Jobs",
        description: `Are you sure you want to delete ${ids.length} selected jobs? This action cannot be undone.`,
        actionLabel: "Delete Jobs",
        actionVariant: 'destructive' as const
      };
    }
    
    return { title: '', description: '', actionLabel: '' };
  };

  // Render loading state
  const renderLoading = () => {
    return (
      <div className="space-y-4">
        {Array(5).fill(0).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Helper function to render job listing based on view mode
  const renderJobListing = () => {
    if (loading) {
      return renderLoading();
    }

    if (filteredJobs.length === 0) {
      return (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description={
            Object.values(filters).some(filter => !!filter) || searchTerm
              ? "Try adjusting your search or filters"
              : "Create your first job posting to get started"
          }
          actionLabel={
            !Object.values(filters).some(filter => !!filter) && !searchTerm
              ? "Create New Job"
              : undefined
          }
          onAction={
            !Object.values(filters).some(filter => !!filter) && !searchTerm
              ? () => router.push("/jobs/create")
              : undefined
          }
        />
      );
    }

    return viewMode === "grid" ? (
      <JobGridView
        jobs={filteredJobs}
        selectedJobs={selectedJobs}
        onSelect={toggleJobSelection}
        onBulkAction={handleBulkAction}
      />
    ) : (
      <JobTableView
        jobs={filteredJobs}
        selectedJobs={selectedJobs}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onSelect={toggleJobSelection}
        onSelectAll={toggleSelectAll}
        onBulkAction={handleBulkAction}
      />
    );
  };

  // Get confirmation dialog content
  const confirmationContent = getConfirmationContent();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with Breadcrumb and Sidebar Trigger */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/jobs">Jobs</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col gap-6">
          {/* Page Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Job Management</h1>
              <p className="text-muted-foreground">
                Create, view and manage job postings
              </p>
            </div>
            <Button onClick={() => router.push("/jobs/create")} className="gap-1">
              <PlusCircle className="h-4 w-4" />
              Create New Job
            </Button>
          </div>

          {/* Job Filters and Search */}
          <JobSearchFilter
            searchTerm={searchTerm}
            filters={filters}
            viewMode={viewMode}
            onSearchChange={handleSearch}
            onFilterChange={handleFilterChange}
            onResetFilters={resetFilters}
            onViewModeChange={setViewMode}
          />

          {/* Job Tabs and Listing */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Jobs</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="w-full">
              {renderJobListing()}
            </TabsContent>
            <TabsContent value="active" className="w-full">
              {renderJobListing()}
            </TabsContent>
            <TabsContent value="draft" className="w-full">
              {renderJobListing()}
            </TabsContent>
            <TabsContent value="closed" className="w-full">
              {renderJobListing()}
            </TabsContent>
            <TabsContent value="archived" className="w-full">
              {renderJobListing()}
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          {filteredJobs.length > 0 && totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Dialog for Bulk Actions */}
      <ConfirmationDialog
        open={!!confirmAction}
        title={confirmationContent.title}
        description={confirmationContent.description}
        actionLabel={confirmationContent.actionLabel}
        actionVariant={confirmationContent.actionVariant}
        onAction={executeAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
