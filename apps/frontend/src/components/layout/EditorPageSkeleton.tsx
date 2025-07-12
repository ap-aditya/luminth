import React from 'react';
import { Loader2 } from 'lucide-react';
export default function EditorPageSkeleton() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-slate-800">
        <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded-md w-1/3"></div>
        <div className="flex items-center gap-4">
          <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded-md w-20"></div>
          <div className="h-9 bg-gray-300 dark:bg-slate-600 rounded-lg w-24"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div className="rounded-lg border border-gray-200 dark:border-slate-800 min-h-[500px] bg-gray-200 dark:bg-slate-800"></div>
        <div className="rounded-lg border border-gray-200 dark:border-slate-800 min-h-[500px] bg-gray-100 dark:bg-slate-900 flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 text-gray-300 dark:text-slate-600 animate-spin" />
          <p className="mt-4 text-sm text-gray-400 dark:text-slate-500">
            Loading Editor...
          </p>
        </div>
      </div>
    </div>
  );
}
