// Notifications hook
// Updated to use the new API client architecture

import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationsService } from '@/services';
import type { Notification } from '@/services';
import { toast } from 'sonner';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationsService.getNotifications({ 
        pageSize: 50,
        read: undefined // Get both read and unread
      });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { count } = await notificationsService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to real-time notifications
    const unsubscribeNotifications = notificationsService.subscribeToNotifications((notification) => {
      setNotifications(prev => [notification, ...prev]);
      if (!notification.read) {
        setUnreadCount(prev => prev + 1);
        // Show toast for new notifications
        toast.info(notification.title, {
          description: notification.message,
          action: notification.actionUrl ? {
            label: notification.actionLabel || 'View',
            onClick: () => window.location.href = notification.actionUrl!
          } : undefined
        });
      }
    });

    // Subscribe to unread count updates
    const unsubscribeCount = notificationsService.subscribeToUnreadCount((count) => {
      setUnreadCount(count);
    });

    // Store unsubscribe functions
    unsubscribeRef.current = () => {
      unsubscribeNotifications();
      unsubscribeCount();
    };

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true, readAt: new Date().toISOString() } 
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark notification as read';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead();
      
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          read: true, 
          readAt: notification.readAt || new Date().toISOString() 
        }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all notifications as read';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationsService.deleteNotification(id);
      
      const notificationToDelete = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      if (notificationToDelete && !notificationToDelete.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Notification deleted');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete notification';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [notifications]);

  const clearAllRead = useCallback(async () => {
    try {
      await notificationsService.deleteAllRead();
      
      setNotifications(prev => prev.filter(n => !n.read));
      toast.success('All read notifications cleared');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear read notifications';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  return { 
    notifications, 
    loading, 
    error, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    clearAllRead,
    refresh: fetchNotifications,
    refreshUnreadCount: fetchUnreadCount
  };
}
}

export default useNotifications;
