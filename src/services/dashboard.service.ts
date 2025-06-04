/**
 * Dashboard API Service
 * 
 * Handles all dashboard-related API operations using the centralized API client
 */

import { apiClient, RequestConfig } from '@/lib/api-client';
import type { Activity } from '@/components/admin/dashboard/activity-feed';

// =============================================
// TYPES
// =============================================

export interface DashboardMetrics {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  candidatesInPipeline: number;
  hiringRate: number;
  totalCandidates: number;
  totalSubadmins: number;
}

export interface JobStatusDistribution {
  status: 'active' | 'draft' | 'closed' | 'archived';
  count: number;
  percentage: number;
}

export interface ApplicationFunnelData {
  stage: string;
  count: number;
  percentage: number;
}

export interface ApplicationsOverTime {
  date: string;
  applications: number;
  hires: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  charts: {
    jobStatusDistribution: JobStatusDistribution[];
    applicationFunnel: ApplicationFunnelData[];
    applicationsOverTime: ApplicationsOverTime[];
  };
}

export interface ActivityListParams {
  limit?: number;
  page?: number;
  type?: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
}

export interface ActivityListResponse {
  activities: Activity[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// =============================================
// ADMIN DASHBOARD SERVICE
// =============================================

export class AdminDashboardService {
  private static readonly ENDPOINTS = {
    DASHBOARD: '/admin/dashboard',
    ACTIVITY: '/admin/activity',
  } as const;

  /**
   * Get admin dashboard data with optional date range
   */
  static async getDashboardData(
    dateRange: string = '30days',
    config?: RequestConfig
  ): Promise<DashboardData> {
    return apiClient.get<DashboardData>(
      AdminDashboardService.ENDPOINTS.DASHBOARD,
      {
        params: { dateRange },
        cache: {
          ttl: 5 * 60 * 1000, // Cache for 5 minutes
          strategy: 'cache-first',
        },
        ...config,
      }
    );
  }

  /**
   * Get activity feed data
   */
  static async getActivities(
    params: ActivityListParams = {},
    config?: RequestConfig
  ): Promise<ActivityListResponse> {
    const {
      limit = 10,
      page = 1,
      type = 'all',
      userId,
      entityType,
      entityId,
    } = params;

    return apiClient.get<ActivityListResponse>(
      AdminDashboardService.ENDPOINTS.ACTIVITY,
      {
        params: {
          limit,
          page,
          type,
          ...(userId && { userId }),
          ...(entityType && { entityType }),
          ...(entityId && { entityId }),
        },
        cache: {
          ttl: 2 * 60 * 1000, // Cache for 2 minutes
          strategy: 'network-first',
        },
        ...config,
      }
    );
  }

  /**
   * Get activities for a specific user
   */
  static async getUserActivities(
    userId: string,
    params: Omit<ActivityListParams, 'userId'> = {},
    config?: RequestConfig
  ): Promise<ActivityListResponse> {
    return AdminDashboardService.getActivities(
      { ...params, userId },
      config
    );
  }

  /**
   * Get activities for a specific entity (job, candidate, etc.)
   */
  static async getEntityActivities(
    entityType: string,
    entityId: string,
    params: Omit<ActivityListParams, 'entityType' | 'entityId'> = {},
    config?: RequestConfig
  ): Promise<ActivityListResponse> {
    return AdminDashboardService.getActivities(
      { ...params, entityType, entityId },
      config
    );
  }
}

// =============================================
// SUBADMIN DASHBOARD SERVICE
// =============================================

export interface SubAdminMetrics {
  assignedJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  interviewsScheduled: number;
  pendingTasks: number;
}

export class SubAdminDashboardService {
  private static readonly ENDPOINTS = {
    DASHBOARD: '/subadmin/dashboard',
    JOBS_SUMMARY: '/subadmin/jobs/summary',
    APPLICATIONS_RECENT: '/subadmin/applications/recent',
    TASKS: '/subadmin/tasks',
  } as const;

  /**
   * Get subadmin dashboard metrics
   */
  static async getDashboardMetrics(
    config?: RequestConfig
  ): Promise<{ metrics: SubAdminMetrics }> {
    return apiClient.get<{ metrics: SubAdminMetrics }>(
      SubAdminDashboardService.ENDPOINTS.DASHBOARD,
      {
        cache: {
          ttl: 3 * 60 * 1000, // Cache for 3 minutes
          strategy: 'cache-first',
        },
        ...config,
      }
    );
  }

  /**
   * Get jobs summary for subadmin
   */
  static async getJobsSummary(
    status: string = 'all',
    limit: number = 10,
    config?: RequestConfig
  ): Promise<any> {
    return apiClient.get(
      SubAdminDashboardService.ENDPOINTS.JOBS_SUMMARY,
      {
        params: { status, limit },
        cache: {
          ttl: 2 * 60 * 1000, // Cache for 2 minutes
          strategy: 'network-first',
        },
        ...config,
      }
    );
  }

  /**
   * Get recent applications for subadmin
   */
  static async getRecentApplications(
    limit: number = 10,
    page: number = 1,
    config?: RequestConfig
  ): Promise<any> {
    return apiClient.get(
      SubAdminDashboardService.ENDPOINTS.APPLICATIONS_RECENT,
      {
        params: { limit, page },
        cache: {
          ttl: 1 * 60 * 1000, // Cache for 1 minute
          strategy: 'network-first',
        },
        ...config,
      }
    );
  }

  /**
   * Get tasks for subadmin
   */
  static async getTasks(
    status: string = 'pending',
    limit: number = 10,
    config?: RequestConfig
  ): Promise<any> {
    return apiClient.get(
      SubAdminDashboardService.ENDPOINTS.TASKS,
      {
        params: { status, limit },
        cache: {
          ttl: 1 * 60 * 1000, // Cache for 1 minute
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

export const dashboardService = {
  admin: AdminDashboardService,
  subadmin: SubAdminDashboardService,
};

export default dashboardService;
