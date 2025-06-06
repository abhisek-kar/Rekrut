"use client";

import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Filter, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import { Badge } from '@/components/shadcn-ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn-ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn-ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    getNotificationIcon,
    getNotificationColor,
    formatRelativeTime,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Filter notifications based on active tab and search
  const filteredNotifications = notifications.filter(notification => {
    // Tab filter
    if (activeTab === 'unread' && notification.read) return false;
    if (activeTab === 'read' && !notification.read) return false;

    // Search filter
    if (searchTerm && !notification.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Type filter
    if (selectedType !== 'all' && notification.type !== selectedType) return false;

    return true;
  });

  // Get notification type options
  const notificationTypes = Array.from(new Set(notifications.map(n => n.type)));

  const handleNotificationClick = async (notificationId: string, link?: string) => {
    if (!notifications.find(n => n._id === notificationId)?.read) {
      await markAsRead(notificationId);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Notifications"
        description="Manage your notifications and stay updated"
        actions={
          unreadCount > 0 ? (
            <Button onClick={markAllAsRead} className="gap-2">
              <CheckCheck className="h-4 w-4" />
              Mark All Read ({unreadCount})
            </Button>
          ) : null
        }
      />

      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{notifications.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unread</CardTitle>
                <Badge variant="destructive" className="h-6 w-6 p-0 text-xs flex items-center justify-center">
                  {unreadCount}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Read</CardTitle>
                <CheckCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {notificationTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {getNotificationIcon(type)} {type.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <Card>
            <CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">
                    All ({notifications.length})
                  </TabsTrigger>
                  <TabsTrigger value="unread">
                    Unread ({unreadCount})
                  </TabsTrigger>
                  <TabsTrigger value="read">
                    Read ({notifications.length - unreadCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <Bell className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No notifications found</h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'unread' ? "You're all caught up!" : 
                     searchTerm ? "Try adjusting your search terms" : 
                     "Notifications will appear here when you have them"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <NotificationCard
                      key={notification._id}
                      notification={notification}
                      onMarkAsRead={() => markAsRead(notification._id)}
                      onClick={() => handleNotificationClick(notification._id, notification.link)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Individual notification card component
function NotificationCard({ 
  notification, 
  onMarkAsRead, 
  onClick 
}: { 
  notification: any; 
  onMarkAsRead: () => void;
  onClick: () => void;
}) {
  const { getNotificationIcon, formatRelativeTime } = useNotifications();

  const content = (
    <Card className={cn(
      "cursor-pointer transition-all hover:shadow-md border-l-4",
      notification.read 
        ? "border-l-muted bg-muted/20" 
        : "border-l-primary bg-blue-50/30 shadow-sm"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="text-2xl flex-shrink-0 mt-1">
            {getNotificationIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={cn(
                  "font-semibold text-sm",
                  notification.read ? "text-muted-foreground" : "text-foreground"
                )}>
                  {notification.title}
                </h4>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {notification.message}
                </p>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead();
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}
                
                {!notification.read && (
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {notification.type.replace('_', ' ')}
                </Badge>
                {notification.emailSent && (
                  <Badge variant="outline" className="text-xs">
                    📧 Email Sent
                  </Badge>
                )}
              </div>
              
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(notification.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return <div onClick={onClick}>{content}</div>;
}
