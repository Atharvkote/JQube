import React, { createContext, useState, useCallback, useMemo } from 'react';
import type { Notification } from '@/types';
import { MOCK_NOTIFICATIONS } from '@/constants/mock-data';

// notification context value interface
export interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllRead: () => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
}

// create notification context
export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// provider component
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  // unread notification count calculation
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // mark single notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  // mark all notifications as read
  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // clear notification list
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // memoized context values
  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markNotificationAsRead: markAsRead,
      markAllRead,
      markAllNotificationsAsRead: markAllRead,
      clearNotifications,
    }),
    [notifications, unreadCount, markAsRead, markAllRead, clearNotifications]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
