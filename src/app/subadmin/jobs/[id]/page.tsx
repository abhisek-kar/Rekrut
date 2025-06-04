"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/shadcn-ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { Badge } from "@/components/shadcn-ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn-ui/tabs";
import { Separator } from "@/components/shadcn-ui/separator";
import {
  ArrowLeft,
  Edit3,
  Users,
  Eye,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Clock,
  Share2,
  MoreHorizontal,
  UserPlus,
  FileText,
  Settings
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { SectionLoader } from "@/components/atoms/loader";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatDistanceToNow, format } from "date-fns";

interface JobDetail {
  _id: string;
  title: string;
  company: string;
  department?: string;
  location: {
    type: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  description: string;
  responsibilities?: string;
  requirements?: string;
  skills: string[];
  experienceLevel: string;
  employmentType: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    visible: boolean;
  };
  benefits?: string[];
  applicationDeadline?: string;
  expectedStartDate?: string;
  status: string;
  visibility: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedTo?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface ApplicationSummary {
  total: number;
  byStatus: {
    applied: number;
    screening: number;
    interview_scheduled: number;
    interviewed: number;
    offered: number;
    hired: number;
    rejected: number;
  };
  recent: {
    _id: string;
    candidate: {
      firstName: string;
      lastName: string;
      email: string;
    };
    status: string;
    applicationDate: string;
  }[];
}

export default function SubAdminJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [applications, setApplications] = useState<ApplicationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const jobId = params.id as string;

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
      fetchApplications();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch job details");
      }
      const data = await response.json();
      
      // Verify this job is assigned to the current SubAdmin
      if (data.job.assignedTo?._id !== user?.id) {
        toast.error("You don't have access to this job");
        router.push("/subadmin/jobs");
        return;
      }
      
      setJob(data.job);
    } catch (error) {
      console.error("Error fetching job details:", error);
      toast.error("Failed to load job details");
      router.push("/subadmin/jobs");
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch(`/api/applications?jobId=${jobId}&summary=true`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.summary);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setJob(prev => prev ? { ...prev, status: newStatus } : null);
        toast.success(`Job status updated to ${newStatus}`);
      } else {
        throw new Error("Failed to update job status");
      }
    } catch (error) {
      console.error("Error updating job status:", error);
      toast.error("Failed to update job status");
    }
  };

  const copyJobLink = () => {
    const publicJobUrl = `${window.location.origin}/jobs/${jobId}`;
    navigator.clipboard.writeText(publicJobUrl);
    toast.success("Job link copied to clipboard");
  };

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

  if (loading) {
    return <SectionLoader message="Loading job details..." height="100vh" />;
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Job not found</h2>
          <p className="text-muted-foreground mb-4">
            The job you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => router.push("/subadmin/jobs")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/subadmin/jobs")}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <p className="text-muted-foreground">{job.company}</p>
            </div>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(job.status)}>
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </Badge>
            <Button
              variant="outline"
              onClick={() => router.push(`/jobs/${jobId}`)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/jobs/${jobId}/edit`)}
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
                <DropdownMenuItem onClick={() => router.push(`/jobs/${jobId}/duplicate`)}>
                  <FileText className="w-4 h-4 mr-2" />
                  Duplicate Job
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleStatusChange("active")} disabled={job.status === "active"}>
                  Publish Job
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("closed")} disabled={job.status === "closed"}>
                  Close Job
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("archived")} disabled={job.status === "archived"}>
                  Archive Job
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <main className="flex-1 p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">
              Applications ({applications?.total || 0})
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Job Info */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {job.location.type.charAt(0).toUpperCase() + job.location.type.slice(1)}
                          {job.location.city && ` • ${job.location.city}`}
                          {job.location.state && `, ${job.location.state}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <span>{job.employmentType} • {job.experienceLevel} level</span>
                      </div>
                      {job.salary && job.salary.visible && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {job.salary.min && job.salary.max
                              ? `${job.salary.currency || 'USD'} ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}`
                              : job.salary.min
                              ? `${job.salary.currency || 'USD'} ${job.salary.min.toLocaleString()}+`
                              : "Competitive salary"}
                          </span>
                        </div>
                      )}
                      {job.applicationDeadline && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>Deadline: {format(new Date(job.applicationDeadline), "MMM dd, yyyy")}</span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {job.description}
                      </div>
                    </div>

                    {job.responsibilities && (
                      <div>
                        <h4 className="font-medium mb-2">Responsibilities</h4>
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {job.responsibilities}
                        </div>
                      </div>
                    )}

                    {job.requirements && (
                      <div>
                        <h4 className="font-medium mb-2">Requirements</h4>
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {job.requirements}
                        </div>
                      </div>
                    )}

                    {job.skills.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Required Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {job.benefits && job.benefits.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Benefits</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.benefits.map((benefit, index) => (
                            <Badge key={index} variant="outline">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Application Stats */}
                {applications && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Applications Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{applications.total}</div>
                        <div className="text-sm text-muted-foreground">Total Applications</div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        {Object.entries(applications.byStatus).map(([status, count]) => (
                          <div key={status} className="flex justify-between items-center">
                            <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        className="w-full"
                        onClick={() => router.push(`/subadmin/applications?jobId=${jobId}`)}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Manage Applications
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Job Meta */}
                <Card>
                  <CardHeader>
                    <CardTitle>Job Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Created</label>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(job.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Last Updated</label>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(job.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Created By</label>
                      <p className="text-sm text-muted-foreground">
                        {job.createdBy.firstName} {job.createdBy.lastName}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Visibility</label>
                      <p className="text-sm text-muted-foreground capitalize">
                        {job.visibility}
                        {job.featured && " • Featured"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {applications?.recent && applications.recent.length > 0 ? (
                  <div className="space-y-4">
                    {applications.recent.map((application) => (
                      <div key={application._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">
                            {application.candidate.firstName} {application.candidate.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{application.candidate.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Applied {formatDistanceToNow(new Date(application.applicationDate), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{application.status.replace('_', ' ')}</Badge>
                          <Button size="sm" variant="outline">
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button 
                      className="w-full"
                      variant="outline"
                      onClick={() => router.push(`/subadmin/applications?jobId=${jobId}`)}
                    >
                      View All Applications
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                    <p className="text-muted-foreground">
                      Once candidates start applying, you'll see their applications here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Detailed job performance metrics and insights will be available here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}