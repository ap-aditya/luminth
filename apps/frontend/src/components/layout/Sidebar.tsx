'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HistoryItem } from '@/types';
import { deleteHistoryItem } from '@/app/(app)/history/actions';
import SidebarActionButtons from '@/components/layout/SidebarActionButtons';
import { FileText, Sparkles, Trash2, Loader2, History } from 'lucide-react';

interface SidebarProps {
  recentActivity: HistoryItem[];
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  recentActivity,
  isOpen,
  onClose,
}: SidebarProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (item: HistoryItem) => {
    setDeletingId(item.item_id);
    await deleteHistoryItem(item.item_type, item.item_id);
    setDeletingId(null);
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`fixed top-0 left-0 z-30 h-screen flex-col w-64 shrink-0 bg-gray-100/80 dark:bg-slate-900/80 backdrop-blur-lg border-r border-gray-200 dark:border-slate-800 p-4 space-y-6 transition-transform duration-300 ease-in-out ${
          isOpen
            ? 'flex translate-x-0'
            : 'hidden -translate-x-full md:flex md:translate-x-0'
        }`}
      >
        <div className="px-2">
          <Link
            href="/dashboard"
            className="text-2xl font-bold text-gray-800 dark:text-white"
          >
            Luminth
          </Link>
        </div>

        <SidebarActionButtons />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center px-2 mb-2">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <History className="h-4 w-4" />
              Recent Activity
            </h2>
            <Link
              href="/history"
              className="text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              View All
            </Link>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.map((item) => (
                <div
                  key={item.item_id}
                  className="group flex items-center justify-between text-sm rounded-md hover:bg-gray-200 dark:hover:bg-slate-800"
                >
                  <Link
                    href={
                      item.item_type === 'canvas'
                        ? `/canvases/${item.item_id}`
                        : `/prompts/${item.item_id}`
                    }
                    className="flex-1 flex items-center gap-3 p-2 overflow-hidden"
                  >
                    {item.item_type === 'canvas' ? (
                      <FileText className="h-4 w-4 text-gray-500 shrink-0" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-gray-500 shrink-0" />
                    )}
                    <span className="truncate text-gray-700 dark:text-gray-300">
                      {item.display_text || 'Untitled'}
                    </span>
                  </Link>
                  <form action={() => handleDelete(item)}>
                    <button
                      type="submit"
                      disabled={deletingId === item.item_id}
                      className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      aria-label="Delete item"
                    >
                      {deletingId === item.item_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </form>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400 p-2 italic">
                No recent activity.
              </p>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
}
