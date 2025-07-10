'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { UserMessage } from '@/types';
import { nanoid } from 'nanoid';

export interface Notification extends UserMessage {
  id: string;
}

type NotificationContextType = {
  notifications: Notification[];
  addNotification: (message: UserMessage) => void;
  removeNotification: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider',
    );
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(
    (message: UserMessage) => {
      const newNotification: Notification = {
        ...message,
        id: nanoid(),
      };
      setNotifications((prev) => [newNotification, ...prev]);

      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 8000);
    },
    [removeNotification],
  );

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
