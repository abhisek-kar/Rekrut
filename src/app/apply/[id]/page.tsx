"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Briefcase, Clock, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/shadcn-ui/button';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { Alert, AlertDescription } from '@/components/shadcn-ui/alert';
import { Card, CardContent } from '@/components/shadcn-ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import MultiStepApplicationForm, { ApplicationData } from '@/components/organisms/application/MultiStepApplicationForm';

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
  employmentType?: string;
  experienceLevel?: string;
  skills?: string[];
  requiredDocuments?: string[];
  screeningQuestions?: Array<{
    id: string;
    question: string;
    required: boolean;
  }>;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string[];
  perks?: string[];
  applicationDeadline?: string;
  expectedStartDate?: string;
  applicationInstructions?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    visible?: boolean;
  };
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function JobApplicationPage() {
  const params = useParams();
  const router = useRouter();
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

  const handleBackToJob = () => {
    router.push(`/jobs/${jobId}`);
  };

  // Check if application deadline has passed
  const isApplicationDeadlinePassed = () => {
    if (!job?.applicationDeadline) return false;
    return new Date() > new Date(job.applicationDeadline);
  };

  // Format deadline for display
  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if deadline is within 24 hours
  const isDeadlineNear = () => {
    if (!job?.applicationDeadline) return false;
    const deadline = new Date(job.applicationDeadline);
    const now = new Date();
    const hoursDiff = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDiff > 0 && hoursDiff <= 24;
  };

  const handleApplicationSubmit = async (data: ApplicationData, files: FormData) => {
    try {
      // Check deadline before submission
      if (isApplicationDeadlinePassed()) {
        toast.error('The application deadline for this position has passed.');
        return;
      }

      // Add job ID to form data
      files.append('jobId', jobId);
      files.append('applicationData', JSON.stringify(data));

      const response = await fetch('/api/applications', {
        method: 'POST',
        body: files,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit application');
      }

      const result = await response.json();
      
      toast.success('Application submitted successfully!');
      router.push(`/application-success?token=${result.token}`);
      
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit application. Please try again.');
      throw error; // Re-throw to let the form handle the error state
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
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
              The job you're trying to apply for might have been removed or is no longer available.
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
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Apply for {job.title}</h1>
            <p className="text-gray-600">
              {job.company} • {getLocationString(job.location)}
            </p>
          </div>
        </div>

        {/* Application Deadline Warning */}
        {job.applicationDeadline && (
          <div className="mb-6">
            {isApplicationDeadlinePassed() ? (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-300">
                  <strong>Application Closed:</strong> The deadline for this position was{" "}
                  {formatDeadline(job.applicationDeadline)}. Applications are no longer being accepted.
                </AlertDescription>
              </Alert>
            ) : isDeadlineNear() ? (
              <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/10">
                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <AlertDescription className="text-orange-800 dark:text-orange-300">
                  <strong>Deadline Approaching:</strong> Applications close on{" "}
                  {formatDeadline(job.applicationDeadline)}. Apply soon!
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-300">
                  <strong>Application Deadline:</strong> {formatDeadline(job.applicationDeadline)}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Application Instructions */}
        {job.applicationInstructions && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Application Instructions</h3>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {job.applicationInstructions}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Block application if deadline passed */}
        {isApplicationDeadlinePassed() ? (
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">
              <AlertTriangle className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Application Period Closed
            </h2>
            <p className="text-gray-600 mb-6">
              The application deadline for this position has passed. Please check other available positions.
            </p>
            <Link href="/jobs">
              <Button>Browse Other Jobs</Button>
            </Link>
          </div>
        ) : (
          /* Multi-Step Application Form */
          <MultiStepApplicationForm 
            job={job} 
            onSubmit={handleApplicationSubmit}
            onBack={handleBackToJob}
          />
        )}
      </div>
    </div>
  );
}
