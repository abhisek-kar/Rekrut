'use client';

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn-ui/avatar";
import { Badge } from "@/components/shadcn-ui/badge";
import { Button } from "@/components/shadcn-ui/button";
import { RefreshCwIcon, ChevronRightIcon } from "lucide-react";
import { SectionLoader } from "@/components/atoms/loader";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Candidate {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePhoto?: string;
}

interface Job {
  _id: string;
  title: string;
  company: string;
}

interface Application {
  _id: string;
  status: string;
  applicationDate: string;
  createdAt: string;
  updatedAt: string;
  matchingScore?: {
    overall: number;
  };
  job: Job;
  candidate: Candidate;
}

interface RecentApplicationsResponse {
  applications: Application[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export function RecentApplicationsPanel() {
  const [data, setData] = useState<RecentApplicationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subadmin/applications/recent?limit=5');
      
      if (!response.ok) {
        throw new Error("Failed to fetch applications data");
      }
      
      const data = await response.json();
      setData(data);
    } catch (err) {
      setError("Error loading recent applications");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleRefresh = () => {
    fetchApplications();
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Recent Applications</CardTitle>
          <CardDescription>
            Latest candidates who applied to your jobs
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={handleRefresh}>
          <RefreshCwIcon className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <SectionLoader message="Loading recent applications..." height="300px" />
        ) : error ? (
          <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50">
            {error}
          </div>
        ) : data?.applications.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500">No recent applications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.applications.map((application) => (
              <ApplicationCard key={application._id} application={application} />
            ))}
            
            <div className="text-center pt-2">
              <Link href="/subadmin/applications">
                <Button variant="outline" className="gap-1">
                  View All Applications <ChevronRightIcon className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ApplicationCard({ application }: { application: Application }) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "screening":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "interview":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "offer":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "hired":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formattedDate = application.createdAt 
    ? formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })
    : "";

  return (
    <Link href={`/subadmin/applications/${application._id}`}>
      <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={application.candidate.profilePhoto} 
            alt={`${application.candidate.firstName} ${application.candidate.lastName}`} 
          />
          <AvatarFallback>
            {getInitials(application.candidate.firstName, application.candidate.lastName)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-medium text-sm truncate">
              {application.candidate.firstName} {application.candidate.lastName}
            </h4>
            <Badge className={getStatusBadgeColor(application.status)}>
              {getStatusLabel(application.status)}
            </Badge>
          </div>
          
          <p className="text-xs text-gray-500 truncate">
            Applied for {application.job.title}
          </p>
          
          <div className="flex items-center justify-between mt-1">
            <div className="text-xs text-gray-500">
              {formattedDate}
            </div>
            
            {application.matchingScore && (
              <div className="text-xs">
                <span className="font-medium text-primary">
                  {Math.round(application.matchingScore.overall)}% Match
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
