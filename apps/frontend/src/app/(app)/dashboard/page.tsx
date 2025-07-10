'use client';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { FileText, Sparkles, AlertTriangle } from 'lucide-react';
import UserStats from '@/components/dashboard/UserStats';
import { createCanvas, createPrompt } from './actions';
import ActionCard from '@/components/dashboard/ActionCard'; 

export default function DashboardPage() {
  const { data } = useDashboard();

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Could not load dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400">
          There was an error fetching your data. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
          Welcome back, {data.user_profile?.name || 'User'}!
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">
          What will you create today?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <form action={createCanvas}>
          <ActionCard
            title="Create Canvas"
            description="Start with a blank slate and bring your ideas to life."
            icon={FileText}
            className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300"
          />
        </form>
        <form action={createPrompt}>
          <ActionCard
            title="Generate Code"
            description="Use AI to generate code from a text prompt."
            icon={Sparkles}
            className="bg-pink-500/10 hover:bg-pink-500/20 text-pink-800 dark:text-pink-300"
          />
        </form>
      </div>

      <UserStats user={data.user_profile} />
    </div>
  );
}
