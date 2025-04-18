import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/shadcn-ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/shadcn-ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn-ui/avatar';
import { Button } from '@/components/shadcn-ui/button';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import Link from 'next/link';

export interface Activity {
  id: string;
  userAvatar?: string;
  userInitials: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  timestamp: string;
  relativeTime: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  loading: boolean;
  onViewAll: () => void;
  onFilterChange: (filter: string) => void;
}

export function ActivityFeed({ activities, loading, onViewAll, onFilterChange }: ActivityFeedProps) {
  const [filter, setFilter] = useState("all");

  const handleFilterChange = (value: string) => {
    setFilter(value);
    onFilterChange(value);
  };

  const getEntityLink = (activity: Activity) => {
    switch (activity.entityType) {
      case 'job':
        return `/jobs/${activity.entityId}`;
      case 'candidate':
        return `/candidates/${activity.entityId}`;
      case 'application':
        return `/applications/${activity.entityId}`;
      case 'user':
        return `/admin/users/${activity.entityId}`;
      default:
        return '#';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions in your recruitment system</CardDescription>
        </div>
        <Select value={filter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activities</SelectItem>
            <SelectItem value="job">Jobs</SelectItem>
            <SelectItem value="candidate">Candidates</SelectItem>
            <SelectItem value="application">Applications</SelectItem>
            <SelectItem value="user">Users</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {loading ? (
            Array(5).fill(null).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))
          ) : activities.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              No recent activity found
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={activity.userAvatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {activity.userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{activity.userName}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.action}{' '}
                    <Link 
                      href={getEntityLink(activity)}
                      className="text-primary hover:underline"
                    >
                      {activity.entityName}
                    </Link>
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">{activity.relativeTime}</div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-primary"
          onClick={onViewAll}
        >
          View all activity
        </Button>
      </CardFooter>
    </Card>
  );
}
