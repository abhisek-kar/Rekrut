"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn-ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { 
  MetricsGrid, 
  ActivityFeed, 
  JobStatusChart,
  ApplicationFunnel,
  ApplicationsOverTime
} from "@/components/admin/dashboard";
import { Activity } from "@/components/admin/dashboard/activity-feed";
import { Button } from "@/components/shadcn-ui/button";

// Define types for dashboard data
type JobStatusItem = {
  status: 'active' | 'draft' | 'closed' | 'archived';
  count: number;
  percentage: number;
};

// Define interfaces for dashboard data
interface DashboardData {
  metrics: {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    candidatesInPipeline: number;
    hiringRate: number;
  };
  charts: {
    jobStatusDistribution: Array<{
      status: 'active' | 'draft' | 'closed' | 'archived';
      count: number;
      percentage: number;
    }>;
    applicationFunnel: Array<{
      stage: string;
      count: number;
      percentage: number;
    }>;
    applicationsOverTime: Array<{
      date: string;
      value: number;
    }>;
  };
}

// Sample data for testing when API fails
const sampleMetrics = {
  totalJobs: 42,
  activeJobs: 24,
  totalApplications: 342,
  candidatesInPipeline: 156,
  hiringRate: 8.5
};

const sampleJobStatusData: JobStatusItem[] = [
  { status: 'active' as const, count: 24, percentage: 57 },
  { status: 'draft' as const, count: 8, percentage: 19 },
  { status: 'closed' as const, count: 7, percentage: 17 },
  { status: 'archived' as const, count: 3, percentage: 7 }
];

const sampleApplicationFunnelData = [
  { stage: 'applied', count: 342, percentage: 100 },
  { stage: 'screened', count: 215, percentage: 63 },
  { stage: 'interview_scheduled', count: 128, percentage: 37 },
  { stage: 'interviewed', count: 98, percentage: 29 },
  { stage: 'offered', count: 43, percentage: 13 },
  { stage: 'hired', count: 29, percentage: 8 }
];

const sampleApplicationsOverTime = [
  { date: 'W1', value: 23 },
  { date: 'W2', value: 32 },
  { date: 'W3', value: 18 },
  { date: 'W4', value: 41 },
  { date: 'W5', value: 26 }
];

const sampleActivities: Activity[] = [
  {
    id: '1',
    userAvatar: undefined,
    userInitials: 'JD',
    userName: 'Jane Doe',
    action: 'created a new job',
    entityType: 'job',
    entityId: '12345',
    entityName: 'Senior Developer',
    timestamp: new Date().toISOString(),
    relativeTime: '2h ago'
  },
  {
    id: '2',
    userAvatar: undefined,
    userInitials: 'MS',
    userName: 'Mike Smith',
    action: 'updated a candidate',
    entityType: 'candidate',
    entityId: '54321',
    entityName: 'John Applicant',
    timestamp: new Date().toISOString(),
    relativeTime: '5h ago'
  },
  {
    id: '3',
    userAvatar: undefined,
    userInitials: 'AK',
    userName: 'Alice Kim',
    action: 'scheduled an interview',
    entityType: 'application',
    entityId: '67890',
    entityName: 'Frontend Developer Application',
    timestamp: new Date().toISOString(),
    relativeTime: 'Yesterday'
  }
];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("30days");
  const [activityFilter, setActivityFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/dashboard?dateRange=${dateRange}`);
        
        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Authentication error. Please log in again.");
            // Use sample data for development
            setDashboardData({
              metrics: sampleMetrics,
              charts: {
                jobStatusDistribution: sampleJobStatusData,
                applicationFunnel: sampleApplicationFunnelData,
                applicationsOverTime: sampleApplicationsOverTime
              }
            });
            return;
          }
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
        
        // Use sample data for development
        setDashboardData({
          metrics: sampleMetrics,
          charts: {
            jobStatusDistribution: sampleJobStatusData,
            applicationFunnel: sampleApplicationFunnelData,
            applicationsOverTime: sampleApplicationsOverTime
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange]);

  // Fetch activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(`/api/admin/activity?limit=5&type=${activityFilter}`);
        
        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Authentication error. Please log in again.");
            // Use sample data for development
            setActivities(sampleActivities);
            return;
          }
          throw new Error('Failed to fetch activity data');
        }
        
        const data = await response.json();
        setActivities(data.activities);
      } catch (error) {
        console.error("Error fetching activities:", error);
        toast.error("Failed to load activity feed");
        
        // Use sample data for development
        setActivities(sampleActivities);
      }
    };

    fetchActivities();
  }, [activityFilter]);

  // Handle time range change for applications over time
  const handleTimeRangeChange = (range: string) => {
    // For now, we'll use dateRange for time range as well
    setDateRange(range);
    // We could fetch new data here if needed
  };

  // Handle date range change for application funnel
  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
  };

  // Handle activity filter change
  const handleActivityFilterChange = (filter: string) => {
    setActivityFilter(filter);
  };

  // Handle view all activities
  const handleViewAllActivities = () => {
    // Navigate to activity page or open modal
    // For now, just fetch more activities
    toast.info("Loading all activities...");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title={`Welcome, ${user?.firstName || 'Admin'}`}
        description="Here's an overview of your recruitment process"
      />

      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col gap-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* Metrics Cards */}
              <MetricsGrid 
                metrics={dashboardData ? dashboardData.metrics : null} 
                loading={isLoading} 
              />

              {/* Charts Row */}
              <div className="grid gap-6 md:grid-cols-2">
                <JobStatusChart 
                  data={dashboardData?.charts?.jobStatusDistribution || []} 
                  loading={isLoading} 
                />
                <ApplicationsOverTime 
                  data={dashboardData?.charts?.applicationsOverTime || []} 
                  timeRanges={["week", "month", "quarter", "year"]}
                  loading={isLoading}
                  onTimeRangeChange={handleTimeRangeChange}
                />
              </div>

              {/* Activity Feed */}
              <ActivityFeed 
                activities={activities} 
                loading={isLoading}
                onFilterChange={handleActivityFilterChange}
                onViewAll={handleViewAllActivities}
              />
            </TabsContent>
            
            <TabsContent value="activity" className="space-y-6">
              <h2 className="text-2xl font-bold">System Activity</h2>
              <p className="text-muted-foreground">
                Track all actions and changes in your recruitment system
              </p>
              
              {/* We'd implement a full activity page here */}
              <div className="border rounded-lg p-8 text-center">
                <h3 className="text-xl font-medium mb-2">Activity Tracking</h3>
                <p className="text-muted-foreground mb-4">
                  View a comprehensive log of all system activities and changes
                </p>
                <Button>View Full Activity Log</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-6">
              <h2 className="text-2xl font-bold">Recruitment Analytics</h2>
              <p className="text-muted-foreground">
                Detailed metrics and insights for your recruitment process
              </p>
              
              {/* Application Funnel */}
              <ApplicationFunnel 
                data={dashboardData?.charts?.applicationFunnel || []} 
                dateRanges={["30days", "60days", "90days", "thisyear"]}
                loading={isLoading}
                onDateRangeChange={handleDateRangeChange}
              />
              
              {/* Additional analytics components would go here */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="border rounded-lg p-6">
                  <h3 className="font-medium mb-2">Time-to-Hire Analysis</h3>
                  <p className="text-muted-foreground text-sm">
                    Coming soon: Track your recruitment timeline efficiency
                  </p>
                </div>
                <div className="border rounded-lg p-6">
                  <h3 className="font-medium mb-2">Source Attribution</h3>
                  <p className="text-muted-foreground text-sm">
                    Coming soon: Analyze where your candidates are coming from
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
