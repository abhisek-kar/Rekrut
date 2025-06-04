"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn-ui/button";
import { Badge } from "@/components/shadcn-ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn-ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import { toast } from "sonner";
import {
  ArrowLeft,
  Eye,
  Edit3,
  MoreHorizontal,
  Share2,
  FileText,
  UserPlus,
} from "lucide-react";

// Import job detail components
import {
  JobHeader,
  JobDetailsCard,
  ApplicationSettingsCard,
  JobAssignmentCard,
  CustomFieldsCard,
  ApplicationsTab,
  AnalyticsTab,
  ActivityTab,
  DocumentsTab,
} from "@/components/organisms/jobs/job-detail";

import { JobType } from "@/types/job";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionLoader } from "@/components/atoms/loader";

interface SharedJobViewProps {
  jobId: string;
  userRole: "admin" | "subadmin";
}

export default function SharedJobView({ jobId, userRole }: SharedJobViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<JobType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch job data
  useEffect(() => {
    fetchJobData();
  }, [jobId]);

  const fetchJobData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/jobs/${jobId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch job data");
      }

      const data = await response.json();

      // For subadmin, verify they have access to this job
      if (userRole === "subadmin" && data.job.assignedTo?._id !== user?.id) {
        toast.error("You don't have permission to view this job");
        router.push("/subadmin/jobs");
        return;
      }

      setJob(data.job);
    } catch (error) {
      console.error("Error fetching job:", error);
      toast.error("Failed to load job details");
      // Redirect based on role
      router.push(userRole === "admin" ? "/admin/jobs" : "/subadmin/jobs");
    } finally {
      setLoading(false);
    }
  };

  // Get role-based routes
  const getRoutes = () => {
    const prefix = userRole === "admin" ? "/admin" : "/subadmin";
    return {
      jobsList: `${prefix}/jobs`,
      jobView: `${prefix}/jobs/${jobId}`,
      jobEdit: `${prefix}/jobs/${jobId}/edit`,
      publicView: `${prefix}/jobs/${jobId}/preview`,
      applications: `${prefix}/applications?jobId=${jobId}`,
      assign: userRole === "admin" ? `/admin/jobs/${jobId}/assign` : null,
    };
  };

  const routes = getRoutes();

 

  // Get status color based on job status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "paused":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "closed":
        return "bg-red-100 text-red-800 border-red-200";
      case "archived":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update job status");
      }

      await fetchJobData(); // Refresh job data
      toast.success(`Job ${newStatus} successfully`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update job status");
    }
  };

  // Copy job link
  const copyJobLink = () => {
    const publicUrl = `${window.location.origin}/apply/${jobId}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success("Public job link copied to clipboard");
  };

  // Handle job assignment (admin only)
  const handleAssignRecruiter = () => {
    if (userRole === "admin" && routes.assign) {
      router.push(routes.assign);
    }
  };

  // Handle job deletion
  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this job? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete job");
      }

      toast.success("Job deleted successfully");
      router.push(routes.jobsList);
    } catch (error) {
      toast.error("Failed to delete job");
    }
  };

  if (loading) {
    return <SectionLoader message="Fetching job details..." height="400px" />;
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Job not found</h2>
          <p className="text-muted-foreground mb-4">
            The job you're looking for doesn't exist or you don't have access to
            it.
          </p>
          <Button onClick={() => router.push(routes.jobsList)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <PageHeader
        title={"Job Details"}
        description={"View and manage job details"}
        actions={
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(job.status)}>
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </Badge>
            <Button
              variant="outline"
              onClick={() => router.push(routes.publicView)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(routes.jobEdit)}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={copyJobLink}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Copy Job Link
                </DropdownMenuItem>

                {userRole === "admin" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleAssignRecruiter}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Assign Recruiter
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleStatusChange("active")}
                  disabled={job.status === "active"}
                >
                  Publish Job
                </DropdownMenuItem>
                {/* <DropdownMenuItem 
                  onClick={() => handleStatusChange("draaft")} 
                  disabled={job.status === "draft"}
                >
                  Pause Job
                </DropdownMenuItem> */}
                <DropdownMenuItem
                  onClick={() => handleStatusChange("closed")}
                  disabled={job.status === "closed"}
                >
                  Close Job
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  Delete Job
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <JobDetailsCard job={job} />
              <ApplicationSettingsCard job={job} />
              <CustomFieldsCard job={job} />
              <JobAssignmentCard
                userRole={userRole}
                onAssignRecruiter={handleAssignRecruiter}
              />
            </TabsContent>

            <TabsContent value="applications">
              <ApplicationsTab
                jobId={jobId}
                userRole={userRole}
                applicationsCount={4} // Placeholder, replace with actual count
              />
            </TabsContent>

            <TabsContent value="analytics">
              <AnalyticsTab jobId={jobId} userRole={userRole} />
            </TabsContent>

            <TabsContent value="activity">
              <ActivityTab jobId={jobId} userRole={userRole} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
