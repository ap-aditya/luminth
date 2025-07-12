import React from 'react';
import { FileText, Sparkles } from 'lucide-react';

export default function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="mb-8">
        <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-md w-1/2"></div>
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-md w-1/3 mt-3"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-100 dark:bg-slate-800/50">
          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gray-200 dark:bg-slate-700 mb-4">
            <FileText className="h-6 w-6 text-gray-300 dark:text-slate-600" />
          </div>
          <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded-md w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-md w-full mt-2"></div>
        </div>

        <div className="p-6 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-100 dark:bg-slate-800/50">
          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gray-200 dark:bg-slate-700 mb-4">
            <Sparkles className="h-6 w-6 text-gray-300 dark:text-slate-600" />
          </div>
          <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded-md w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-md w-full mt-2"></div>
        </div>
      </div>

      <div>
        <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded-md w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-100 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-800">
          <div className="p-4 bg-gray-200 dark:bg-slate-800 rounded-lg">
            <div className="h-5 bg-gray-300 dark:bg-slate-700 rounded-md w-1/2 mb-2"></div>
            <div className="h-2.5 bg-gray-300 dark:bg-slate-700 rounded-full w-full"></div>
          </div>
          <div className="p-4 bg-gray-200 dark:bg-slate-800 rounded-lg">
            <div className="h-5 bg-gray-300 dark:bg-slate-700 rounded-md w-1/2 mb-2"></div>
            <div className="h-2.5 bg-gray-300 dark:bg-slate-700 rounded-full w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
