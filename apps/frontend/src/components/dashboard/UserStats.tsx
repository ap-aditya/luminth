import React from 'react';
import { User } from '@/types';

interface UserStatsProps {
  user: User;
}

export default function UserStats({ user }: UserStatsProps) {
  const promptUsage = user.prompt_requests_today ?? 0;
  const renderUsage = user.render_requests_today ?? 0;

  const promptPercentage = (promptUsage / user.prompt_daily_limit) * 100;
  const renderPercentage = (renderUsage / user.render_daily_limit) * 100;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        Today's Usage
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-100/50 dark:bg-slate-900/50 rounded-xl border border-white/10 dark:border-slate-800/50">
        <UsageMeter
          label="Prompt Generations"
          used={promptUsage}
          limit={user.prompt_daily_limit}
          percentage={promptPercentage}
          colorClass="bg-cyan-500"
        />
        <UsageMeter
          label="Video Renders"
          used={renderUsage}
          limit={user.render_daily_limit}
          percentage={renderPercentage}
          colorClass="bg-pink-500"
        />
      </div>
    </div>
  );
}

interface UsageMeterProps {
  label: string;
  used: number;
  limit: number;
  percentage: number;
  colorClass: string;
}

const UsageMeter = ({
  label,
  used,
  limit,
  percentage,
  colorClass,
}: UsageMeterProps) => (
  <div className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg">
    <div className="flex justify-between items-baseline mb-1">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        <span className="font-bold text-gray-800 dark:text-white">{used}</span>{' '}
        / {limit}
      </p>
    </div>
    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
      <div
        className={`${colorClass} h-2.5 rounded-full transition-all duration-500`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  </div>
);
