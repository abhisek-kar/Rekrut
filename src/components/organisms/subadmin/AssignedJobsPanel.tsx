"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Badge } from "@/components/shadcn-ui/badge";
import { Button } from "@/components/shadcn-ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn-ui/tabs";
import {
  BriefcaseIcon,
  ChevronRightIcon,
  RefreshCwIcon,
  UsersIcon,
} from "lucide-react";
import { SectionLoader } from "@/components/atoms/loader";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface JobSummary {
  slug: string;
  publicId: string;
  title: string;
  company: string;
  location: {
    city: string;
    state: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
  applicationCounts: {
    total: number;
    new: number;
    interviewing: number;
    offered: number;
    hired: number;
  };
}

interface JobCountsSummary {
  all: number;
  active: number;
  draft: number;
  closed: number;
  archived: number;
}

interface JobsSummaryResponse {
  jobs: JobSummary[];
  counts: JobCountsSummary;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export function AssignedJobsPanel() {
  const [data, setData] = useState<JobsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const fetchJobs = async (status = "all") => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/subadmin/jobs/summary?status=${status}&limit=5`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch jobs data");
      }

      const data = await response.json();
      setData(data);
    } catch (err) {
      setError("Error loading assigned jobs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(activeTab);
  }, [activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleRefresh = () => {
    fetchJobs(activeTab);
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Assigned Jobs</CardTitle>
          <CardDescription>Manage your assigned job postings</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={handleRefresh}>
          <RefreshCwIcon className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({data?.counts.all || 0})</TabsTrigger>
            <TabsTrigger value="active">
              Active ({data?.counts.active || 0})
            </TabsTrigger>
            <TabsTrigger value="draft">
              Draft ({data?.counts.draft || 0})
            </TabsTrigger>
            <TabsTrigger value="closed">
              Closed ({data?.counts.closed || 0})
            </TabsTrigger>
            <TabsTrigger value="archived">
              Archived ({data?.counts.archived || 0})
            </TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="pt-4">
            {loading ? (
              <SectionLoader
                message="Loading assigned jobs..."
                height="300px"
              />
            ) : error ? (
              <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50">
                {error}
              </div>
            ) : data?.jobs.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">
                  No jobs found in this category
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data?.jobs.map((job) => (
                  <JobCard key={job.publicId} job={job} />
                ))}

                <div className="text-center">
                  <Link href="/subadmin/jobs">
                    <Button variant="outline" className="gap-1">
                      View All Jobs <ChevronRightIcon className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function JobCard({ job }: { job: JobSummary }) {
  const getStatusBadgeColor = (status: string) => {
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
    switch (status) {
      case "active":
        return "Active";
      case "draft":
        return "Draft";
      case "closed":
        return "Closed";
      case "archived":
        return "Archived";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formattedDate = job.updatedAt
    ? formatDistanceToNow(new Date(job.updatedAt), { addSuffix: true })
    : "";

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/subadmin/jobs/${job.slug}`}>
        <CardContent className="p-0">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{job.title}</h3>
              <Badge className={getStatusBadgeColor(job.status)}>
                {getStatusLabel(job.status)}
              </Badge>
            </div>

            <div className="flex items-center text-sm text-gray-500 mb-2">
              <BriefcaseIcon className="w-4 h-4 mr-1" />
              {job.company}

              {job.location && (
                <span className="ml-3">
                  {job.location.city && job.location.state
                    ? `${job.location.city}, ${job.location.state}`
                    : job.location.city || job.location.state}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <UsersIcon className="w-4 h-4 mr-1" />
                <span>
                  {job.applicationCounts.total} applications
                  {job.applicationCounts.new > 0 && (
                    <span className="ml-1 font-medium text-primary">
                      ({job.applicationCounts.new} new)
                    </span>
                  )}
                </span>
              </div>

              <div className="text-xs text-gray-500">
                Updated {formattedDate}
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
