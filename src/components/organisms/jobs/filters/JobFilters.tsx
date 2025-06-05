import React from "react";
import { Card, CardContent } from "@/components/shadcn-ui/card";
import { Button } from "@/components/shadcn-ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";
import { X } from "lucide-react";

interface FiltersProps {
  filters: {
    status: string;
    department: string;
    employmentType: string;
    experienceLevel: string;
    locationType: string;
    assignedTo: string;
    dateRange: string;
    visibility: string;
    featured: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  resetFilters: () => void;
  getAppliedFiltersCount: () => number;
  userRole: "admin" | "subadmin";
}

export function JobFilters({
  filters,
  setFilters,
  resetFilters,
  getAppliedFiltersCount,
  userRole,
}: FiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Status
            </label>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters((prev: any) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Department Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Department
            </label>
            <Select
              value={filters.department}
              onValueChange={(value) =>
                setFilters((prev: any) => ({ ...prev, department: value }))
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="product">Product</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Employment Type Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Employment Type
            </label>
            <Select
              value={filters.employmentType}
              onValueChange={(value) =>
                setFilters((prev: any) => ({ ...prev, employmentType: value }))
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Experience Level Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Experience Level
            </label>
            <Select
              value={filters.experienceLevel}
              onValueChange={(value) =>
                setFilters((prev: any) => ({ ...prev, experienceLevel: value }))
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="entry">Entry Level</SelectItem>
                <SelectItem value="mid">Mid Level</SelectItem>
                <SelectItem value="senior">Senior Level</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location Type Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Location Type
            </label>
            <Select
              value={filters.locationType}
              onValueChange={(value) =>
                setFilters((prev: any) => ({ ...prev, locationType: value }))
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="onsite">Onsite</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Visibility Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Visibility
            </label>
            <Select
              value={filters.visibility}
              onValueChange={(value) =>
                setFilters((prev: any) => ({ ...prev, visibility: value }))
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Featured Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Featured
            </label>
            <Select
              value={filters.featured}
              onValueChange={(value) =>
                setFilters((prev: any) => ({ ...prev, featured: value }))
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All Jobs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                <SelectItem value="true">Featured Only</SelectItem>
                <SelectItem value="false">Non-Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear All button */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground mt-2">
              &nbsp;
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="w-full text-muted-foreground hover:text-foreground flex items-center justify-center"
              disabled={getAppliedFiltersCount() === 0}
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
