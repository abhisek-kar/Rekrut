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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { Switch } from "@/components/shadcn-ui/switch";
import { Label } from "@/components/shadcn-ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { JobType } from "@/types/job";

// Import job assignment components
import {
  AssignJobHeader,
  SubAdminList,
  SubAdminSearchFilter,
  AssignmentHistory
} from "@/components/organisms/jobs/job-assign";

interface SubAdmin {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePhoto?: string;
  status: string;
  assignedJobs: number;
  lastActive?: string;
}

interface AssignmentEvent {
  date: string;
  assignedBy: {
    name: string;
    email: string;
    profilePhoto?: string;
  };
  assignedTo: {
    name: string;
    email: string;
    profilePhoto?: string;
  };
}

interface JobAssignPageProps {
  params: {
    id: string;
  };
}

export default function JobAssignPage({ params }: JobAssignPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<JobType | null>(null);
  const [loading, setLoading] = useState(true);
  const [subadmins, setSubadmins] = useState<SubAdmin[]>([]);
  const [filteredSubadmins, setFilteredSubadmins] = useState<SubAdmin[]>([]);
  const [subadminsLoading, setSubadminsLoading] = useState(true);
  const [selectedSubAdmin, setSelectedSubAdmin] = useState<string | null>(null);
  const [notifySubadmin, setNotifySubadmin] = useState(true);
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentEvent[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    jobCount: "",
    lastActive: "",
  });

  // Fetch job data when component mounts
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/jobs/${params.id}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch job");
        }
        
        const data = await response.json();
        setJob(data.job);
        
        // Pre-select current assignee if any
        if (data.job.assignedTo) {
          setSelectedSubAdmin(data.job.assignedTo._id);
        }
      } catch (error) {
        console.error("Error fetching job:", error);
        toast.error("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchJob();
  }, [params.id]);

  // Fetch subadmins
  useEffect(() => {
    const fetchSubadmins = async () => {
      try {
        setSubadminsLoading(true);
        
        // Build query parameters
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "9", // 9 cards per page for 3x3 grid
          role: "subadmin",
        });
        
        const response = await fetch(`/api/users/subadmins?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch subadmins");
        }
        
        const data = await response.json();
        setSubadmins(data.users);
        setFilteredSubadmins(data.users);
        setTotalPages(data.pagination.pages);
      } catch (error) {
        console.error("Error fetching subadmins:", error);
        toast.error("Failed to load recruiters");
      } finally {
        setSubadminsLoading(false);
      }
    };
    
    fetchSubadmins();
  }, [currentPage]);

  // Fetch assignment history
  useEffect(() => {
    // Mock assignment history for now - would be replaced with real API call
    setHistoryLoading(true);
    
    // This would be an API call in a real implementation
    setTimeout(() => {
      const mockHistory: AssignmentEvent[] = job?.assignedTo ? [
        {
          date: new Date().toISOString(),
          assignedBy: {
            name: user?.firstName + " " + user?.lastName || "Admin User",
            email: user?.email || "admin@example.com",
          },
          assignedTo: {
            name: job.assignedTo.firstName + " " + job.assignedTo.lastName,
            email: job.assignedTo.email,
            profilePhoto: job.assignedTo.profilePhoto,
          },
        }
      ] : [];
      
      setAssignmentHistory(mockHistory);
      setHistoryLoading(false);
    }, 1000);
  }, [job, user]);

  // Apply search and filters
  useEffect(() => {
    let filtered = [...subadmins];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((subadmin) => 
        `${subadmin.firstName} ${subadmin.lastName}`.toLowerCase().includes(term) ||
        subadmin.email.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter((subadmin) => subadmin.status === filters.status);
    }
    
    // Apply job count filter
    if (filters.jobCount) {
      filtered = filtered.filter((subadmin) => {
        const count = subadmin.assignedJobs;
        switch (filters.jobCount) {
          case "none":
            return count === 0;
          case "low":
            return count >= 1 && count <= 5;
          case "medium":
            return count >= 6 && count <= 15;
          case "high":
            return count > 15;
          default:
            return true;
        }
      });
    }
    
    // Apply last active filter
    if (filters.lastActive) {
      // This would need proper implementation with real data
      // Just showing the filter logic here
    }
    
    setFilteredSubadmins(filtered);
  }, [subadmins, searchTerm, filters]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
      jobCount: "",
      lastActive: "",
    });
    setSearchTerm("");
  };

  // Handle subadmin selection
  const handleSelectSubAdmin = (id: string) => {
    setSelectedSubAdmin(id);
  };

  // Handle notification toggle
  const handleNotificationToggle = () => {
    setNotifySubadmin(!notifySubadmin);
  };

  // Handle job assignment
  const handleAssignJob = async () => {
    if (!selectedSubAdmin) {
      toast.error("Please select a recruiter to assign this job");
      return;
    }
    
    try {
      setSubmitting(true);
      
      const response = await fetch(`/api/jobs/${params.id}/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subadminId: selectedSubAdmin,
          notifySubadmin,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to assign job");
      }
      
      await response.json();
      
      toast.success("Job assigned successfully");
      
      // Navigate back to job detail page
      router.push(`/jobs/${params.id}`);
    } catch (error) {
      console.error("Error assigning job:", error);
      toast.error("Failed to assign job");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    router.push(`/jobs/${params.id}`);
  };

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
                  {loading ? "Job Details" : job?.title || "Job"}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/jobs/${params.id}/assign`}>
                  Assign
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Job Header */}
          <AssignJobHeader job={job} loading={loading} onBack={handleBack} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Recruiters */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Select Recruiter</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Search and Filter */}
                  <SubAdminSearchFilter
                    searchTerm={searchTerm}
                    filters={filters}
                    onSearchChange={handleSearchChange}
                    onFilterChange={handleFilterChange}
                    onResetFilters={resetFilters}
                  />

                  {/* SubAdmin List */}
                  <SubAdminList
                    loading={subadminsLoading}
                    subadmins={filteredSubadmins}
                    selectedSubAdmin={selectedSubAdmin}
                    onSelectSubAdmin={handleSelectSubAdmin}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Assignment Options & History */}
            <div className="space-y-6">
              {/* Assignment Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Assignment Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notify">Notify Recruiter</Label>
                      <p className="text-sm text-muted-foreground">
                        Send an email notification to the recruiter
                      </p>
                    </div>
                    <Switch
                      id="notify"
                      checked={notifySubadmin}
                      onCheckedChange={handleNotificationToggle}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full flex flex-col gap-2">
                    <Button
                      className="w-full"
                      onClick={handleAssignJob}
                      disabled={!selectedSubAdmin || submitting}
                    >
                      {submitting ? "Assigning..." : "Assign Job"}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleBack}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              {/* Assignment History */}
              <AssignmentHistory
                jobId={params.id}
                loading={historyLoading}
                history={assignmentHistory}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
