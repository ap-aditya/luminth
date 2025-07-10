'use client';

import { useFormStatus } from 'react-dom';
import { Plus, Sparkles, Loader2 } from 'lucide-react';
import { createPrompt, createCanvas } from '@/app/(app)/dashboard/actions';

function CreateCanvasButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      Create Canvas
    </button>
  );
}

function CreatePromptButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-cyan-800 dark:text-cyan-300 bg-cyan-500/10 rounded-lg hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      Generate Code
    </button>
  );
}

export default function SidebarActionButtons() {
  return (
    <div className="space-y-2">
      <form action={createCanvas}>
        <CreateCanvasButton />
      </form>
      <form action={createPrompt}>
        <CreatePromptButton />
      </form>
    </div>
  );
}
