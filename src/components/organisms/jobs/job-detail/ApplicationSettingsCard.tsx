'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { DollarSign, Users, Calendar, Clock, FileText } from "lucide-react";
import { JobType } from '@/types/job';

interface ApplicationSettingsCardProps {
  job: JobType;
}

export function ApplicationSettingsCard({ job }: ApplicationSettingsCardProps) {
  // Format date for display
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount: number | undefined, currency = 'USD') => {
    if (amount === undefined) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format salary range
  const formatSalaryRange = () => {
    if (!job.salary) return 'Not specified';
    
    const { min, max, currency = 'USD' } = job.salary;
    
    if (min && max) {
      return `${formatCurrency(min, currency)} - ${formatCurrency(max, currency)}`;
    } else if (min) {
      return `From ${formatCurrency(min, currency)}`;
    } else if (max) {
      return `Up to ${formatCurrency(max, currency)}`;
    }
    
    return 'Not specified';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Job Info Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Salary */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Salary Range</p>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-primary" />
              <span>
                {formatSalaryRange()}
                {job.salary?.visible 
                  ? ' (Visible to candidates)' 
                  : ' (Not visible to candidates)'}
              </span>
            </div>
          </div>
          
          {/* Experience Level */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Experience Level</p>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1 text-primary" />
              <span>
                {job.experienceLevel
                  ? `${job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)} Level`
                  : 'Not specified'}
              </span>
            </div>
          </div>
          
          {/* Application Deadline */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Application Deadline</p>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-primary" />
              <span>
                {job.applicationDeadline 
                  ? formatDate(job.applicationDeadline)
                  : 'No deadline specified'}
              </span>
            </div>
          </div>
          
          {/* Working Hours */}
          {job.workingHours && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Working Hours</p>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-primary" />
                <span>{job.workingHours}</span>
              </div>
            </div>
          )}
          
          {/* Expected Start Date */}
          {job.expectedStartDate && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Expected Start Date</p>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-primary" />
                <span>{formatDate(job.expectedStartDate)}</span>
              </div>
            </div>
          )}
          
          {/* Referral Bonus */}
          {job.referralBonus && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Referral Bonus</p>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1 text-primary" />
                <span>{job.referralBonus}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Application Instructions */}
        {job.applicationInstructions && (
          <div className="space-y-2">
            <h3 className="text-md font-medium">Application Instructions</h3>
            <p>{job.applicationInstructions}</p>
          </div>
        )}
        
        {/* Required Documents */}
        {job.requiredDocuments && job.requiredDocuments.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-md font-medium">Required Documents</h3>
            <div className="flex flex-wrap gap-4">
              {job.requiredDocuments.map((document, index) => (
                <div key={index} className="flex items-center">
                  <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>{document}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Internal Notes */}
        {job.internalNotes && (
          <div className="space-y-2 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-md font-medium text-blue-800">Internal Notes</h3>
            <p className="text-blue-800">{job.internalNotes}</p>
            <p className="text-xs text-blue-600">
              Note: Internal notes are only visible to team members, not candidates
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
