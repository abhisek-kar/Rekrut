'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/shadcn-ui/card";
import { Activity, Clock } from 'lucide-react';

interface ActivityItem {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
}

interface ActivityTabProps {
  jobId: string;
}

export function ActivityTab({ jobId }: ActivityTabProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would fetch from an API
        // const response = await fetch(`/api/jobs/${jobId}/activity`);
        // const data = await response.json();
        // setActivities(data.activities);
        
        // Mock data for demonstration
        const mockActivities: ActivityItem[] = [
          {
            id: '1',
            action: 'Job Created',
            user: 'Admin User',
            timestamp: new Date().toISOString(),
            details: 'Job posting was created'
          },
          {
            id: '2',
            action: 'Status Updated',
            user: 'Admin User',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            details: 'Status changed from Draft to Active'
          },
          {
            id: '3',
            action: 'Job Edited',
            user: 'Admin User',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            details: 'Job description was updated'
          }
        ];
        
        setActivities(mockActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [jobId]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <CardDescription>
          Recent activity related to this job posting
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center">
            <Clock className="h-8 w-8 text-muted-foreground animate-spin mx-auto mb-4" />
            <p>Loading activities...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No Activities</h3>
            <p className="text-muted-foreground mt-1 max-w-md mx-auto">
              There's no recorded activity for this job yet. Actions like editing the job or changing its status will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <ol className="relative border-l border-gray-200 dark:border-gray-700">
              {activities.map((activity) => (
                <li key={activity.id} className="mb-10 ml-6">
                  <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
                    <Activity className="w-3 h-3 text-blue-800" />
                  </span>
                  <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">
                    {activity.action}
                  </h3>
                  <time className="block mb-2 text-sm font-normal leading-none text-gray-400">
                    {formatDate(activity.timestamp)} by {activity.user}
                  </time>
                  {activity.details && (
                    <p className="mb-4 text-base font-normal text-gray-500">
                      {activity.details}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
