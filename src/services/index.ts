// Core API Client
export { ApiClient } from '@/lib/api-client';

// Service Classes
export { 
  AuthService, 
  authService 
} from './auth.service';

export { 
  UsersService, 
  SubAdminUsersService, 
  usersService, 
  subAdminUsersService 
} from './users.service';

export { 
  AdminDashboardService, 
  SubAdminDashboardService
} from './dashboard.service';

export { 
  JobsService, 
  SubAdminJobsService, 
  jobsService, 
} from './jobs.service';

export { 
  ApplicationsService, 
  SubAdminApplicationsService, 
  applicationsService, 
} from './applications.service';

export { 
  CandidatesService, 
  SubAdminCandidatesService, 
  candidatesService, 
  subAdminCandidatesService 
} from './candidates.service';

export { 
  NotificationsService, 
  AdminNotificationsService, 
  notificationsService, 
  adminNotificationsService 
} from './notifications.service';

export { 
  TasksService, 
  AdminTasksService, 
  tasksService, 
  adminTasksService 
} from './tasks.service';

// Type exports for convenience
export type { 
  // Auth types
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ValidateTokenResponse 
} from './auth.service';

export type { 
  // User types
  User, 
  SubAdmin, 
  CreateUserRequest, 
  UpdateUserRequest,
  UserActivity,
  UserSession,
  UsersListResponse,
  UserStatsResponse 
} from './users.service';

export type { 
  // Dashboard types
  AdminDashboardData, 
  SubAdminDashboardData,
  DashboardActivity,
  DashboardMetrics,
  JobsSummary,
  RecentApplication 
} from './dashboard.service';

export type { 
  // Jobs types
  Job, 
  JobTemplate, 
  CreateJobRequest, 
  UpdateJobRequest,
  JobsListResponse,
  JobStats,
  JobDocument 
} from './jobs.service';

export type { 
  // Applications types
  Application, 
  ApplicationNote, 
  ApplicationDocument,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  ApplicationsListResponse,
  ApplicationStats,
  BulkStatusUpdateRequest 
} from './applications.service';

export type { 
  // Candidates types
  Candidate, 
  CandidateNote, 
  CandidateDocument,
  CreateCandidateRequest,
  UpdateCandidateRequest,
  CandidatesListResponse,
  CandidateStats,
  CandidateSkill,
  CandidateEducation,
  CandidateWorkExperience 
} from './candidates.service';

export type { 
  // Notifications types
  Notification, 
  NotificationPreferences,
  CreateNotificationRequest,
  NotificationsListResponse,
  NotificationStats,
  NotificationTemplate 
} from './notifications.service';

export type { 
  // Tasks types
  Task, 
  TaskComment, 
  CreateTaskRequest, 
  UpdateTaskRequest,
  TasksListResponse,
  TaskStats,
  TaskTemplate,
  TaskActivity,
  BulkTaskOperation 
} from './tasks.service';

// Centralized service registry for dependency injection or global access
export const serviceRegistry = {
// Create service instances
const adminDashboardService = new AdminDashboardService();
const subAdminDashboardService = new SubAdminDashboardService();

// Centralized service registry for dependency injection or global access
export const serviceRegistry = {
  auth: authService,
  users: usersService,
  subAdminUsers: subAdminUsersService,
  adminDashboard: adminDashboardService,
  subAdminDashboard: subAdminDashboardService,
  jobs: jobsService,
  subAdminJobs: subAdminJobsService,
  applications: applicationsService,
  subAdminApplications: subAdminApplicationsService,
  candidates: candidatesService,
  subAdminCandidates: subAdminCandidatesService,
  notifications: notificationsService,
  adminNotifications: adminNotificationsService,
  tasks: tasksService,
  adminTasks: adminTasksService,
};
export function getServicesForRole(role: 'ADMIN' | 'SUBADMIN') {
  const common = {
    auth: authService,
    notifications: notificationsService,
    tasks: tasksService,
  };

  if (role === 'ADMIN') {
    return {
      ...common,
      users: usersService,
      dashboard: adminDashboardService,
      jobs: jobsService,
      applications: applicationsService,
      candidates: candidatesService,
      adminNotifications: adminNotificationsService,
      adminTasks: adminTasksService,
    };
  } else {
    return {
      ...common,
      users: subAdminUsersService,
      dashboard: subAdminDashboardService,
      jobs: subAdminJobsService,
      applications: subAdminApplicationsService,
      candidates: subAdminCandidatesService,
    };
  }
}

// Utility function to get the appropriate service based on user role
export function getRoleBasedService<T extends keyof typeof serviceRegistry>(
  serviceName: T,
  userRole: 'ADMIN' | 'SUBADMIN'
): any {
  const services = getServicesForRole(userRole);
  return services[serviceName as keyof typeof services];
}

// Export default service instances for quick access
export default serviceRegistry;
