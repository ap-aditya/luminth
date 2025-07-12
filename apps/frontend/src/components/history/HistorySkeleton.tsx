import React from 'react';
import { FileText } from 'lucide-react';

export default function HistorySkeleton() {
  const skeletonItems = Array.from({ length: 5 });

  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="mb-8">
        <div className="h-9 bg-gray-200 dark:bg-slate-700 rounded-md w-1/3"></div>
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-md w-1/2 mt-3"></div>
      </div>
      <div className="space-y-4">
        {skeletonItems.map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-gray-100 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-800"
          >
            <div className="flex-1 flex items-center gap-4">
              <div className="flex-shrink-0 h-6 w-6 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded-md w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-md w-1/2"></div>
              </div>
            </div>
            <div className="h-5 w-5 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center mt-8 space-x-4">
        <div className="h-9 w-24 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
        <div className="h-5 w-20 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
        <div className="h-9 w-24 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
      </div>
    </div>
  );
}
