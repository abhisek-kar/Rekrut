'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn-ui/avatar";
import { Button } from "@/components/shadcn-ui/button";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import { 
  FileEdit, 
  Clock, 
  ChevronDown, 
  UserCheck, 
  FileText,
  ArrowUpRight,
  MessageCircle
} from "lucide-react";
import { format, formatDistanceToNow } from 'date-fns';
import { getInitials } from '@/lib/utils';

// Activity type definition (to be moved to types)
interface Activity {
  _id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePhoto?: string;
  };
  createdAt: string;
}

interface ActivityTabProps {
  jobId: string;
}

export function ActivityTab({ jobId }: ActivityTabProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Fetch job activities when component mounts
  useEffect(() => {
    fetchActivities();
  }, [jobId]);
  
  // Fetch activities from API
  const fetchActivities = async (reset = false) => {
    try {
      const currentPage = reset ? 1 : page;
      setLoading(true);
      
      const response = await fetch(`/api/admin/activity?entityId=${jobId}&entityType=job&page=${currentPage}&limit=10`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }
      
      const data = await response.json();
      
      if (reset) {
        setActivities(data.activities);
      } else {
        setActivities(prev => [...prev, ...data.activities]);
      }
      
      setHasMore(data.pagination.page < data.pagination.pages);
      setPage(reset ? 2 : page + 1);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Load more activities
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchActivities();
    }
  };
  
  // Get icon for activity action
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <FileText className="h-4 w-4" />;
      case 'update':
        return <FileEdit className="h-4 w-4" />;
      case 'job_assignment':
        return <UserCheck className="h-4 w-4" />;
      case 'status_change':
        return <ArrowUpRight className="h-4 w-4" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  
  // Get description for activity
  const getActivityDescription = (activity: Activity) => {
    switch (activity.action) {
      case 'create':
        return "created this job";
      case 'update':
        return "updated the job details";
      case 'job_assignment':
        return `assigned this job to ${activity.details.assigneeName || 'a recruiter'}`;
      case 'status_change':
        return `changed job status to "${activity.details.status}"`;
      case 'comment':
        return `commented: "${activity.details.comment}"`;
      default:
        return "performed an action";
    }
  };
  
  // Format date in human-readable format
  const formatActivityDate = (date: string) => {
    try {
      const activityDate = new Date(date);
      return {
        relative: formatDistanceToNow(activityDate, { addSuffix: true }),
        absolute: format(activityDate, "MMM d, yyyy 'at' h:mm a")
      };
    } catch {
      return {
        relative: "Invalid date",
        absolute: "Invalid date"
      };
    }
  };
  
  // Render loading state
  const renderLoading = () => {
    return Array(3).fill(0).map((_, index) => (
      <div key={index} className="flex gap-3 items-start mb-6">
        <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-4 w-1/3 mb-2" />
          <Skeleton className="h-3 w-2/3 mb-2" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    ));
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
        <CardDescription>History of actions performed on this job</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && activities.length === 0 ? (
          renderLoading()
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-lg font-medium">No activity yet</h3>
            <p className="text-muted-foreground mt-1">
              Activities will be recorded when changes are made to this job.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {activities.map((activity) => {
              const dateFormatted = formatActivityDate(activity.createdAt);
              
              return (
                <div key={activity._id} className="flex gap-3 items-start">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={activity.userId.profilePhoto} 
                      alt={`${activity.userId.firstName} ${activity.userId.lastName}`} 
                    />
                    <AvatarFallback>
                      {getInitials(`${activity.userId.firstName} ${activity.userId.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="font-medium">
                        {activity.userId.firstName} {activity.userId.lastName}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {getActivityDescription(activity)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {getActionIcon(activity.action)}
                      <span title={dateFormatted.absolute}>
                        {dateFormatted.relative}
                      </span>
                    </div>
                    
                    {/* Optional details based on action type */}
                    {activity.action === 'status_change' && activity.details.reason && (
                      <div className="mt-2 p-2 bg-muted rounded-md text-sm">
                        <span className="font-medium">Reason:</span> {activity.details.reason}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Load more button */}
            {hasMore && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="gap-1"
                >
                  {loading ? "Loading..." : "Load more"}
                  {!loading && <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
