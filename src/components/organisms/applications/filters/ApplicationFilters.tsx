"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/shadcn-ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";
import { Label } from "@/components/shadcn-ui/label";
import { Badge } from "@/components/shadcn-ui/badge";
import { X, FilterX, Briefcase, Clock, Star, User } from "lucide-react";

interface FilterOptions {
  status: string;
  job: string;
  source: string;
  dateRange: string;
  assignedTo: string;
  matchScore: string;
  interviewStatus: string;
  rating: string;
  hasReview: string;
}

interface FiltersProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  resetFilters: () => void;
  getAppliedFiltersCount: () => number;
  userRole: "admin" | "subadmin";
  jobId?: string;
}

interface Job {
  _id: string;
  title: string;
  company: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export function ApplicationFilters({
  filters,
  setFilters,
  resetFilters,
  getAppliedFiltersCount,
  userRole,
  jobId,
}: FiltersProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch available jobs for filtering
  useEffect(() => {
    if (!jobId) {
      // Only fetch jobs if not filtering by specific job
      fetchJobs();
    }
  }, [jobId]);

  // Fetch users for assignment filter (admin only)
  useEffect(() => {
    if (userRole === "admin") {
      fetchUsers();
    }
  }, [userRole]);

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      const endpoint =
        userRole === "admin" ? "/api/jobs" : "/api/subadmin/jobs";
      const response = await fetch(`${endpoint}?limit=100&status=active`);

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      } else {
        console.error("Failed to fetch jobs:", response.status);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch(
        "/api/users/subadmins?status=active&limit=100"
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error("Failed to fetch users:", response.status);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const removeFilter = (key: keyof FilterOptions) => {
    setFilters((prev) => ({
      ...prev,
      [key]: "all",
    }));
  };

  const getFilterLabel = (key: keyof FilterOptions, value: string) => {
    switch (key) {
      case "status":
        return value.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
      case "job":
        const job = jobs.find((j) => j._id === value);
        return job ? `${job.title} - ${job.company}` : value;
      case "source":
        return value.charAt(0).toUpperCase() + value.slice(1);
      case "dateRange":
        const dateLabels = {
          today: "Today",
          week: "This Week",
          month: "This Month",
          quarter: "This Quarter",
          year: "This Year",
        };
        return dateLabels[value as keyof typeof dateLabels] || value;
      case "assignedTo":
        const user = users.find((u) => u._id === value);
        return user ? `${user.firstName} ${user.lastName}` : value;
      case "matchScore":
        const scoreLabels = {
          high: "High Score (80%+)",
          medium: "Medium Score (60-79%)",
          low: "Low Score (<60%)",
        };
        return scoreLabels[value as keyof typeof scoreLabels] || value;
      case "interviewStatus":
        const interviewLabels = {
          no_interview: "No Interview Scheduled",
          scheduled: "Interview Scheduled",
          completed: "Interview Completed",
          cancelled: "Interview Cancelled",
          no_show: "No Show",
        };
        return interviewLabels[value as keyof typeof interviewLabels] || value;
      case "hasReview":
        const reviewLabels = {
          reviewed: "Reviewed",
          not_reviewed: "Not Reviewed",
        };
        return reviewLabels[value as keyof typeof reviewLabels] || value;
      case "rating":
        return `${value} Star${value !== "1" ? "s" : ""}`;
      default:
        return value;
    }
  };

  // Get active filters for display
  const activeFilters = Object.entries(filters).filter(
    ([key, value]) => value !== "all"
  );

  return (
    <div className="bg-card rounded-lg border p-6 space-y-6">
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Status
          </Label>
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="screening">Screening</SelectItem>
              <SelectItem value="interview_scheduled">
                Interview Scheduled
              </SelectItem>
              <SelectItem value="interviewed">Interviewed</SelectItem>
              <SelectItem value="offered">Offered</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Job Filter - Only show if not filtering by specific job */}
        {!jobId && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground flex items-center">
              <Briefcase className="w-3 h-3 mr-1" />
              Job
            </Label>
            <Select
              value={filters.job}
              onValueChange={(value) => handleFilterChange("job", value)}
              disabled={loadingJobs}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All Jobs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job._id} value={job._id}>
                    {job.title} - {job.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Source Filter */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">
            Source
          </Label>
          <Select
            value={filters.source}
            onValueChange={(value) => handleFilterChange("source", value)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="indeed">Indeed</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="agency">Agency</SelectItem>
              <SelectItem value="direct">Direct</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">
            Date Range
          </Label>
          <Select
            value={filters.dateRange}
            onValueChange={(value) => handleFilterChange("dateRange", value)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Assigned To Filter - Admin only */}
        {/* TODO: Add assignedTo field to Application model first */}
        {false && userRole === "admin" && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground flex items-center">
              <User className="w-3 h-3 mr-1" />
              Assigned To
            </Label>
            <Select
              value={filters.assignedTo}
              onValueChange={(value) => handleFilterChange("assignedTo", value)}
              disabled={loadingUsers}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All Recruiters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recruiters</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.firstName} {user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Score Filter */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground flex items-center">
            <Star className="w-3 h-3 mr-1" />
            Match Score
          </Label>
          <Select
            value={filters.matchScore}
            onValueChange={(value) => handleFilterChange("matchScore", value)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="All Scores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scores</SelectItem>
              <SelectItem value="high">High Score (80%+)</SelectItem>
              <SelectItem value="medium">Medium Score (60-79%)</SelectItem>
              <SelectItem value="low">Low Score (&lt;60%)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Interview Status Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Interview Status
          </Label>
          <Select
            value={filters.interviewStatus}
            onValueChange={(value) =>
              handleFilterChange("interviewStatus", value)
            }
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="All Interview Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Interview Statuses</SelectItem>
              <SelectItem value="no_interview">
                No Interview Scheduled
              </SelectItem>
              <SelectItem value="scheduled">Interview Scheduled</SelectItem>
              <SelectItem value="completed">Interview Completed</SelectItem>
              <SelectItem value="cancelled">Interview Cancelled</SelectItem>
              <SelectItem value="no_show">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Review Status Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center">
            <Star className="w-3 h-3 mr-1" />
            Review Status
          </Label>
          <Select
            value={filters.hasReview}
            onValueChange={(value) => handleFilterChange("hasReview", value)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="All Review Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Review Statuses</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="not_reviewed">Not Reviewed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rating Filter (only show if reviewed) */}
        {filters.hasReview === "reviewed" && (
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center">
              <Star className="w-3 h-3 mr-1" />
              Rating
            </Label>
            <Select
              value={filters.rating}
              onValueChange={(value) => handleFilterChange("rating", value)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">⭐⭐⭐⭐⭐ (5 stars)</SelectItem>
                <SelectItem value="4">⭐⭐⭐⭐ (4 stars)</SelectItem>
                <SelectItem value="3">⭐⭐⭐ (3 stars)</SelectItem>
                <SelectItem value="2">⭐⭐ (2 stars)</SelectItem>
                <SelectItem value="1">⭐ (1 star)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Applied Filters */}
      {activeFilters.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Applied Filters ({getAppliedFiltersCount()})
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <FilterX className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeFilters.map(([key, value]) => (
              <Badge
                key={key}
                variant="secondary"
                className="px-3 py-1 text-xs flex items-center gap-1"
              >
                {getFilterLabel(key as keyof FilterOptions, value)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter(key as keyof FilterOptions)}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
