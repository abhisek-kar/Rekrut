"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/shadcn-ui/breadcrumb";
import { SidebarTrigger } from "@/components/shadcn-ui/sidebar";
import { Separator } from "@/components/shadcn-ui/separator";
import { toast } from "sonner";
import { Button } from "@/components/shadcn-ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn-ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/shadcn-ui/badge";

// Types
type Activity = {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
};

type UserInfo = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePhoto?: string;
};

// Helper function to get initials
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// Helper function to format activity description
function formatActivityDescription(activity: Activity): string {
  switch (activity.action) {
    case "login":
      return "Logged in to the system";
    case "logout":
      return "Logged out of the system";
    case "create":
      return `Created a new ${activity.entityType}`;
    case "update":
      return `Updated a ${activity.entityType}`;
    case "delete":
      return `Deleted a ${activity.entityType}`;
    case "view":
      return `Viewed a ${activity.entityType}`;
    default:
      return `Performed ${activity.action} on ${activity.entityType}`;
  }
}

// Helper to get activity badge color
function getActivityBadgeVariant(action: string): "default" | "secondary" | "destructive" | "outline" {
  switch (action) {
    case "create":
      return "default";
    case "update":
      return "secondary";
    case "delete":
      return "destructive";
    default:
      return "outline";
  }
}

export default function UserActivityPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [user, setUser] = useState<UserInfo | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  
  useEffect(() => {
    // Fetch the user details and activities
    const fetchUserAndActivities = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user details
        const userResponse = await fetch(`/api/users/subadmins/${id}`);
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user details');
        }
        const userData = await userResponse.json();
        
        // Fetch user activities
        const activitiesResponse = await fetch(`/api/admin/activity?userId=${id}`);
        if (!activitiesResponse.ok) {
          throw new Error('Failed to fetch user activities');
        }
        const activitiesData = await activitiesResponse.json();
        
        setUser(userData.user);
        setActivities(activitiesData.activities);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load user activity');
        router.push('/admin/users');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchUserAndActivities();
    }
  }, [id, router]);

  const filteredActivities = filter === "all" 
    ? activities 
    : activities.filter(activity => activity.action === filter);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-xl font-semibold">User not found</h1>
        <Button 
          variant="link" 
          onClick={() => router.push('/admin/users')}
          className="mt-4"
        >
          Return to User Management
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/users">Users</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/admin/users/${id}`}>Edit SubAdmin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/admin/users/${id}/activity`}>Activity Log</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
              <p className="text-muted-foreground">
                View activity history for {user.firstName} {user.lastName}
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push(`/admin/users/${id}`)}>
              Back to User
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.profilePhoto} />
                <AvatarFallback>{getInitials(`${user.firstName} ${user.lastName}`)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div>
              <Select
                value={filter}
                onValueChange={setFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="login">Logins</SelectItem>
                  <SelectItem value="logout">Logouts</SelectItem>
                  <SelectItem value="create">Create Actions</SelectItem>
                  <SelectItem value="update">Update Actions</SelectItem>
                  <SelectItem value="delete">Delete Actions</SelectItem>
                  <SelectItem value="view">View Actions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                {filteredActivities.length} activities found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredActivities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No activities found</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {filteredActivities.map((activity) => (
                    <div key={activity.id} className="flex">
                      <div className="mr-4 flex flex-col items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-muted">
                          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="h-full w-px bg-muted" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={getActivityBadgeVariant(activity.action)}>
                              {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}
                            </Badge>
                            <span className="text-sm font-medium">
                              {formatActivityDescription(activity)}
                            </span>
                          </div>
                          <time className="text-sm text-muted-foreground">
                            {format(new Date(activity.createdAt), 'MMM d, yyyy h:mm a')}
                          </time>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.entityType.charAt(0).toUpperCase() + activity.entityType.slice(1)} ID: {activity.entityId}
                        </p>
                        <div className="mt-2 text-xs text-muted-foreground">
                          <p>IP: {activity.ipAddress}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
