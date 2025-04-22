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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn-ui/tabs";
import { toast } from "sonner";
import { Briefcase, ArrowLeft } from "lucide-react";

// Import our components
import {
  JobHeader,
  JobDetailsCard,
  ApplicationSettingsCard,
  JobAssignmentCard,
  CustomFieldsCard,
  ApplicationsTab,
  AnalyticsTab,
  ActivityTab
} from "@/components/organisms/jobs/job-detail";

import { JobType } from "@/types/job";
import { useAuth } from "@/hooks/useAuth";

interface JobDetailProps {
  params: {
    id: string;
  };
}

export default function JobDetailPage({ params }: JobDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<JobType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [assignedRecruiter, setAssignedRecruiter] = useState(null);
  const [stats, setStats] = useState({
    views: 0,
    applications: 0,
    shares: 0,
    hires: 0,
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
        
        // Fetch job statistics
        const statsResponse = await fetch(`/api/jobs/stats/${params.id}`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.stats);
        }
        
        // Fetch assigned recruiter if any
        if (data.job.assignedTo) {
          const userResponse = await fetch(`/api/users/subadmins/${data.job.assignedTo}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setAssignedRecruiter(userData.user);
          }
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

  // Handle job status update
  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/jobs/${params.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: newStatus,
          reason: `Status updated by ${user?.firstName || 'admin'}`
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update job status");
      }
      
      const data = await response.json();
      setJob(data.job);
      
      toast.success(`Job status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating job status:", error);
      toast.error("Failed to update job status");
    }
  };

  // Handle job deletion
  const handleDeleteJob = async () => {
    if (!confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/jobs/${params.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete job");
      }
      
      toast.success("Job deleted successfully");
      router.push("/jobs");
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job");
    }
  };

  // Handle job duplication
  const handleDuplicateJob = async () => {
    try {
      // Create a new job with the same details but as a draft
      const jobToDuplicate = {
        ...job,
        title: `${job?.title} (Copy)`,
        status: "draft",
      };
      
      // Remove id and timestamps
      delete jobToDuplicate._id;
      delete jobToDuplicate.createdAt;
      delete jobToDuplicate.updatedAt;
      
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobToDuplicate),
      });
      
      if (!response.ok) {
        throw new Error("Failed to duplicate job");
      }
      
      const data = await response.json();
      
      toast.success("Job duplicated successfully");
      router.push(`/jobs/${data.job._id}`);
    } catch (error) {
      console.error("Error duplicating job:", error);
      toast.error("Failed to duplicate job");
    }
  };

  // Handle job assignment
  const handleAssignRecruiter = () => {
    router.push(`/jobs/${params.id}/assign`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="h-6 bg-gray-200 rounded w-80 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
        <p className="text-muted-foreground mb-6">The job you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/jobs")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>
      </div>
    );
  }

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
                <BreadcrumbLink href={`/jobs/${params.id}`}>{job.title}</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col gap-6 max-w-6xl mx-auto">
          {/* Job Header */}
          <JobHeader 
            job={job}
            onStatusUpdate={handleStatusUpdate}
            onDuplicate={handleDuplicateJob}
            onDelete={handleDeleteJob}
            onAssignRecruiter={handleAssignRecruiter}
          />

          {/* Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="applications">
                Applications ({stats.applications})
              </TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* Job Details Card */}
              <JobDetailsCard job={job} />

              {/* Application Settings Card */}
              <ApplicationSettingsCard job={job} />
              
              {/* Job Assignment Card */}
              <JobAssignmentCard 
                assignedRecruiter={assignedRecruiter}
                onAssignRecruiter={handleAssignRecruiter}
              />
              
              {/* Custom Fields Card (Only shown if there are custom fields) */}
              <CustomFieldsCard job={job} />
            </TabsContent>
            
            <TabsContent value="applications" className="space-y-6">
              <ApplicationsTab jobId={params.id} applicationsCount={stats.applications} />
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsTab stats={stats} />
            </TabsContent>
            
            <TabsContent value="activity" className="space-y-6">
              <ActivityTab jobId={params.id} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
