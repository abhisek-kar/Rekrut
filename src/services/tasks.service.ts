import { ApiClient } from '@/lib/api-client';

// Task interfaces
export interface Task {
  id: string;
  title: string;
  description?: string;
  type: 'REVIEW_APPLICATION' | 'INTERVIEW_CANDIDATE' | 'FOLLOW_UP' | 'DOCUMENT_VERIFICATION' | 'CUSTOM';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo: string; // User ID
  assignedBy: string; // User ID
  assigneeName: string;
  assignerName: string;
  relatedEntity?: {
    type: 'APPLICATION' | 'CANDIDATE' | 'JOB' | 'USER';
    id: string;
    name: string;
  };
  dueDate?: string;
  completedAt?: string;
  estimatedDuration?: number; // minutes
  actualDuration?: number; // minutes
  tags?: string[];
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
  comments?: TaskComment[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userRole: string;
  content: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  type: Task['type'];
  priority?: Task['priority'];
  assignedTo: string;
  relatedEntity?: Task['relatedEntity'];
  dueDate?: string;
  estimatedDuration?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  type?: Task['type'];
  status?: Task['status'];
  priority?: Task['priority'];
  assignedTo?: string;
  dueDate?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface TasksListResponse {
  tasks: Task[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  cancelled: number;
  byPriority: Record<Task['priority'], number>;
  byType: Record<Task['type'], number>;
  assignedToMe: number;
  assignedByMe: number;
  completedToday: number;
  completedThisWeek: number;
  dueToday: number;
  dueThisWeek: number;
  averageCompletionTime?: number; // minutes
}

export interface TaskTemplate {
  id: string;
  name: string;
  title: string;
  description?: string;
  type: Task['type'];
  priority: Task['priority'];
  estimatedDuration?: number;
  tags?: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskTemplateRequest {
  name: string;
  title: string;
  description?: string;
  type: Task['type'];
  priority?: Task['priority'];
  estimatedDuration?: number;
  tags?: string[];
  isActive?: boolean;
}

export interface BulkTaskOperation {
  taskIds: string[];
  operation: 'UPDATE_STATUS' | 'UPDATE_PRIORITY' | 'REASSIGN' | 'DELETE' | 'ADD_TAGS' | 'REMOVE_TAGS';
  data: {
    status?: Task['status'];
    priority?: Task['priority'];
    assignedTo?: string;
    tags?: string[];
  };
}

export interface TaskActivity {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  action: 'CREATED' | 'UPDATED' | 'COMPLETED' | 'CANCELLED' | 'REASSIGNED' | 'COMMENTED' | 'STATUS_CHANGED';
  description: string;
  oldValue?: any;
  newValue?: any;
  createdAt: string;
}

// Tasks Service
export class TasksService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  // Get tasks
  async getTasks(params?: {
    page?: number;
    pageSize?: number;
    status?: Task['status'];
    priority?: Task['priority'];
    type?: Task['type'];
    assignedTo?: string;
    assignedBy?: string;
    relatedEntityType?: 'APPLICATION' | 'CANDIDATE' | 'JOB' | 'USER';
    relatedEntityId?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    tags?: string[];
    search?: string;
    sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'title' | 'status';
    sortOrder?: 'asc' | 'desc';
  }): Promise<TasksListResponse> {
    return this.apiClient.get('/api/tasks', {
      params,
      cache: { strategy: 'network-first', ttl: 10000 } // 10 seconds cache
    });
  }

  async getMyTasks(params?: {
    page?: number;
    pageSize?: number;
    status?: Task['status'];
    priority?: Task['priority'];
    type?: Task['type'];
    dueDateFrom?: string;
    dueDateTo?: string;
    tags?: string[];
    search?: string;
    sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'title' | 'status';
    sortOrder?: 'asc' | 'desc';
  }): Promise<TasksListResponse> {
    return this.apiClient.get('/api/tasks/my-tasks', {
      params,
      cache: { strategy: 'network-first', ttl: 5000 } // 5 seconds cache
    });
  }

  async getTasksAssignedByMe(params?: {
    page?: number;
    pageSize?: number;
    status?: Task['status'];
    priority?: Task['priority'];
    assignedTo?: string;
    search?: string;
  }): Promise<TasksListResponse> {
    return this.apiClient.get('/api/tasks/assigned-by-me', {
      params,
      cache: { strategy: 'network-first', ttl: 10000 } // 10 seconds cache
    });
  }

  async getTaskById(taskId: string): Promise<Task> {
    return this.apiClient.get(`/api/tasks/${taskId}`, {
      cache: { strategy: 'cache-first', ttl: 30000 } // 30 seconds cache
    });
  }

  // Create and update tasks
  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    return this.apiClient.post('/api/tasks', taskData);
  }

  async updateTask(taskId: string, taskData: UpdateTaskRequest): Promise<Task> {
    return this.apiClient.put(`/api/tasks/${taskId}`, taskData);
  }

  async deleteTask(taskId: string): Promise<{ success: boolean; message: string }> {
    return this.apiClient.delete(`/api/tasks/${taskId}`);
  }

  // Task status management
  async startTask(taskId: string): Promise<Task> {
    return this.apiClient.post(`/api/tasks/${taskId}/start`);
  }

  async completeTask(taskId: string, completionData?: {
    actualDuration?: number;
    completionNotes?: string;
    attachments?: File[];
  }): Promise<Task> {
    if (completionData?.attachments?.length) {
      const formData = new FormData();
      if (completionData.actualDuration) {
        formData.append('actualDuration', completionData.actualDuration.toString());
      }
      if (completionData.completionNotes) {
        formData.append('completionNotes', completionData.completionNotes);
      }
      completionData.attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });
      
      return this.apiClient.upload(`/api/tasks/${taskId}/complete`, formData);
    } else {
      return this.apiClient.post(`/api/tasks/${taskId}/complete`, completionData);
    }
  }

  async cancelTask(taskId: string, reason?: string): Promise<Task> {
    return this.apiClient.post(`/api/tasks/${taskId}/cancel`, { reason });
  }

  async reopenTask(taskId: string, reason?: string): Promise<Task> {
    return this.apiClient.post(`/api/tasks/${taskId}/reopen`, { reason });
  }

  async reassignTask(taskId: string, newAssigneeId: string, reason?: string): Promise<Task> {
    return this.apiClient.post(`/api/tasks/${taskId}/reassign`, { 
      assignedTo: newAssigneeId, 
      reason 
    });
  }

  // Task comments
  async addComment(taskId: string, commentData: {
    content: string;
    attachments?: File[];
  }): Promise<TaskComment> {
    if (commentData.attachments?.length) {
      const formData = new FormData();
      formData.append('content', commentData.content);
      commentData.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
      
      return this.apiClient.upload(`/api/tasks/${taskId}/comments`, formData);
    } else {
      return this.apiClient.post(`/api/tasks/${taskId}/comments`, commentData);
    }
  }

  async updateComment(taskId: string, commentId: string, content: string): Promise<TaskComment> {
    return this.apiClient.put(`/api/tasks/${taskId}/comments/${commentId}`, { content });
  }

  async deleteComment(taskId: string, commentId: string): Promise<{ success: boolean; message: string }> {
    return this.apiClient.delete(`/api/tasks/${taskId}/comments/${commentId}`);
  }

  async getComments(taskId: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<{
    comments: TaskComment[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    return this.apiClient.get(`/api/tasks/${taskId}/comments`, {
      params,
      cache: { strategy: 'network-first', ttl: 10000 } // 10 seconds cache
    });
  }

  // Task attachments
  async addAttachment(taskId: string, file: File): Promise<{ 
    id: string; 
    name: string; 
    url: string; 
    size: number; 
    type: string; 
  }> {
    const formData = new FormData();
    formData.append('attachment', file);
    
    return this.apiClient.upload(`/api/tasks/${taskId}/attachments`, formData);
  }

  async deleteAttachment(taskId: string, attachmentId: string): Promise<{ success: boolean; message: string }> {
    return this.apiClient.delete(`/api/tasks/${taskId}/attachments/${attachmentId}`);
  }

  // Bulk operations
  async bulkUpdateTasks(operation: BulkTaskOperation): Promise<{ 
    success: boolean; 
    message: string; 
    updatedCount: number; 
    errors?: string[] 
  }> {
    return this.apiClient.post('/api/tasks/bulk-update', operation);
  }

  async bulkDeleteTasks(taskIds: string[]): Promise<{ 
    success: boolean; 
    message: string; 
    deletedCount: number; 
    errors?: string[] 
  }> {
    return this.apiClient.post('/api/tasks/bulk-delete', { taskIds });
  }

  // Task statistics
  async getTaskStats(params?: {
    assignedTo?: string;
    dateFrom?: string;
    dateTo?: string;
    relatedEntityType?: 'APPLICATION' | 'CANDIDATE' | 'JOB' | 'USER';
  }): Promise<TaskStats> {
    return this.apiClient.get('/api/tasks/stats', {
      params,
      cache: { strategy: 'cache-first', ttl: 60000 } // 1 minute cache
    });
  }

  async getMyTaskStats(): Promise<TaskStats> {
    return this.apiClient.get('/api/tasks/my-stats', {
      cache: { strategy: 'cache-first', ttl: 30000 } // 30 seconds cache
    });
  }

  // Task activity/history
  async getTaskActivity(taskId: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<{
    activities: TaskActivity[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    return this.apiClient.get(`/api/tasks/${taskId}/activity`, {
      params,
      cache: { strategy: 'cache-first', ttl: 30000 } // 30 seconds cache
    });
  }

  // Search and filtering
  async searchTasks(query: string, params?: {
    page?: number;
    pageSize?: number;
    status?: Task['status'];
    priority?: Task['priority'];
    type?: Task['type'];
    assignedTo?: string;
  }): Promise<TasksListResponse> {
    return this.apiClient.get('/api/tasks/search', {
      params: { ...params, q: query },
      cache: { strategy: 'network-first', ttl: 10000 } // 10 seconds cache
    });
  }

  // Export tasks
  async exportTasks(params?: {
    status?: Task['status'];
    priority?: Task['priority'];
    type?: Task['type'];
    assignedTo?: string;
    assignedBy?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    format?: 'csv' | 'xlsx';
  }): Promise<Blob> {
    return this.apiClient.download('/api/tasks/export', { params });
  }

  // Task reminders
  async snoozeTask(taskId: string, snoozeUntil: string): Promise<Task> {
    return this.apiClient.post(`/api/tasks/${taskId}/snooze`, { snoozeUntil });
  }

  async setReminder(taskId: string, reminderTime: string): Promise<{ success: boolean; message: string }> {
    return this.apiClient.post(`/api/tasks/${taskId}/reminder`, { reminderTime });
  }

  async clearReminder(taskId: string): Promise<{ success: boolean; message: string }> {
    return this.apiClient.delete(`/api/tasks/${taskId}/reminder`);
  }
}

// Admin Tasks Service (extends TasksService with admin capabilities)
export class AdminTasksService extends TasksService {
  // Task templates (Admin only)
  async getTaskTemplates(): Promise<TaskTemplate[]> {
    return this.apiClient.get('/api/admin/task-templates', {
      cache: { strategy: 'cache-first', ttl: 300000 } // 5 minutes cache
    });
  }

  async getTaskTemplateById(templateId: string): Promise<TaskTemplate> {
    return this.apiClient.get(`/api/admin/task-templates/${templateId}`, {
      cache: { strategy: 'cache-first', ttl: 300000 } // 5 minutes cache
    });
  }

  async createTaskTemplate(templateData: CreateTaskTemplateRequest): Promise<TaskTemplate> {
    return this.apiClient.post('/api/admin/task-templates', templateData);
  }

  async updateTaskTemplate(templateId: string, templateData: Partial<CreateTaskTemplateRequest>): Promise<TaskTemplate> {
    return this.apiClient.put(`/api/admin/task-templates/${templateId}`, templateData);
  }

  async deleteTaskTemplate(templateId: string): Promise<{ success: boolean; message: string }> {
    return this.apiClient.delete(`/api/admin/task-templates/${templateId}`);
  }

  async createTaskFromTemplate(templateId: string, taskData: {
    assignedTo: string;
    relatedEntity?: Task['relatedEntity'];
    dueDate?: string;
    customizations?: Partial<CreateTaskRequest>;
  }): Promise<Task> {
    return this.apiClient.post(`/api/admin/task-templates/${templateId}/create-task`, taskData);
  }

  // System-wide task management (Admin only)
  async getAllTasks(params?: {
    page?: number;
    pageSize?: number;
    status?: Task['status'];
    priority?: Task['priority'];
    type?: Task['type'];
    assignedTo?: string;
    assignedBy?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<TasksListResponse> {
    return this.apiClient.get('/api/admin/tasks', {
      params,
      cache: { strategy: 'network-first', ttl: 15000 } // 15 seconds cache
    });
  }

  async getSystemTaskStats(): Promise<TaskStats & {
    byAssignee: Array<{
      userId: string;
      userName: string;
      total: number;
      pending: number;
      completed: number;
      overdue: number;
    }>;
    dailyStats: Array<{
      date: string;
      created: number;
      completed: number;
      overdue: number;
    }>;
  }> {
    return this.apiClient.get('/api/admin/tasks/stats', {
      cache: { strategy: 'cache-first', ttl: 300000 } // 5 minutes cache
    });
  }

  // Task cleanup and maintenance (Admin only)
  async cleanupCompletedTasks(olderThanDays: number, dryRun?: boolean): Promise<{
    success: boolean;
    message: string;
    affectedCount: number;
    deletedCount?: number;
  }> {
    return this.apiClient.post('/api/admin/tasks/cleanup', {
      olderThanDays,
      dryRun: dryRun ?? false
    });
  }

  async reassignUserTasks(fromUserId: string, toUserId: string): Promise<{
    success: boolean;
    message: string;
    reassignedCount: number;
  }> {
    return this.apiClient.post('/api/admin/tasks/reassign-user-tasks', {
      fromUserId,
      toUserId
    });
  }
}

// Export service instances
export const tasksService = new TasksService();
export const adminTasksService = new AdminTasksService();
