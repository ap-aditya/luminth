'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { UserMessage } from '@/types';
import { nanoid } from 'nanoid';

// Define the shape of a single notification
export interface Notification extends UserMessage {
  id: string;
}

// Define the shape of the context
type NotificationContextType = {
  notifications: Notification[];
  hasUnread: boolean;
  addNotification: (message: UserMessage) => void;
  markAsRead: () => void;
  clearNotifications: () => void;
};

// Create the context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Create a custom hook for easy access
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Create the provider component
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  const addNotification = useCallback((message: UserMessage) => {
    const newNotification: Notification = {
      ...message,
      id: nanoid(), // Assign a unique ID
    };
    // Add new notification to the top of the list
    setNotifications((prev) => [newNotification, ...prev]);
    // Mark that there are new, unread notifications
    setHasUnread(true);
  }, []);

  const markAsRead = useCallback(() => {
    setHasUnread(false);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const contextValue = {
    notifications,
    hasUnread,
    addNotification,
    markAsRead,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
