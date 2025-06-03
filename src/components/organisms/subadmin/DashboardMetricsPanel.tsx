'use client';

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { BriefcaseIcon, UsersIcon, CalendarIcon, UserPlusIcon } from "lucide-react";
import { SectionLoader } from "@/components/atoms/loader";
import { Skeleton } from "@/components/shadcn-ui/skeleton";

interface DashboardMetrics {
  activeJobsCount: number;
  closedJobsCount: number;
  applicationsToReview: number;
  interviewsScheduled: number;
  recentHires: number;
}

export function DashboardMetricsPanel() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/subadmin/dashboard");
        
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        
        const data = await response.json();
        setMetrics(data.metrics);
      } catch (err) {
        setError("Error loading dashboard metrics");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (error) {
    return (
      <div className="p-4 mb-6 text-sm text-red-800 rounded-lg bg-red-50">
        {error}
      </div>
    );
  }

  if (loading) {
    return <SectionLoader message="Loading dashboard metrics..." height="200px" />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Active Jobs"
        value={metrics?.activeJobsCount}
        description="Your assigned active job postings"
        icon={<BriefcaseIcon className="w-8 h-8 text-primary" />}
        loading={loading}
      />
      
      <MetricCard
        title="Applications to Review"
        value={metrics?.applicationsToReview}
        description="New applications awaiting review"
        icon={<UsersIcon className="w-8 h-8 text-amber-500" />}
        loading={loading}
      />
      
      <MetricCard
        title="Interviews Scheduled"
        value={metrics?.interviewsScheduled}
        description="Upcoming interviews this week"
        icon={<CalendarIcon className="w-8 h-8 text-indigo-500" />}
        loading={loading}
      />
      
      <MetricCard
        title="Recent Hires"
        value={metrics?.recentHires}
        description="Candidates hired in the last 30 days"
        icon={<UserPlusIcon className="w-8 h-8 text-green-500" />}
        loading={loading}
      />
    </div>
  );
}

type MetricCardProps = {
  title: string;
  value: number | undefined;
  description: string;
  icon: React.ReactNode;
  loading: boolean;
};

function MetricCard({ title, value, description, icon, loading }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value || 0}</div>
        )}
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
