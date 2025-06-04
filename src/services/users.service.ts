import { ApiClient } from '@/lib/api-client';

// User-related interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SUBADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  profilePicture?: string;
  phone?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  permissions?: string[];
}

// API User interface that matches the actual API response
export interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  profilePhoto?: string;
  phone?: string;
  permissions?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface SubAdmin extends User {
  role: 'SUBADMIN';
  assignedJobs?: string[];
  restrictions?: {
    canManageJobs: boolean;
    canManageApplications: boolean;
    canManageCandidates: boolean;
    canViewReports: boolean;
  };
  supervisor?: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  role: 'ADMIN' | 'SUBADMIN';
  phone?: string;
  department?: string;
  permissions?: string[];
  restrictions?: SubAdmin['restrictions'];
  supervisor?: string;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  department?: string;
  status?: User['status'];
  permissions?: string[];
  restrictions?: SubAdmin['restrictions'];
  supervisor?: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  lastActivityAt: string;
}

export interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserStatsResponse {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  pendingUsers: number;
  adminCount: number;
  subAdminCount: number;
  recentSignups: number;
}

// Users Service for Admin operations
export class UsersService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  // User CRUD operations
  async getUsers(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    role?: 'ADMIN' | 'SUBADMIN';
    status?: User['status'];
    department?: string;
    sortBy?: 'name' | 'email' | 'createdAt' | 'lastLoginAt';
    sortOrder?: 'asc' | 'desc';
  }): Promise<UsersListResponse> {
    return this.apiClient.get('/api/admin/users', {
      params,
      cache: { strategy: 'cache-first', ttl: 30000 } // 30 seconds cache
    });
  }

  async getUserById(userId: string): Promise<ApiUser> {
    return this.apiClient.get(`/api/admin/users/${userId}`, {
      cache: { strategy: 'cache-first', ttl: 60000 } // 1 minute cache
    });
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    return this.apiClient.post('/api/admin/users', userData);
  }

  async updateUser(userId: string, userData: UpdateUserRequest): Promise<User> {
    return this.apiClient.put(`/api/admin/users/${userId}`, userData);
  }

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    return this.apiClient.delete(`/api/admin/users/${userId}`);
  }

  async bulkDeleteUsers(userIds: string[]): Promise<{ success: boolean; message: string; deletedCount: number }> {
    return this.apiClient.post('/api/admin/users/bulk-delete', { userIds });
  }

  // Password management
  async changePassword(userId: string, passwordData: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    return this.apiClient.post(`/api/admin/users/${userId}/change-password`, passwordData);
  }

  async resetPassword(userId: string): Promise<{ success: boolean; message: string; temporaryPassword?: string }> {
    return this.apiClient.post(`/api/admin/users/${userId}/reset-password`);
  }

  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; message: string }> {
    return this.apiClient.post('/api/admin/users/send-password-reset', { email });
  }

  // Status management
  async activateUser(userId: string): Promise<{ success: boolean; message: string }> {
    return this.apiClient.post(`/api/admin/users/${userId}/activate`);
  }

  async deactivateUser(userId: string): Promise<{ success: boolean; message: string }> {
    return this.apiClient.post(`/api/admin/users/${userId}/deactivate`);
  }

  async bulkUpdateStatus(userIds: string[], status: User['status']): Promise<{ success: boolean; message: string; updatedCount: number }> {
    return this.apiClient.post('/api/admin/users/bulk-status-update', { userIds, status });
  }

  // Activity and sessions
  async getUserActivities(userId: string, params?: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    action?: string;
  }): Promise<{
    activities: UserActivity[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    return this.apiClient.get(`/api/admin/users/${userId}/activities`, {
      params,
      cache: { strategy: 'network-first', ttl: 10000 } // 10 seconds cache
    });
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    return this.apiClient.get(`/api/admin/users/${userId}/sessions`, {
      cache: { strategy: 'network-first', ttl: 5000 } // 5 seconds cache
    });
  }

  async terminateUserSession(userId: string, sessionId: string): Promise<{ success: boolean; message: string }> {
    return this.apiClient.post(`/api/admin/users/${userId}/sessions/${sessionId}/terminate`);
  }

  async terminateAllUserSessions(userId: string): Promise<{ success: boolean; message: string; terminatedCount: number }> {
    return this.apiClient.post(`/api/admin/users/${userId}/sessions/terminate-all`);
  }

  // Statistics and analytics
  async getUserStats(): Promise<UserStatsResponse> {
    return this.apiClient.get('/api/admin/users/stats', {
      cache: { strategy: 'cache-first', ttl: 300000 } // 5 minutes cache
    });
  }

  async exportUsers(params?: {
    role?: 'ADMIN' | 'SUBADMIN';
    status?: User['status'];
    department?: string;
    format?: 'csv' | 'xlsx';
  }): Promise<Blob> {
    return this.apiClient.download('/api/admin/users/export', { params });
  }

  // Profile management
  async updateProfile(userId: string, profileData: {
    name?: string;
    phone?: string;
    department?: string;
    profilePicture?: File;
  }): Promise<User> {
    const formData = new FormData();
    
    if (profileData.name) formData.append('name', profileData.name);
    if (profileData.phone) formData.append('phone', profileData.phone);
    if (profileData.department) formData.append('department', profileData.department);
    if (profileData.profilePicture) formData.append('profilePicture', profileData.profilePicture);

    return this.apiClient.upload(`/api/admin/users/${userId}/profile`, formData);
  }

  async uploadProfilePicture(userId: string, file: File): Promise<{ url: string; message: string }> {
    const formData = new FormData();
    formData.append('profilePicture', file);

    return this.apiClient.upload(`/api/admin/users/${userId}/profile-picture`, formData);
  }

  async deleteProfilePicture(userId: string): Promise<{ success: boolean; message: string }> {
    return this.apiClient.delete(`/api/admin/users/${userId}/profile-picture`);
  }
}

// SubAdmin-specific Users Service
export class SubAdminUsersService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  // SubAdmin can only view and manage their own profile
  async getMyProfile(): Promise<User> {
    return this.apiClient.get('/api/subadmin/profile', {
      cache: { strategy: 'cache-first', ttl: 60000 } // 1 minute cache
    });
  }

  async updateMyProfile(profileData: {
    name?: string;
    phone?: string;
    department?: string;
  }): Promise<User> {
    return this.apiClient.put('/api/subadmin/profile', profileData);
  }

  async changeMyPassword(passwordData: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    return this.apiClient.post('/api/subadmin/change-password', passwordData);
  }

  async uploadMyProfilePicture(file: File): Promise<{ url: string; message: string }> {
    const formData = new FormData();
    formData.append('profilePicture', file);

    return this.apiClient.upload('/api/subadmin/profile-picture', formData);
  }

  async deleteMyProfilePicture(): Promise<{ success: boolean; message: string }> {
    return this.apiClient.delete('/api/subadmin/profile-picture');
  }

  async getMyActivities(params?: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    action?: string;
  }): Promise<{
    activities: UserActivity[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    return this.apiClient.get('/api/subadmin/activities', {
      params,
      cache: { strategy: 'network-first', ttl: 10000 } // 10 seconds cache
    });
  }

  async getMySessions(): Promise<UserSession[]> {
    return this.apiClient.get('/api/subadmin/sessions', {
      cache: { strategy: 'network-first', ttl: 5000 } // 5 seconds cache
    });
  }

  async terminateMySession(sessionId: string): Promise<{ success: boolean; message: string }> {
    return this.apiClient.post(`/api/subadmin/sessions/${sessionId}/terminate`);
  }

  async terminateAllMySessions(): Promise<{ success: boolean; message: string; terminatedCount: number }> {
    return this.apiClient.post('/api/subadmin/sessions/terminate-all');
  }

  // View other SubAdmins (limited access)
  async getSubAdmins(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    department?: string;
  }): Promise<{
    subAdmins: SubAdmin[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    return this.apiClient.get('/api/subadmin/users', {
      params,
      cache: { strategy: 'cache-first', ttl: 60000 } // 1 minute cache
    });
  }

  async getSubAdminById(subAdminId: string): Promise<SubAdmin> {
    return this.apiClient.get(`/api/subadmin/users/${subAdminId}`, {
      cache: { strategy: 'cache-first', ttl: 60000 } // 1 minute cache
    });
  }
}

// Export service instances
export const usersService = new UsersService();
export const subAdminUsersService = new SubAdminUsersService();
