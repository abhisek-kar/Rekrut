'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Input } from "@/components/shadcn-ui/input";
import { Button } from "@/components/shadcn-ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import {
  Search,
  X,
  Download,
  ChevronDown,
} from "lucide-react";

export type FilterOptions = {
  status: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  datePosted: string;
  assignedToMe?: boolean;
};

interface JobSearchFilterProps {
  searchTerm: string;
  filters: FilterOptions;
  viewMode: 'table' | 'grid';
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterChange: (name: keyof FilterOptions, value: string) => void;
  onResetFilters: () => void;
  onViewModeChange: (mode: 'table' | 'grid') => void;
}

export function JobSearchFilter({
  searchTerm,
  filters,
  viewMode,
  onSearchChange,
  onFilterChange,
  onResetFilters,
  onViewModeChange
}: JobSearchFilterProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Search & Filter</CardTitle>
        <CardDescription>
          Find specific jobs using advanced filters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search jobs by title, company or description..."
              className="pl-8"
              value={searchTerm}
              onChange={onSearchChange}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <Select 
              value={filters.status} 
              onValueChange={(value) => onFilterChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.location} 
              onValueChange={(value) => onFilterChange("location", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="onsite">Onsite</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.jobType} 
              onValueChange={(value) => onFilterChange("jobType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.experienceLevel} 
              onValueChange={(value) => onFilterChange("experienceLevel", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="entry">Entry Level</SelectItem>
                <SelectItem value="mid">Mid Level</SelectItem>
                <SelectItem value="senior">Senior Level</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.datePosted} 
              onValueChange={(value) => onFilterChange("datePosted", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Date Posted" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Past Week</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onResetFilters}
              >
                <X className="mr-1 h-4 w-4" />
                Clear Filters
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="mr-1 h-4 w-4" />
                    Export
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={viewMode === "table" ? "bg-secondary" : ""}
                onClick={() => onViewModeChange("table")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M3 15h18" />
                  <path d="M9 3v18" />
                  <path d="M15 3v18" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={viewMode === "grid" ? "bg-secondary" : ""}
                onClick={() => onViewModeChange("grid")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
