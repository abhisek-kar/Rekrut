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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn-ui/tabs";
import { Card, CardContent } from "@/components/shadcn-ui/card";
import { Button } from "@/components/shadcn-ui/button";
import { Badge } from "@/components/shadcn-ui/badge";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { FileText, Users, Eye, Calendar } from "lucide-react";

// Simple application interface for admin use
interface SimpleApplication {
  _id: string;
  candidate: {
    firstName: string;
    lastName: string;
    email: string;
  };
  job: {
    title: string;
    company: string;
  };
  status: string;
  applicationDate: string;
  matchingScore?: {
    overall: number;
  };
  source?: string;
}

export default function AdminApplicationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [applications, setApplications] = useState<SimpleApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch applications from API
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy: "applicationDate",
        sortOrder: "desc",
      });

      // Apply status filter based on active tab
      if (activeTab !== "all") {
        params.set("status", activeTab);
      }

      const response = await fetch(`/api/applications?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
      // Set empty array on error to prevent crashes
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeTab]);

  // Fetch applications when component mounts or dependencies change
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Get status counts
  const getStatusCounts = () => {
    const counts = {
      all: applications.length,
      applied: 0,
      screening: 0,
      interview_scheduled: 0,
      interviewed: 0,
      offered: 0,
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

  // Render loading state
  const renderLoading = () => {
    return (
      <div className="space-y-4">
        {Array(5)
          .fill(0)
          .map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    );
  };

  // Render application card
  const renderApplicationCard = (application: SimpleApplication) => {
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
      <Card key={application._id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">
                  {application.candidate.firstName} {application.candidate.lastName}
                </h3>
                <Badge
                  className={
                    statusColors[application.status as keyof typeof statusColors] ||
                    "bg-gray-100 text-gray-800"
                  }
                >
                  {application.status.replace("_", " ").charAt(0).toUpperCase() + 
                   application.status.replace("_", " ").slice(1)}
                </Badge>
              </div>
              
              <p className="text-muted-foreground mb-2">{application.candidate.email}</p>
              
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-3">
                <span className="bg-secondary px-2 py-1 rounded flex items-center">
                  <FileText className="w-3 h-3 mr-1" />
                  {application.job.title}
                </span>
                <span className="bg-secondary px-2 py-1 rounded">
                  {application.job.company}
                </span>
                {application.source && (
                  <span className="bg-secondary px-2 py-1 rounded">
                    {application.source}
                  </span>
                )}
                {application.matchingScore && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                    {application.matchingScore.overall}% match
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Applied: {new Date(application.applicationDate).toLocaleDateString()}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/admin/applications/${application._id}`)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/admin/applications/${application._id}/review`)}
                  >
                    Review
                  </Button>
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
          <p className="text-muted-foreground">
            {activeTab === "all" 
              ? "No applications have been submitted yet"
              : `No ${activeTab.replace("_", " ")} applications found`
            }
          </p>
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
      {/* Header with Breadcrumb */}
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
                <BreadcrumbLink href="/admin/applications">Applications</BreadcrumbLink>
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
                Applications Management
              </h1>
              <p className="text-muted-foreground">
                Manage all job applications across the platform
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>Total: {statusCounts.all} applications</span>
            </div>
          </div>

          {/* Status Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">
                All ({statusCounts.all})
              </TabsTrigger>
              <TabsTrigger value="applied">
                Applied ({statusCounts.applied})
              </TabsTrigger>
              <TabsTrigger value="screening">
                Screening ({statusCounts.screening})
              </TabsTrigger>
              <TabsTrigger value="interview_scheduled">
                Interview ({statusCounts.interview_scheduled})
              </TabsTrigger>
              <TabsTrigger value="interviewed">
                Interviewed ({statusCounts.interviewed})
              </TabsTrigger>
              <TabsTrigger value="offered">
                Offered ({statusCounts.offered})
              </TabsTrigger>
              <TabsTrigger value="hired">
                Hired ({statusCounts.hired})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({statusCounts.rejected})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="w-full">
              {renderApplicationsList()}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}