'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  className?: string;
}

export default function ActionCard({
  title,
  description,
  icon: Icon,
  className,
}: ActionCardProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`relative w-full p-6 rounded-xl border border-white/10 dark:border-slate-800/50 text-left transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <div
        className={`flex items-center justify-center h-12 w-12 rounded-lg bg-white/50 dark:bg-slate-900/50 mb-4 ${className}`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">
        {title}
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        {description}
      </p>
      {pending && (
        <div className="absolute inset-0 bg-black/20 dark:bg-black/50 flex items-center justify-center rounded-xl">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}
    </button>
  );
}
