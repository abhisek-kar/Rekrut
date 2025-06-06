import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  relatedId?: string;
  relatedType?: string;
  data?: Record<string, unknown>;
  emailSent?: boolean;
  emailSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  pages: number;
  unreadCount: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (page = 1, limit = 20, type?: string) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (type) {
        params.set('type', type);
      }

      const response = await fetch(`/api/notifications?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data: NotificationResponse = await response.json();
      
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark notification as read';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markAll: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);

      toast.success('All notifications marked as read');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all notifications as read';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Get notification icon based on type
  const getNotificationIcon = useCallback((type: string) => {
    const iconMap: Record<string, string> = {
      job_assignment: '💼',
      job_status_change: '🔄',
      job_application_received: '📋',
      application_status_change: '📧',
      application_confirmation: '✅',
      account_created: '🎉',
      bulk_operation_complete: '⚡',
      interview_reminder: '📅',
      offer_extended: '🎊',
      welcome_message: '👋',
    };
    return iconMap[type] || '🔔';
  }, []);

  // Get notification color based on type
  const getNotificationColor = useCallback((type: string) => {
    const colorMap: Record<string, string> = {
      job_assignment: 'blue',
      job_status_change: 'orange',
      job_application_received: 'green',
      application_status_change: 'purple',
      application_confirmation: 'green',
      account_created: 'blue',
      bulk_operation_complete: 'gray',
      interview_reminder: 'yellow',
      offer_extended: 'green',
      welcome_message: 'blue',
    };
    return colorMap[type] || 'gray';
  }, []);

  // Format relative time
  const formatRelativeTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    return `${Math.floor(diffInDays / 30)}mo ago`;
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    getNotificationIcon,
    getNotificationColor,
    formatRelativeTime,
  };
}

// Hook for real-time notification updates (disabled - using REST API only)
export function useNotificationPolling(intervalMs = 30000) {
  const { unreadCount } = useNotifications();

  // Polling disabled for REST API only approach
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchNotifications(1, 5); // Fetch only recent notifications for count update
  //   }, intervalMs);

  //   return () => clearInterval(interval);
  // }, [fetchNotifications, intervalMs]);

  return { unreadCount };
}
