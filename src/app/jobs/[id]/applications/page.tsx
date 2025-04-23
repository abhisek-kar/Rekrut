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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn-ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { JobType } from "@/types/job";

// Import application components that will be created next
import { 
  ApplicationsHeader, 
  ApplicationsTable, 
  ApplicationsFilter,
  ApplicationStatusBadge
} from "@/components/organisms/applications";
import { Pagination } from "@/components/molecules/Pagination";
import { EmptyState } from "@/components/molecules/EmptyState";
import { Users } from "lucide-react";

// Application types (to be moved to types/application.ts)
import { ApplicationType } from "@/types/application";

interface JobApplicationsPageProps {
  params: {
    id: string;
  };
}

export default function JobApplicationsPage({ params }: JobApplicationsPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<JobType | null>(null);
  const [applications, setApplications] = useState<ApplicationType[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ApplicationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobLoading, setJobLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    source: "",
    date: "",
    score: "",
  });
  const [sortBy, setSortBy] = useState("applicationDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);

  // Items per page for pagination
  const itemsPerPage = 10;

  // Fetch job data
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setJobLoading(true);
        const response = await fetch(`/api/jobs/${params.id}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch job");
        }
        
        const data = await response.json();
        setJob(data.job);
      } catch (error) {
        console.error("Error fetching job:", error);
        toast.error("Failed to load job details");
      } finally {
        setJobLoading(false);
      }
    };
    
    fetchJob();
  }, [params.id]);

  // Fetch applications for this job
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        
        // Build query parameters
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          sortBy,
          sortOrder,
          jobId: params.id,
        });
        
        // Add status filter if not "all"
        if (activeTab !== "all") {
          queryParams.set("status", activeTab);
        }
        
        const response = await fetch(`/api/applications?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch applications");
        }
        
        const data = await response.json();
        setApplications(data.applications);
        setFilteredApplications(data.applications);
        setTotalPages(data.pagination.pages);
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast.error("Failed to load applications");
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [params.id, currentPage, sortBy, sortOrder, activeTab]);

  // Apply search and filters
  useEffect(() => {
    let filtered = [...applications];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (application) =>
          application.candidate.firstName.toLowerCase().includes(term) ||
          application.candidate.lastName.toLowerCase().includes(term) ||
          application.candidate.email.toLowerCase().includes(term)
      );
    }
    
    // Apply filters
    if (filters.status) {
      filtered = filtered.filter((application) => application.status === filters.status);
    }
    
    if (filters.source) {
      filtered = filtered.filter((application) => application.source === filters.source);
    }
    
    if (filters.date) {
      const now = new Date();
      const pastDate = new Date();
      
      switch (filters.date) {
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
      
      filtered = filtered.filter((application) => {
        const applicationDate = new Date(application.applicationDate);
        return applicationDate >= pastDate;
      });
    }
    
    if (filters.score) {
      const scoreRange = filters.score.split('-');
      if (scoreRange.length === 2) {
        const minScore = parseInt(scoreRange[0]);
        const maxScore = parseInt(scoreRange[1]);
        
        filtered = filtered.filter(
          (application) => 
            application.matchingScore?.overall >= minScore && 
            application.matchingScore?.overall <= maxScore
        );
      }
    }
    
    setFilteredApplications(filtered);
  }, [applications, searchTerm, filters]);

  // Handle search input change
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Handle filter changes
  const handleFilterChange = (name: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      status: "",
      source: "",
      date: "",
      score: "",
    });
    setSearchTerm("");
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

  // Handle application selection
  const toggleApplicationSelection = (applicationId: string) => {
    setSelectedApplications((prev) =>
      prev.includes(applicationId)
        ? prev.filter((id) => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  // Select/deselect all applications
  const toggleSelectAll = () => {
    if (selectedApplications.length === filteredApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(filteredApplications.map((app) => app._id));
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedApplications.length === 0) {
      toast.error("No applications selected");
      return;
    }
    
    try {
      const response = await fetch(`/api/applications/bulk-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: selectedApplications,
          status,
          reason: `Bulk update by ${user?.firstName} ${user?.lastName}`,
          notify: true,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update applications");
      }
      
      // Refresh applications
      const updatedAppsResponse = await fetch(`/api/applications?jobId=${params.id}`);
      const data = await updatedAppsResponse.json();
      setApplications(data.applications);
      
      // Clear selection
      setSelectedApplications([]);
      
      toast.success(`${selectedApplications.length} applications updated to ${status}`);
    } catch (error) {
      console.error("Error updating applications:", error);
      toast.error("Failed to update applications");
    }
  };

  // Get application status counts
  const getStatusCounts = () => {
    const counts = {
      all: applications.length,
      applied: 0,
      screening: 0,
      interview: 0,
      offer: 0,
      hired: 0,
      rejected: 0,
    };
    
    applications.forEach((app) => {
      const status = app.status as keyof typeof counts;
      if (counts.hasOwnProperty(status)) {
        counts[status]++;
      }
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();

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
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/jobs/${params.id}`}>
                  {jobLoading ? "Job Details" : job?.title || "Job"}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/jobs/${params.id}/applications`}>
                  Applications
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <ApplicationsHeader 
            job={job}
            loading={jobLoading}
            totalApplications={applications.length}
            selectedCount={selectedApplications.length}
            onBulkStatusUpdate={handleBulkStatusUpdate}
            onBackToJob={() => router.push(`/jobs/${params.id}`)}
          />

          {/* Applications Filter */}
          <ApplicationsFilter
            searchTerm={searchTerm}
            filters={filters}
            onSearchChange={handleSearch}
            onFilterChange={handleFilterChange}
            onResetFilters={resetFilters}
          />

          {/* Status Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                All ({statusCounts.all})
              </TabsTrigger>
              <TabsTrigger value="applied">
                Applied ({statusCounts.applied})
              </TabsTrigger>
              <TabsTrigger value="screening">
                Screening ({statusCounts.screening})
              </TabsTrigger>
              <TabsTrigger value="interview">
                Interview ({statusCounts.interview})
              </TabsTrigger>
              <TabsTrigger value="offer">
                Offer ({statusCounts.offer})
              </TabsTrigger>
              <TabsTrigger value="hired">
                Hired ({statusCounts.hired})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({statusCounts.rejected})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="w-full">
              {loading ? (
                <div className="space-y-4">
                  {/* Loading skeleton would go here */}
                  <p>Loading applications...</p>
                </div>
              ) : filteredApplications.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No applications found"
                  description={
                    Object.values(filters).some((filter) => !!filter) || searchTerm
                      ? "Try adjusting your search or filters"
                      : `No ${activeTab !== 'all' ? activeTab : ''} applications yet for this job`
                  }
                />
              ) : (
                <ApplicationsTable
                  applications={filteredApplications}
                  selectedApplications={selectedApplications}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  onSelect={toggleApplicationSelection}
                  onSelectAll={toggleSelectAll}
                  onStatusUpdate={handleBulkStatusUpdate}
                  onViewApplication={(id) => router.push(`/applications/${id}`)}
                />
              )}
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          {filteredApplications.length > 0 && totalPages > 1 && (
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
    </div>
  );
}
