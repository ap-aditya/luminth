'use client';

import React from 'react';
import { useNotification } from '@/context/NotificationContext';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

export default function NotificationDisplay() {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 w-full max-w-sm space-y-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`relative w-full overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-300 ease-in-out animate-in slide-in-from-top-5 ${
            notification.status === 'success'
              ? 'bg-green-50 dark:bg-green-500/10'
              : 'bg-red-50 dark:bg-red-500/10'
          }`}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.status === 'success' ? (
                  <CheckCircle
                    className="h-6 w-6 text-green-400"
                    aria-hidden="true"
                  />
                ) : (
                  <AlertTriangle
                    className="h-6 w-6 text-red-400"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {notification.message}
                </p>
                {notification.detail && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                    {notification.detail}
                  </p>
                )}
              </div>
              <div className="ml-4 flex flex-shrink-0">
                <button
                  type="button"
                  className="inline-flex rounded-md bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                  onClick={() => removeNotification(notification.id)}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
