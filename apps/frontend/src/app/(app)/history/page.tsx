import React from 'react';
import { getHistory } from './actions';
import HistoryList from '@/components/history/HistoryList';
import { AlertTriangle } from 'lucide-react';

export default async function HistoryPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  
  const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
  const result = await getHistory(page);

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Could Not Load History</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {result.error || 'There was an error fetching your activity history.'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Activity History</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Review your past canvases and generated prompts.
        </p>
      </div>
      <HistoryList initialData={result.data} />
    </div>
  );
}
