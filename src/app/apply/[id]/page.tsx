"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { Button } from '@/components/shadcn-ui/button';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
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

  const handleApplicationSubmit = async (data: ApplicationData, files: FormData) => {
    try {
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

        {/* Multi-Step Application Form */}
        <MultiStepApplicationForm 
          job={job} 
          onSubmit={handleApplicationSubmit}
          onBack={handleBackToJob}
        />
      </div>
    </div>
  );
}
