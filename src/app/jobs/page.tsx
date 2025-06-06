"use client";

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Clock, DollarSign, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn-ui/select';
import { Badge } from '@/components/shadcn-ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import Link from 'next/link';

interface Job {
  _id: string;
  title: string;
  company: string;
  department?: string;
  location: {
    type: string;
    city?: string;
    state?: string;
    country?: string;
  };
  description?: string;
  skills?: string[];
  experienceLevel?: 'entry' | 'mid' | 'senior';
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    visible: boolean;
  };
  benefits?: string[];
  featured: boolean;
  createdAt: string;
  applicationDeadline?: string;
}

interface JobsResponse {
  jobs: Job[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 0,
    limit: 12,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Filter states
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('all');
  const [experienceLevel, setExperienceLevel] = useState('all');
  const [locationType, setLocationType] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchJobs = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(location && { location }),
        ...(employmentType !== 'all' && { employmentType }),
        ...(experienceLevel !== 'all' && { experienceLevel }),
        ...(locationType !== 'all' && { locationType }),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/public/jobs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      
      const data: JobsResponse = await response.json();
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, location, employmentType, experienceLevel, locationType, sortBy, sortOrder]);

  const handlePageChange = (newPage: number) => {
    fetchJobs(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatSalary = (job: Job) => {
    if (!job.salary?.visible || (!job.salary.min && !job.salary.max)) {
      return null;
    }
    
    const currency = job.salary.currency || 'USD';
    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        notation: 'compact',
        maximumFractionDigits: 0,
      }).format(amount);
    };

    if (job.salary.min && job.salary.max) {
      return `${formatAmount(job.salary.min)} - ${formatAmount(job.salary.max)}`;
    }
    if (job.salary.min) {
      return `From ${formatAmount(job.salary.min)}`;
    }
    if (job.salary.max) {
      return `Up to ${formatAmount(job.salary.max)}`;
    }
    return null;
  };

  const getLocationString = (location: Job['location']) => {
    if (location.type === 'remote') return 'Remote';
    
    const parts = [location.city, location.state, location.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Find Your Dream Job
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover amazing opportunities from top companies. Your next career move starts here.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Main Search */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search jobs, companies, or skills..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={employmentType} onValueChange={setEmploymentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Employment Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>

              <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Experience Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                </SelectContent>
              </Select>

              <Select value={locationType} onValueChange={setLocationType}>
                <SelectTrigger>
                  <SelectValue placeholder="Work Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>

              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [newSortBy, newSortOrder] = value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Latest</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest</SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                  <SelectItem value="company-asc">Company A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        {/* Results Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {loading ? 'Searching...' : `${pagination.total} Jobs Found`}
            </h2>
            {pagination.total > 0 && (
              <p className="text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </p>
            )}
          </div>
        </div>

        {/* Job Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-64">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Briefcase className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <Card key={job._id} className="hover:shadow-lg transition-shadow duration-200 relative">
                  {job.featured && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        Featured
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold line-clamp-2 pr-16">
                      {job.title}
                    </CardTitle>
                    <div className="space-y-1">
                      <p className="text-base font-medium text-blue-600">{job.company}</p>
                      {job.department && (
                        <p className="text-sm text-gray-600">{job.department}</p>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Location */}
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{getLocationString(job.location)}</span>
                      </div>

                      {/* Salary */}
                      {formatSalary(job) && (
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{formatSalary(job)}</span>
                        </div>
                      )}

                      {/* Employment Type & Experience */}
                      <div className="flex flex-wrap gap-2">
                        {job.employmentType && (
                          <Badge variant="outline" className="text-xs">
                            {job.employmentType.charAt(0).toUpperCase() + job.employmentType.slice(1)}
                          </Badge>
                        )}
                        {job.experienceLevel && (
                          <Badge variant="outline" className="text-xs">
                            {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)} Level
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {job.location.type.charAt(0).toUpperCase() + job.location.type.slice(1)}
                        </Badge>
                      </div>

                      {/* Skills */}
                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {job.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {job.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{job.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Posted time and deadline */}
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimeAgo(job.createdAt)}
                        </span>
                        {job.applicationDeadline && (
                          <span>
                            Closes: {new Date(job.applicationDeadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Apply Button */}
                      <Link href={`/jobs/${job._id}`} className="block">
                        <Button className="w-full mt-4">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
