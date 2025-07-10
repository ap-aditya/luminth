'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from '@/context/NotificationContext';
import { Bell, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function NotificationBell() {
  const { notifications, hasUnread, markAsRead, clearNotifications } =
    useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (newIsOpen && hasUnread) {
      markAsRead();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (notifications.length > 0) {
          clearNotifications();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [clearNotifications, notifications.length]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
      >
        <Bell className="h-6 w-6" />
        {hasUnread && (
          <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-950" />
        )}
      </button>

      <div
        className={`absolute top-full right-0 mt-2 w-80 max-h-[70vh] overflow-y-auto bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg transition-all duration-200 ease-in-out z-10 ${
          isOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <div className="p-3 border-b border-gray-200 dark:border-slate-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Notifications
          </h3>
        </div>
        <div className="p-2">
          {notifications.length > 0 ? (
            <ul className="space-y-2">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className="p-2 rounded-md bg-gray-50 dark:bg-slate-900/50"
                >
                  <Link
                    href={`/${notification.source_type}s/${notification.source_id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {notification.status === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                          {notification.message}
                        </p>
                        {notification.detail && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {notification.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
              You have no new notifications.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
