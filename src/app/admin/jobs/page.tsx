"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Card, CardContent } from "@/components/shadcn-ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn-ui/tabs";
import { PlusCircle, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { SectionLoader } from "@/components/atoms/loader";

// Simple job type for this page
interface SimpleJob {
  _id: string;
  title: string;
  company: string;
  status: string;
  location: {
    type: string;
    city?: string;
  };
  employmentType: string;
  experienceLevel: string;
  createdAt: string;
  assignedTo?: {
    firstName: string;
    lastName: string;
  };
}

export default function AdminJobsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [jobs, setJobs] = useState<SimpleJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch jobs from API
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      // Apply status filter based on active tab
      if (activeTab !== "all") {
        params.set("status", activeTab);
      }

      const response = await fetch(`/api/jobs?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
      // Set empty array on error to prevent crashes
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeTab]);

  // Fetch jobs when component mounts or dependencies change
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Render loading state
  const renderLoading = () => {
    return <SectionLoader message="Loading jobs..." height="400px" />;
  };

  // Render job card
  const renderJobCard = (job: SimpleJob) => {
    const statusColors = {
      draft: "bg-gray-100 text-gray-800",
      active: "bg-green-100 text-green-800",
      closed: "bg-red-100 text-red-800",
      archived: "bg-yellow-100 text-yellow-800",
    };

    return (
      <Card key={job._id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{job.title}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    statusColors[job.status as keyof typeof statusColors] ||
                    "bg-gray-100 text-gray-800"
                  }`}
                >
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
              </div>
              
              <p className="text-muted-foreground mb-2">{job.company}</p>
              
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-3">
                <span className="bg-secondary px-2 py-1 rounded">
                  {job.location.type}
                  {job.location.city && ` • ${job.location.city}`}
                </span>
                <span className="bg-secondary px-2 py-1 rounded">
                  {job.employmentType}
                </span>
                <span className="bg-secondary px-2 py-1 rounded">
                  {job.experienceLevel} level
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Created: {new Date(job.createdAt).toLocaleDateString()}
                  {job.assignedTo && (
                    <span className="ml-4">
                      Assigned to: {job.assignedTo.firstName} {job.assignedTo.lastName}
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/jobs/${job._id}`)}
                  >
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/jobs/${job._id}/edit`)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render job listing
  const renderJobListing = () => {
    if (loading) {
      return renderLoading();
    }

    if (jobs.length === 0) {
      return (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No jobs found</h3>
          <p className="text-muted-foreground mb-4">
            {activeTab === "all" 
              ? "Get started by creating your first job posting"
              : `No ${activeTab} jobs found`
            }
          </p>
          {activeTab === "all" && (
            <Button onClick={() => router.push("/admin/jobs/create")}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Job
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {jobs.map(renderJobCard)}
      </div>
    );
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
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/jobs">Jobs</BreadcrumbLink>
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
              <h1 className="text-3xl font-bold tracking-tight">
                Jobs Management
              </h1>
              <p className="text-muted-foreground">
                Manage all job postings across the platform
              </p>
            </div>
            <Button
              onClick={() => router.push("/admin/jobs/create")}
              className="gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              Create New Job
            </Button>
          </div>

          {/* Job Tabs and Listing */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-6">
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
        </div>
      </main>
    </div>
  );
}