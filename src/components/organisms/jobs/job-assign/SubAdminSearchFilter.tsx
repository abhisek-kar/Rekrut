'use client';

import React from 'react';
import { Search, FilterX } from 'lucide-react';
import { Input } from '@/components/shadcn-ui/input';
import { Button } from '@/components/shadcn-ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn-ui/select';

interface SubAdminSearchFilterProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filters: {
    status: string;
    jobCount: string;
    lastActive: string;
  };
  onFilterChange: (name: keyof SubAdminSearchFilterProps['filters'], value: string) => void;
  onResetFilters: () => void;
}

export function SubAdminSearchFilter({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  onResetFilters,
}: SubAdminSearchFilterProps) {
  const hasFilters = Object.values(filters).some(filter => !!filter);

  return (
    <div className="bg-card rounded-lg border p-4 mb-6">
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search recruiters by name or email..."
            className="pl-9"
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select
            value={filters.status}
            onValueChange={(value) => onFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.jobCount}
            onValueChange={(value) => onFilterChange('jobCount', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Job Assignments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Number</SelectItem>
              <SelectItem value="none">No Jobs</SelectItem>
              <SelectItem value="low">1-5 Jobs</SelectItem>
              <SelectItem value="medium">6-15 Jobs</SelectItem>
              <SelectItem value="high">15+ Jobs</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.lastActive}
            onValueChange={(value) => onFilterChange('lastActive', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Last Active" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="older">Older</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset filters button */}
        {hasFilters && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="flex items-center gap-1.5"
            >
              <FilterX className="h-3.5 w-3.5" />
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
