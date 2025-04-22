'use client';

import { CalendarClock, UserCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn-ui/avatar';
import { Skeleton } from '@/components/shadcn-ui/skeleton';

interface AssignmentEvent {
  date: string;
  assignedBy: {
    name: string;
    email: string;
    profilePhoto?: string;
  };
  assignedTo: {
    name: string;
    email: string;
    profilePhoto?: string;
  };
}

interface AssignmentHistoryProps {
  jobId: string;
  loading: boolean;
  history: AssignmentEvent[];
}

export function AssignmentHistory({ jobId, loading, history }: AssignmentHistoryProps) {
  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assignment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, index) => (
              <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assignment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CalendarClock className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">No assignment history</h3>
            <p className="text-sm text-muted-foreground mt-1">
              This job has not been assigned to any recruiters yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignment History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((event, index) => (
            <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0">
              <Avatar>
                <AvatarImage src={event.assignedTo.profilePhoto} alt={event.assignedTo.name} />
                <AvatarFallback>{getInitials(event.assignedTo.name)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="font-medium">{event.assignedTo.name}</p>
                <p className="text-sm text-muted-foreground">{event.assignedTo.email}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <UserCircle2 className="h-3 w-3" />
                  <span>Assigned by {event.assignedBy.name}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarClock className="h-3 w-3" />
                  <span>{formatDate(event.date)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
