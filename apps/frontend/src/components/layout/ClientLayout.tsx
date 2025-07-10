'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { DashboardData } from '@/types';
import { DashboardProvider } from '@/context/DashboardContext';
import { WebSocketProvider, useWebSocket } from '@/context/WebSocketContext';
import {
  NotificationProvider,
  useNotification,
} from '@/context/NotificationContext';
import NotificationDisplay from '@/components/notifications/NotificationDisplay';

const RealtimeNotificationBridge = () => {
  const { lastMessage } = useWebSocket();
  const { addNotification } = useNotification();

  useEffect(() => {
    if (lastMessage) {
      addNotification(lastMessage);
    }
  }, [lastMessage]);

  return null;
};

interface ClientLayoutProps {
  children: React.ReactNode;
  data: DashboardData | null;
}

export default function ClientLayout({ children, data }: ClientLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <NotificationProvider>
      <WebSocketProvider>
        <div
          className="min-h-screen w-full font-sans bg-gray-50 dark:bg-slate-950 text-gray-800 dark:text-gray-200"
          suppressHydrationWarning={true}
        >
          <Sidebar
            recentActivity={data?.recent_activity ?? []}
            isOpen={isSidebarOpen}
            onClose={toggleSidebar}
          />
          <div className="md:ml-64">
            <Header
              userProfile={data?.user_profile ?? null}
              onToggleSidebar={toggleSidebar}
            />
            <main className="p-4 sm:p-6 md:p-8">
              <DashboardProvider value={data}>{children}</DashboardProvider>
            </main>
          </div>
          <NotificationDisplay />
          <RealtimeNotificationBridge />
        </div>
      </WebSocketProvider>
    </NotificationProvider>
  );
}
