/**
 * Jobs API Service
 * 
 * Handles all job-related API operations using the centralized API client
 */

import { apiClient, RequestConfig } from '@/lib/api-client';
import type { PaginatedResponse } from '@/types/api';

// =============================================
// TYPES
// =============================================

export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  workMode: 'remote' | 'onsite' | 'hybrid';
  status: 'draft' | 'active' | 'paused' | 'closed' | 'archived';
  createdBy: string;
  assignedTo?: string;
  applicationDeadline?: string;
  startDate?: string;
  tags: string[];
  skillsRequired: string[];
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  viewCount: number;
  applicationCount: number;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  assignedTo?: string;
  createdBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface JobStats {
  views: number;
  applications: number;
  hires: number;
  shares: number;
  conversionRate: string;
  statusBreakdown: Record<string, number>;
  sourceBreakdown: Record<string, number>;
  datePosted: string;
  lastActivity: string;
}

export interface CreateJobData {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits?: string[];
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  workMode: 'remote' | 'onsite' | 'hybrid';
  applicationDeadline?: string;
  startDate?: string;
  tags?: string[];
  skillsRequired?: string[];
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  assignedTo?: string;
}

export interface UpdateJobData extends Partial<CreateJobData> {
  status?: 'draft' | 'active' | 'paused' | 'closed' | 'archived';
}

// =============================================
// JOBS SERVICE
// =============================================

export class JobsService {
  private static readonly ENDPOINTS = {
    JOBS: '/jobs',
    JOB_BY_ID: (id: string) => `/jobs/${id}`,
    JOB_STATS: (id: string) => `/jobs/stats/${id}`,
    JOB_STATUS: (id: string) => `/jobs/${id}/status`,
    JOB_DOCUMENTS: (id: string) => `/jobs/${id}/documents`,
    ASSIGNED_JOBS: '/jobs/assigned',
    JOB_TEMPLATES: '/jobs/templates',
  } as const;

  /**
   * Get paginated list of jobs
   */
  static async getJobs(
    params: JobListParams = {},
    config?: RequestConfig
  ): Promise<PaginatedResponse<Job>> {
    return apiClient.get<PaginatedResponse<Job>>(
      JobsService.ENDPOINTS.JOBS,
      {
        params,
        cache: {
          ttl: 60 * 1000, // Cache for 1 minute
          strategy: 'network-first',
        },
        ...config,
      }
    );
  }

  /**
   * Get job by ID
   */
  static async getJobById(
    id: string,
    config?: RequestConfig
  ): Promise<Job> {
    return apiClient.get<Job>(
      JobsService.ENDPOINTS.JOB_BY_ID(id),
      {
        cache: {
          ttl: 2 * 60 * 1000, // Cache for 2 minutes
          strategy: 'cache-first',
        },
        ...config,
      }
    );
  }

  /**
   * Create new job
   */
  static async createJob(
    data: CreateJobData,
    config?: RequestConfig
  ): Promise<Job> {
    return apiClient.post<Job>(
      JobsService.ENDPOINTS.JOBS,
      data,
      config
    );
  }

  /**
   * Update job
   */
  static async updateJob(
    id: string,
    data: UpdateJobData,
    config?: RequestConfig
  ): Promise<Job> {
    return apiClient.put<Job>(
      JobsService.ENDPOINTS.JOB_BY_ID(id),
      data,
      config
    );
  }

  /**
   * Delete job
   */
  static async deleteJob(
    id: string,
    config?: RequestConfig
  ): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      JobsService.ENDPOINTS.JOB_BY_ID(id),
      config
    );
  }

  /**
   * Update job status
   */
  static async updateJobStatus(
    id: string,
    status: 'draft' | 'active' | 'paused' | 'closed' | 'archived',
    config?: RequestConfig
  ): Promise<{ job: Job; message: string }> {
    return apiClient.put<{ job: Job; message: string }>(
      JobsService.ENDPOINTS.JOB_STATUS(id),
      { status },
      config
    );
  }

  /**
   * Get job statistics
   */
  static async getJobStats(
    id: string,
    config?: RequestConfig
  ): Promise<JobStats> {
    return apiClient.get<JobStats>(
      JobsService.ENDPOINTS.JOB_STATS(id),
      {
        cache: {
          ttl: 5 * 60 * 1000, // Cache for 5 minutes
          strategy: 'network-first',
        },
        ...config,
      }
    );
  }

  /**
   * Get assigned jobs for SubAdmin
   */
  static async getAssignedJobs(
    params: JobListParams = {},
    config?: RequestConfig
  ): Promise<PaginatedResponse<Job>> {
    return apiClient.get<PaginatedResponse<Job>>(
      JobsService.ENDPOINTS.ASSIGNED_JOBS,
      {
        params,
        cache: {
          ttl: 60 * 1000, // Cache for 1 minute
          strategy: 'network-first',
        },
        ...config,
      }
    );
  }

  /**
   * Get job templates
   */
  static async getJobTemplates(
    params: Omit<JobListParams, 'status'> = {},
    config?: RequestConfig
  ): Promise<PaginatedResponse<Job>> {
    return apiClient.get<PaginatedResponse<Job>>(
      JobsService.ENDPOINTS.JOB_TEMPLATES,
      {
        params,
        cache: {
          ttl: 5 * 60 * 1000, // Cache for 5 minutes
          strategy: 'cache-first',
        },
        ...config,
      }
    );
  }

  /**
   * Create job from template
   */
  static async createJobFromTemplate(
    templateId: string,
    data: Partial<CreateJobData>,
    config?: RequestConfig
  ): Promise<Job> {
    return apiClient.post<Job>(
      JobsService.ENDPOINTS.JOB_TEMPLATES,
      { templateId, ...data },
      config
    );
  }

  /**
   * Upload documents for job
   */
  static async uploadJobDocuments(
    id: string,
    files: File[],
    config?: RequestConfig
  ): Promise<{ documents: any[]; message: string }> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`documents`, file);
    });

    return apiClient.upload<{ documents: any[]; message: string }>(
      JobsService.ENDPOINTS.JOB_DOCUMENTS(id),
      formData,
      config
    );
  }

  /**
   * Get job documents
   */
  static async getJobDocuments(
    id: string,
    config?: RequestConfig
  ): Promise<{ documents: any[] }> {
    return apiClient.get<{ documents: any[] }>(
      JobsService.ENDPOINTS.JOB_DOCUMENTS(id),
      {
        cache: {
          ttl: 2 * 60 * 1000, // Cache for 2 minutes
          strategy: 'network-first',
        },
        ...config,
      }
    );
  }
}

// =============================================
// SUBADMIN JOBS SERVICE
// =============================================

export class SubAdminJobsService {
  private static readonly ENDPOINTS = {
    JOBS: '/subadmin/jobs',
    JOBS_SUMMARY: '/subadmin/jobs/summary',
  } as const;

  /**
   * Get SubAdmin jobs
   */
  static async getJobs(
    params: JobListParams = {},
    config?: RequestConfig
  ): Promise<PaginatedResponse<Job & { applicationCounts: any }>> {
    return apiClient.get<PaginatedResponse<Job & { applicationCounts: any }>>(
      SubAdminJobsService.ENDPOINTS.JOBS,
      {
        params,
        cache: {
          ttl: 60 * 1000, // Cache for 1 minute
          strategy: 'network-first',
        },
        ...config,
      }
    );
  }

  /**
   * Get jobs summary for SubAdmin
   */
  static async getJobsSummary(
    params: {
      status?: string;
      limit?: number;
      page?: number;
    } = {},
    config?: RequestConfig
  ): Promise<PaginatedResponse<Job & { applicationCounts: any }>> {
    return apiClient.get<PaginatedResponse<Job & { applicationCounts: any }>>(
      SubAdminJobsService.ENDPOINTS.JOBS_SUMMARY,
      {
        params,
        cache: {
          ttl: 2 * 60 * 1000, // Cache for 2 minutes
          strategy: 'network-first',
        },
        ...config,
      }
    );
  }
}

// =============================================
// EXPORTS
// =============================================

export const jobsService = {
  main: JobsService,
  subadmin: SubAdminJobsService,
};

export default jobsService;
