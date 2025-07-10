'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <AlertTriangle className="h-16 w-16 text-red-500 mb-6" />
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
        Oops! Something went wrong.
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        An unexpected error occurred on our end. Please try again in a moment.
        If the problem persists, feel free to contact support.
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
      >
        Try Again
      </button>
    </div>
  );
}
