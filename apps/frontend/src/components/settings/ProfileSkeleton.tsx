import React from 'react';

export default function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      <div className="mb-8">
        <div className="h-9 bg-gray-200 dark:bg-slate-700 rounded-md w-1/3"></div>
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-md w-1/2 mt-3"></div>
      </div>

      <div className="p-8 bg-gray-100 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-800">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-slate-700 shrink-0"></div>
            <div className="flex-1 space-y-3 text-center md:text-left">
              <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-md w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-md w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-md w-1/3"></div>
            </div>
          </div>
          <div className="flex justify-end border-t border-gray-200 dark:border-slate-800 pt-6">
            <div className="h-9 w-28 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-red-500/10">
        <div className="h-6 w-1/4 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
        <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded-md mt-3"></div>
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-slate-700 rounded-md mt-2"></div>
        <div className="h-9 w-36 bg-gray-200 dark:bg-slate-700 rounded-md mt-4"></div>
      </div>
    </div>
  );
}
