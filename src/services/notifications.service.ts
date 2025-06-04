import { ApiClient } from '@/lib/api-client';

// Notification interfaces
export interface Notification {
  id: string;
  userId: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'JOB_APPLICATION' | 'STATUS_UPDATE' | 'REMINDER' | 'SYSTEM';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  category: 'APPLICATION' | 'JOB' | 'CANDIDATE' | 'USER' | 'SYSTEM' | 'REMINDER' | 'WORKFLOW';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  actionUrl?: string;
  actionLabel?: string;
  expiresAt?: string;
  createdAt: string;
  readAt?: string;
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: {
    jobApplications: boolean;
    statusUpdates: boolean;
    reminders: boolean;
    systemAlerts: boolean;
    weeklyDigest: boolean;
  };
  pushNotifications: {
    jobApplications: boolean;
    statusUpdates: boolean;
    reminders: boolean;
    systemAlerts: boolean;
    mentions: boolean;
  };
  inAppNotifications: {
    all: boolean;
    jobApplications: boolean;
    statusUpdates: boolean;
    reminders: boolean;
    systemAlerts: boolean;
    mentions: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
    timezone: string;
  };
  frequency: 'REAL_TIME' | 'HOURLY' | 'DAILY' | 'WEEKLY';
  updatedAt: string;
}

export interface CreateNotificationRequest {
  userId?: string; // If not provided, uses current user
  userIds?: string[]; // For bulk notifications
  type: Notification['type'];
  title: string;
  message: string;
  data?: Record<string, any>;
  category: Notification['category'];
  priority?: Notification['priority'];
  actionUrl?: string;
  actionLabel?: string;
  expiresAt?: string;
  sendEmail?: boolean;
  sendPush?: boolean;
}

export interface NotificationsListResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<Notification['type'], number>;
  byCategory: Record<Notification['category'], number>;
  byPriority: Record<Notification['priority'], number>;
  todayCount: number;
  weekCount: number;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: Notification['type'];
  category: Notification['category'];
  title: string;
  message: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  type: Notification['type'];
  category: Notification['category'];
  title: string;
  message: string;
  variables?: string[];
  isActive?: boolean;
}

// Notifications Service
export class NotificationsService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  // Get notifications
  async getNotifications(params?: {
    page?: number;
    pageSize?: number;
    read?: boolean;
    type?: Notification['type'];
    category?: Notification['category'];
    priority?: Notification['priority'];
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<NotificationsListResponse> {
    return this.apiClient.get('/api/notifications', {
      params,
      cache: { strategy: 'network-first', ttl: 5000 } // 5 seconds cache
    });
  }

  async getUnreadNotifications(limit?: number): Promise<Notification[]> {
    return this.apiClient.get('/api/notifications/unread', {
      params: { limit },
      cache: { strategy: 'network-first', ttl: 3000 } // 3 seconds cache
    });
  }

  async getNotificationById(notificationId: string): Promise<Notification> {
    return this.apiClient.get(`/api/notifications/${notificationId}`, {
      cache: { strategy: 'cache-first', ttl: 30000 } // 30 seconds cache
    });
  }

  // Mark notifications as read/unread
  async markAsRead(notificationId: string): Promise<{ success: boolean; message: string }> {
    return this.apiClient.post(`/api/notifications/${notificationId}/read`);
  }

  async markAsUnread(notificationId: string): Promise<{ success: boolean; message: string }> {
    return this.apiClient.post(`/api/notifications/${notificationId}/unread`);
  }

  async markAllAsRead(): Promise<{ success: boolean; message: string; updatedCount: number }> {
    return this.apiClient.post('/api/notifications/mark-all-read');
  }

  async markMultipleAsRead(notificationIds: string[]): Promise<{ success: boolean; message: string; updatedCount: number }> {
    return this.apiClient.post('/api/notifications/mark-multiple-read', { notificationIds });
  }

  // Delete notifications
  async deleteNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
    return this.apiClient.delete(`/api/notifications/${notificationId}`);
  }

  async deleteMultipleNotifications(notificationIds: string[]): Promise<{ success: boolean; message: string; deletedCount: number }> {
    return this.apiClient.post('/api/notifications/delete-multiple', { notificationIds });
  }

  async deleteAllRead(): Promise<{ success: boolean; message: string; deletedCount: number }> {
    return this.apiClient.post('/api/notifications/delete-all-read');
  }

  async deleteOldNotifications(olderThanDays: number): Promise<{ success: boolean; message: string; deletedCount: number }> {
    return this.apiClient.post('/api/notifications/delete-old', { olderThanDays });
  }

  // Notification statistics
  async getNotificationStats(): Promise<NotificationStats> {
    return this.apiClient.get('/api/notifications/stats', {
      cache: { strategy: 'cache-first', ttl: 60000 } // 1 minute cache
    });
  }

  async getUnreadCount(): Promise<{ count: number }> {
    return this.apiClient.get('/api/notifications/unread-count', {
      cache: { strategy: 'network-first', ttl: 5000 } // 5 seconds cache
    });
  }

  // Preferences
  async getPreferences(): Promise<NotificationPreferences> {
    return this.apiClient.get('/api/notifications/preferences', {
      cache: { strategy: 'cache-first', ttl: 300000 } // 5 minutes cache
    });
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    return this.apiClient.put('/api/notifications/preferences', preferences);
  }

  async resetPreferences(): Promise<NotificationPreferences> {
    return this.apiClient.post('/api/notifications/preferences/reset');
  }

  // Real-time notifications (SSE)
  subscribeToNotifications(onNotification: (notification: Notification) => void): () => void {
    return this.apiClient.subscribeToSSE('/api/notifications/stream', {
      onMessage: (data) => {
        if (data.type === 'notification') {
          onNotification(data.notification);
        }
      },
      onError: (error) => {
        console.error('Notification stream error:', error);
      }
    });
  }

  subscribeToUnreadCount(onCountUpdate: (count: number) => void): () => void {
    return this.apiClient.subscribeToSSE('/api/notifications/unread-count/stream', {
      onMessage: (data) => {
        if (data.type === 'unread_count') {
          onCountUpdate(data.count);
        }
      },
      onError: (error) => {
        console.error('Unread count stream error:', error);
      }
    });
  }

  // Search and filtering
  async searchNotifications(query: string, params?: {
    page?: number;
    pageSize?: number;
    type?: Notification['type'];
    category?: Notification['category'];
    priority?: Notification['priority'];
    read?: boolean;
  }): Promise<NotificationsListResponse> {
    return this.apiClient.get('/api/notifications/search', {
      params: { ...params, q: query },
      cache: { strategy: 'network-first', ttl: 10000 } // 10 seconds cache
    });
  }

  // Export notifications
  async exportNotifications(params?: {
    type?: Notification['type'];
    category?: Notification['category'];
    priority?: Notification['priority'];
    read?: boolean;
    startDate?: string;
    endDate?: string;
    format?: 'csv' | 'xlsx' | 'json';
  }): Promise<Blob> {
    return this.apiClient.download('/api/notifications/export', { params });
  }
}

// Admin Notifications Service
export class AdminNotificationsService extends NotificationsService {
  // Create notifications (Admin only)
  async createNotification(notificationData: CreateNotificationRequest): Promise<Notification> {
    return this.apiClient.post('/api/admin/notifications', notificationData);
  }

  async createBulkNotifications(notifications: CreateNotificationRequest[]): Promise<{ 
    success: boolean; 
    created: number; 
    failed: number; 
    errors?: string[] 
  }> {
    return this.apiClient.post('/api/admin/notifications/bulk', { notifications });
  }

  async broadcastNotification(notificationData: Omit<CreateNotificationRequest, 'userId' | 'userIds'> & {
    targetRole?: 'ADMIN' | 'SUBADMIN' | 'ALL';
    targetDepartment?: string;
    excludeUserIds?: string[];
  }): Promise<{ success: boolean; sentCount: number; message: string }> {
    return this.apiClient.post('/api/admin/notifications/broadcast', notificationData);
  }

  // Get all users' notifications (Admin only)
  async getAllNotifications(params?: {
    page?: number;
    pageSize?: number;
    userId?: string;
    read?: boolean;
    type?: Notification['type'];
    category?: Notification['category'];
    priority?: Notification['priority'];
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<NotificationsListResponse> {
    return this.apiClient.get('/api/admin/notifications', {
      params,
      cache: { strategy: 'network-first', ttl: 10000 } // 10 seconds cache
    });
  }

  async getUserNotifications(userId: string, params?: {
    page?: number;
    pageSize?: number;
    read?: boolean;
    type?: Notification['type'];
    category?: Notification['category'];
    priority?: Notification['priority'];
    startDate?: string;
    endDate?: string;
  }): Promise<NotificationsListResponse> {
    return this.apiClient.get(`/api/admin/notifications/user/${userId}`, {
      params,
      cache: { strategy: 'network-first', ttl: 10000 } // 10 seconds cache
    });
  }

  // System-wide notification stats (Admin only)
  async getSystemNotificationStats(): Promise<{
    totalNotifications: number;
    totalUnread: number;
    byUser: Array<{
      userId: string;
      userName: string;
      total: number;
      unread: number;
    }>;
    byType: Record<Notification['type'], number>;
    byCategory: Record<Notification['category'], number>;
    byPriority: Record<Notification['priority'], number>;
    dailyStats: Array<{
      date: string;
      sent: number;
      read: number;
    }>;
  }> {
    return this.apiClient.get('/api/admin/notifications/stats', {
      cache: { strategy: 'cache-first', ttl: 300000 } // 5 minutes cache
    });
  }

  // Notification templates (Admin only)
  async getTemplates(): Promise<NotificationTemplate[]> {
    return this.apiClient.get('/api/admin/notifications/templates', {
      cache: { strategy: 'cache-first', ttl: 300000 } // 5 minutes cache
    });
  }

  async getTemplateById(templateId: string): Promise<NotificationTemplate> {
    return this.apiClient.get(`/api/admin/notifications/templates/${templateId}`, {
      cache: { strategy: 'cache-first', ttl: 300000 } // 5 minutes cache
    });
  }

  async createTemplate(templateData: CreateTemplateRequest): Promise<NotificationTemplate> {
    return this.apiClient.post('/api/admin/notifications/templates', templateData);
  }

  async updateTemplate(templateId: string, templateData: Partial<CreateTemplateRequest>): Promise<NotificationTemplate> {
    return this.apiClient.put(`/api/admin/notifications/templates/${templateId}`, templateData);
  }

  async deleteTemplate(templateId: string): Promise<{ success: boolean; message: string }> {
    return this.apiClient.delete(`/api/admin/notifications/templates/${templateId}`);
  }

  async sendFromTemplate(templateId: string, data: {
    userIds?: string[];
    targetRole?: 'ADMIN' | 'SUBADMIN' | 'ALL';
    targetDepartment?: string;
    variables?: Record<string, string>;
    priority?: Notification['priority'];
    sendEmail?: boolean;
    sendPush?: boolean;
  }): Promise<{ success: boolean; sentCount: number; message: string }> {
    return this.apiClient.post(`/api/admin/notifications/templates/${templateId}/send`, data);
  }

  // Cleanup operations (Admin only)
  async cleanupOldNotifications(olderThanDays: number, dryRun?: boolean): Promise<{
    success: boolean;
    message: string;
    affectedCount: number;
    deletedCount?: number;
  }> {
    return this.apiClient.post('/api/admin/notifications/cleanup', { 
      olderThanDays, 
      dryRun: dryRun ?? false 
    });
  }

  async purgeUserNotifications(userId: string): Promise<{ success: boolean; message: string; deletedCount: number }> {
    return this.apiClient.post(`/api/admin/notifications/user/${userId}/purge`);
  }
}

// Export service instances
export const notificationsService = new NotificationsService();
export const adminNotificationsService = new AdminNotificationsService();
