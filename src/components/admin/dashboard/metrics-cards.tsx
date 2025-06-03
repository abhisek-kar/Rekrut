import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Skeleton } from '@/components/shadcn-ui/skeleton';

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  change?: {
    value: string | number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  loading?: boolean;
}

export function MetricCard({ title, value, description, change, loading = false }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change && (
              <div className="flex items-center mt-1 text-xs">
                {change.type === 'increase' && (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                )}
                {change.type === 'decrease' && (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                {change.type === 'neutral' && (
                  <Minus className="h-3 w-3 text-gray-500 mr-1" />
                )}
                <span
                  className={
                    change.type === 'increase'
                      ? 'text-green-500'
                      : change.type === 'decrease'
                      ? 'text-red-500'
                      : 'text-gray-500'
                  }
                >
                  {change.value}
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function MetricsGrid({ metrics, loading = false }: { 
  metrics: {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    candidatesInPipeline: number;
    hiringRate: number;
  } | null;
  loading: boolean;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Active Jobs"
        value={metrics?.activeJobs || 0}
        description="Currently open positions"
        change={{ value: "+5 from last month", type: "increase" }}
        loading={loading}
      />
      <MetricCard
        title="Total Jobs" 
        value={metrics?.totalJobs || 0}
        description="All created job postings"
        change={{ value: "+8 from last month", type: "increase" }}
        loading={loading}
      />
      <MetricCard
        title="Applications"
        value={metrics?.totalApplications || 0}
        description="Total received applications"
        change={{ value: "+86 from last month", type: "increase" }}
        loading={loading}
      />
      <MetricCard
        title="Candidates in Pipeline"
        value={metrics?.candidatesInPipeline || 0}
        description="Active candidates in process"
        change={{ value: "+32 from last month", type: "increase" }}
        loading={loading}
      />
      <MetricCard
        title="Hiring Rate"
        value={`${metrics?.hiringRate || 0}%`}
        description="Conversion of applicants to hires"
        change={{ value: "+0.5% from last month", type: "increase" }}
        loading={loading}
      />
    </div>
  );
}
