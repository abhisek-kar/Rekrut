"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  MapPin, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Clock, 
  Share2, 
  Building2,
  Users,
  GraduationCap,
  Heart,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/shadcn-ui/button';
import { Badge } from '@/components/shadcn-ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { Separator } from '@/components/shadcn-ui/separator';
import { toast } from 'sonner';
import Link from 'next/link';

interface Job {
  _id: string;
  title: string;
  company: string;
  department?: string;
  location: {
    type: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  description?: string;
  responsibilities?: string;
  requirements?: string;
  skills?: string[];
  experienceLevel?: 'entry' | 'mid' | 'senior';
  educationRequirements?: string[];
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    visible: boolean;
  };
  benefits?: string[];
  perks?: string[];
  applicationDeadline?: string;
  expectedStartDate?: string;
  applicationInstructions?: string;
  requiredDocuments?: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    firstName: string;
    lastName: string;
  };
}

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/public/jobs/${jobId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Job not found or no longer available');
        } else {
          setError('Failed to load job details');
        }
        return;
      }
      
      const data = await response.json();
      setJob(data.job);
    } catch (err) {
      console.error('Error fetching job:', err);
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (salary: Job['salary']) => {
    if (!salary?.visible || (!salary.min && !salary.max)) {
      return 'Competitive salary';
    }
    
    const currency = salary.currency || 'USD';
    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        notation: 'standard',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    if (salary.min && salary.max) {
      return `${formatAmount(salary.min)} - ${formatAmount(salary.max)} per year`;
    }
    if (salary.min) {
      return `From ${formatAmount(salary.min)} per year`;
    }
    if (salary.max) {
      return `Up to ${formatAmount(salary.max)} per year`;
    }
    return 'Competitive salary';
  };

  const getLocationString = (location: Job['location']) => {
    if (location.type === 'remote') {
      return 'Remote';
    }
    
    const parts = [location.city, location.state, location.country].filter(Boolean);
    const locationStr = parts.length > 0 ? parts.join(', ') : 'Location not specified';
    
    if (location.type === 'hybrid') {
      return `${locationStr} (Hybrid)`;
    }
    
    return locationStr;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `Check out this job at ${job?.company}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Job link copied to clipboard!');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Link href="/jobs">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Briefcase className="h-16 w-16 mx-auto" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {error || 'Job not found'}
            </h1>
            <p className="text-gray-600 mb-6">
              The job you're looking for might have been removed or is no longer available.
            </p>
            <Link href="/jobs">
              <Button>Browse All Jobs</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/jobs">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                      {job.featured && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-xl text-blue-600 font-semibold">
                        <Building2 className="h-5 w-5 mr-2" />
                        {job.company}
                        {job.department && (
                          <span className="text-gray-500 font-normal ml-2">• {job.department}</span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {getLocationString(job.location)}
                        </div>
                        
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-1" />
                          {job.employmentType ? job.employmentType.charAt(0).toUpperCase() + job.employmentType.slice(1) : 'Not specified'}
                        </div>
                        
                        {job.experienceLevel && (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)} Level
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Posted {formatDate(job.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Job Description */}
            {job.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-ul:text-gray-700 prose-ol:text-gray-700"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Responsibilities */}
            {job.responsibilities && (
              <Card>
                <CardHeader>
                  <CardTitle>Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-ul:text-gray-700 prose-ol:text-gray-700"
                    dangerouslySetInnerHTML={{ __html: job.responsibilities }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {job.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-ul:text-gray-700 prose-ol:text-gray-700"
                    dangerouslySetInnerHTML={{ __html: job.requirements }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Education Requirements */}
            {job.educationRequirements && job.educationRequirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Education Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {job.educationRequirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Benefits & Perks */}
            {((job.benefits && job.benefits.length > 0) || (job.perks && job.perks.length > 0)) && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefits & Perks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {job.benefits && job.benefits.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Benefits</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.benefits.map((benefit) => (
                            <Badge key={benefit} variant="outline" className="text-sm">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {job.perks && job.perks.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Perks</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.perks.map((perk) => (
                            <Badge key={perk} variant="outline" className="text-sm">
                              {perk}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Application Instructions */}
            {job.applicationInstructions && (
              <Card>
                <CardHeader>
                  <CardTitle>Application Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{job.applicationInstructions}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Apply for this position</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{formatSalary(job.salary)}</span>
                  </div>
                  
                  {job.applicationDeadline && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Apply by {formatDate(job.applicationDeadline)}</span>
                    </div>
                  )}
                  
                  {job.expectedStartDate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Start date: {formatDate(job.expectedStartDate)}</span>
                    </div>
                  )}
                </div>
                
                {/* Required Documents */}
                {job.requiredDocuments && job.requiredDocuments.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Required Documents</h4>
                      <ul className="space-y-2">
                        {job.requiredDocuments.map((doc, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-700">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0" />
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
                
                <Separator />
                
                <div className="space-y-3">
                  <Link href={`/apply/${job._id}`}>
                    <Button className="w-full" size="lg">
                      Apply Now
                    </Button>
                  </Link>
                  
                  <div className="text-xs text-gray-500 text-center">
                    By applying, you agree to our terms of service and privacy policy
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
