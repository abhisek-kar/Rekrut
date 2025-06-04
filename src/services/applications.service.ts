/**
 * Applications API Service
 * 
 * Handles all application-related API operations using the centralized API client
 */

import { apiClient, RequestConfig } from '@/lib/api-client';
import type { PaginatedResponse, BulkOperationResponse } from '@/types/api';

// =============================================
// TYPES
// =============================================

export interface Application {
  _id: string;
  jobId: string;
  candidateId: string;
  status: 'applied' | 'screening' | 'interview_scheduled' | 'interviewed' | 'offered' | 'hired' | 'rejected';
  applicationDate: string;
  source: string;
  resume?: {
    url: string;
    filename: string;
  };
  coverLetter?: string;
  customFields?: Record<string, any>;
  matchingScore?: {
    overall: number;
    skills: number;
    experience: number;
    education: number;
  };
  statusHistory: Array<{
    status: string;
    changedBy: string;
    changedAt: string;
    reason?: string;
    notes?: string;
  }>;
  notes: Array<{
    _id: string;
    content: string;
    addedBy: {
      _id: string;
      firstName: string;
      lastName: string;
    };
    addedAt: string;
    isPrivate: boolean;
  }>;
  documents: Array<{
    _id: string;
    filename: string;
    url: string;
    uploadedAt: string;
    uploadedBy: string;
  }>;
  interviews?: Array<{
    _id: string;
    scheduledAt: string;
    interviewers: string[];
    type: 'phone' | 'video' | 'onsite';
    status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  }>;
  job?: {
    _id: string;
    title: string;
    company: string;
  };
  candidate?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePhoto?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationListParams {
  page?: number;
  limit?: number;
  jobId?: string;
  candidateId?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  source?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateApplicationData {
  jobId: string;
  candidateId: string;
  source?: string;
  resume?: File;
  coverLetter?: string;
  customFields?: Record<string, any>;
}

export interface UpdateApplicationStatusData {
  status: 'applied' | 'screening' | 'interview_scheduled' | 'interviewed' | 'offered' | 'hired' | 'rejected';
  reason?: string;
  notes?: string;
  notifyCandidate?: boolean;
}

export interface BulkStatusUpdateData {
  applicationIds: string[];
  status: string;
  reason?: string;
  notifyCandidate?: boolean;
}

export interface AddNoteData {
  content: string;
  isPrivate?: boolean;
}

export interface ApplicationSummary {
  total: number;
  byStatus: Record<string, number>;
  recentApplications: Application[];
}

// =============================================
// APPLICATIONS SERVICE
// =============================================

export class ApplicationsService {
  private static readonly ENDPOINTS = {
    APPLICATIONS: '/applications',
    APPLICATION_BY_ID: (id: string) => `/applications/${id}`,
    APPLICATION_STATUS: (id: string) => `/applications/${id}/status`,
    APPLICATION_NOTES: (id: string) => `/applications/${id}/notes`,
    APPLICATION_DOCUMENTS: (id: string) => `/applications/${id}/documents`,
    BULK_STATUS_UPDATE: '/applications/bulk-status',
    APPLICATION_MATCHING: (id: string) => `/applications/${id}/matching`,
  } as const;

  /**
   * Get paginated list of applications
   */
  static async getApplications(
    params: ApplicationListParams = {},
    config?: RequestConfig
  ): Promise<PaginatedResponse<Application>> {
    return apiClient.get<PaginatedResponse<Application>>(
      ApplicationsService.ENDPOINTS.APPLICATIONS,
      {
        params,
        cache: {
          ttl: 30 * 1000, // Cache for 30 seconds
          strategy: 'network-first',
        },
        ...config,
      }
    );
  }

  /**
   * Get application by ID
   */
  static async getApplicationById(
    id: string,
    config?: RequestConfig
  ): Promise<Application> {
    return apiClient.get<Application>(
      ApplicationsService.ENDPOINTS.APPLICATION_BY_ID(id),
      {
        cache: {
          ttl: 60 * 1000, // Cache for 1 minute
          strategy: 'network-first',
        },
        ...config,
      }
    );
  }

  /**
   * Create new application
   */
  static async createApplication(
    data: CreateApplicationData,
    config?: RequestConfig
  ): Promise<Application> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'resume' && value instanceof File) {
        formData.append('resume', value);
      } else if (value !== undefined) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });

    return apiClient.upload<Application>(
      ApplicationsService.ENDPOINTS.APPLICATIONS,
      formData,
      config
    );
  }

  /**
   * Update application status
   */
  static async updateApplicationStatus(
    id: string,
    data: UpdateApplicationStatusData,
    config?: RequestConfig
  ): Promise<{ application: Application; message: string }> {
    return apiClient.put<{ application: Application; message: string }>(
      ApplicationsService.ENDPOINTS.APPLICATION_STATUS(id),
      data,
      config
    );
  }

  /**
   * Bulk update application statuses
   */
  static async bulkUpdateStatus(
    data: BulkStatusUpdateData,
    config?: RequestConfig
  ): Promise<BulkOperationResponse> {
    return apiClient.post<BulkOperationResponse>(
      ApplicationsService.ENDPOINTS.BULK_STATUS_UPDATE,
      data,
      config
    );
  }

  /**
   * Add note to application
   */
  static async addNote(
    id: string,
    data: AddNoteData,
    config?: RequestConfig
  ): Promise<{ note: any; message: string }> {
    return apiClient.post<{ note: any; message: string }>(
      ApplicationsService.ENDPOINTS.APPLICATION_NOTES(id),
      data,
      config
    );
  }

  /**
   * Get application notes
   */
  static async getNotes(
    id: string,
    config?: RequestConfig
  ): Promise<{ notes: any[] }> {
    return apiClient.get<{ notes: any[] }>(
      ApplicationsService.ENDPOINTS.APPLICATION_NOTES(id),
      {
        cache: {
          ttl: 60 * 1000, // Cache for 1 minute
          strategy: 'network-first',
        },
        ...config,
      }
    );
  }

  /**
   * Upload documents for application
   */
  static async uploadDocuments(
    id: string,
    files: File[],
    config?: RequestConfig
  ): Promise<{ documents: any[]; message: string }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('documents', file);
    });

    return apiClient.upload<{ documents: any[]; message: string }>(
      ApplicationsService.ENDPOINTS.APPLICATION_DOCUMENTS(id),
      formData,
      config
    );
  }

  /**
   * Get application documents
   */
  static async getDocuments(
    id: string,
    config?: RequestConfig
  ): Promise<{ documents: any[] }> {
    return apiClient.get<{ documents: any[] }>(
      ApplicationsService.ENDPOINTS.APPLICATION_DOCUMENTS(id),
      {
        cache: {
          ttl: 2 * 60 * 1000, // Cache for 2 minutes
          strategy: 'network-first',
        },
        ...config,
      }
    );
  }

  /**
   * Get AI matching details for application
   */
  static async getMatching(
    id: string,
    config?: RequestConfig
  ): Promise<{ matching: any; details: any }> {
    return apiClient.get<{ matching: any; details: any }>(
      ApplicationsService.ENDPOINTS.APPLICATION_MATCHING(id),
      {
        cache: {
          ttl: 5 * 60 * 1000, // Cache for 5 minutes
          strategy: 'cache-first',
        },
        ...config,
      }
    );
  }

  /**
   * Delete application
   */
  static async deleteApplication(
    id: string,
    config?: RequestConfig
  ): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      ApplicationsService.ENDPOINTS.APPLICATION_BY_ID(id),
      config
    );
  }
}

// =============================================
// SUBADMIN APPLICATIONS SERVICE
// =============================================

export class SubAdminApplicationsService {
  private static readonly ENDPOINTS = {
    APPLICATIONS: '/subadmin/applications',
    RECENT_APPLICATIONS: '/subadmin/applications/recent',
  } as const;

  /**
   * Get SubAdmin applications
   */
  static async getApplications(
    params: ApplicationListParams = {},
    config?: RequestConfig
  ): Promise<{
    applications: Application[];
    counts: Record<string, number>;
    pagination: any;
  }> {
    return apiClient.get<{
      applications: Application[];
      counts: Record<string, number>;
      pagination: any;
    }>(
      SubAdminApplicationsService.ENDPOINTS.APPLICATIONS,
      {
        params,
        cache: {
          ttl: 30 * 1000, // Cache for 30 seconds
          strategy: 'network-first',
        },
        ...config,
      }
    );
  }

  /**
   * Get recent applications for SubAdmin
   */
  static async getRecentApplications(
    params: {
      limit?: number;
      page?: number;
    } = {},
    config?: RequestConfig
  ): Promise<{
    applications: Application[];
    pagination: any;
  }> {
    return apiClient.get<{
      applications: Application[];
      pagination: any;
    }>(
      SubAdminApplicationsService.ENDPOINTS.RECENT_APPLICATIONS,
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
}

// =============================================
// EXPORTS
// =============================================

export const applicationsService = {
  main: ApplicationsService,
  subadmin: SubAdminApplicationsService,
};

export default applicationsService;
