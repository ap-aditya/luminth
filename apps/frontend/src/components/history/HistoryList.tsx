'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HistoryItem, PaginatedHistoryResponse } from '@/types';
import { deleteHistoryItem } from '@/app/(app)/history/actions';
import {
  FileText,
  Sparkles,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';

interface HistoryListProps {
  initialData: PaginatedHistoryResponse;
}

export default function HistoryList({ initialData }: HistoryListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { items, page, total_pages } = initialData;

  const handlePageChange = (newPage: number) => {
    router.push(`/history?page=${newPage}`);
  };

  const handleDelete = async (item: HistoryItem) => {
    setDeletingId(item.item_id);
    await deleteHistoryItem(item.item_type, item.item_id);
    setDeletingId(null);
  };

  return (
    <div>
      <div className="space-y-4">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.item_id}
              className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-slate-800"
            >
              <Link
                href={
                  item.item_type === 'canvas'
                    ? `/canvases/${item.item_id}`
                    : `/prompts/${item.item_id}`
                }
                className="flex-1 flex items-center gap-4 overflow-hidden"
              >
                <div className="flex-shrink-0">
                  {item.item_type === 'canvas' ? (
                    <FileText className="h-6 w-6 text-cyan-500" />
                  ) : (
                    <Sparkles className="h-6 w-6 text-pink-500" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold truncate text-gray-800 dark:text-white">
                    {item.display_text || 'Untitled'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Updated on {new Date(item.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => handleDelete(item)}
                disabled={deletingId === item.item_id}
                className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                aria-label="Delete item"
              >
                {deletingId === item.item_id ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Trash2 className="h-5 w-5" />
                )}
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold">No History Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Your created canvases and prompts will appear here.
            </p>
          </div>
        )}
      </div>
      {total_pages > 1 && (
        <div className="flex items-center justify-center mt-8 space-x-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {page} of {total_pages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= total_pages}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
