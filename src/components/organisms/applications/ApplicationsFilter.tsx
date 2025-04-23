'use client';

import { Input } from "@/components/shadcn-ui/input";
import { Button } from "@/components/shadcn-ui/button";
import {
  Card,
  CardContent,
} from "@/components/shadcn-ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";
import { Search, X } from "lucide-react";

interface ApplicationsFilterProps {
  searchTerm: string;
  filters: {
    status: string;
    source: string;
    date: string;
    score: string;
  };
  onSearchChange: (value: string) => void;
  onFilterChange: (name: keyof typeof filters, value: string) => void;
  onResetFilters: () => void;
}

export function ApplicationsFilter({
  searchTerm,
  filters,
  onSearchChange,
  onFilterChange,
  onResetFilters,
}: ApplicationsFilterProps) {
  // Check if any filter is active
  const isFiltersActive = Object.values(filters).some(filter => !!filter) || searchTerm;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search input */}
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap md:flex-nowrap gap-2">
            <Select
              value={filters.status}
              onValueChange={(value) => onFilterChange('status', value)}
            >
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.source}
              onValueChange={(value) => onFilterChange('source', value)}
            >
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sources</SelectItem>
                <SelectItem value="careers">Careers Page</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="indeed">Indeed</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.date}
              onValueChange={(value) => onFilterChange('date', value)}
            >
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.score}
              onValueChange={(value) => onFilterChange('score', value)}
            >
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Scores</SelectItem>
                <SelectItem value="90-100">Excellent (90-100%)</SelectItem>
                <SelectItem value="70-89">Good (70-89%)</SelectItem>
                <SelectItem value="50-69">Average (50-69%)</SelectItem>
                <SelectItem value="0-49">Below Average (0-49%)</SelectItem>
              </SelectContent>
            </Select>

            {/* Reset button */}
            {isFiltersActive && (
              <Button
                variant="outline"
                size="icon"
                onClick={onResetFilters}
                title="Reset filters"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
