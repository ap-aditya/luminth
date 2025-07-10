'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { PromptResponse } from '@/types';
import { useWebSocket } from '@/context/WebSocketContext';
import { useDashboard } from '@/context/DashboardContext';
import {
  generateCodeFromPrompt,
  renderPrompt,
  createCanvasFromPrompt,
} from '@/app/(app)/prompts/actions';
import Editor from '@monaco-editor/react';
import {
  Sparkles,
  Play,
  Pencil,
  Loader2,
  AlertTriangle,
  Timer,
} from 'lucide-react';

interface PromptEditorProps {
  initialData: PromptResponse;
}

const isExpired = (dateString: string | null): boolean => {
  if (!dateString) return false;
  const renderDate = new Date(dateString);
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  return renderDate < fortyEightHoursAgo;
};

const LimitReachedMessage = ({
  isGenerateDisabled,
  isRenderDisabled,
}: {
  isGenerateDisabled: boolean;
  isRenderDisabled: boolean;
}) => {
  const resetTime = new Date();
  resetTime.setUTCHours(24, 0, 0, 0);
  const formattedTime = resetTime.toLocaleString(undefined, {
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  });
  const messageParts = [];
  if (isGenerateDisabled) messageParts.push('Generate');
  if (isRenderDisabled) messageParts.push('Render');
  const limitTypeMessage = messageParts.join(' & ') + ' limit reached.';

  return (
    <div className="flex items-center justify-center gap-2 text-xs text-yellow-600 dark:text-yellow-400 p-2 bg-yellow-500/10 rounded-md mb-4">
      <Timer className="h-4 w-4" />
      <span>
        {limitTypeMessage} Limits will reset at {formattedTime}.
      </span>
    </div>
  );
};

export default function PromptEditor({ initialData }: PromptEditorProps) {
  const [promptText, setPromptText] = useState(initialData.prompt_text || '');
  const [code, setCode] = useState(initialData.code || '');
  const [videoUrl, setVideoUrl] = useState(initialData.video_url);
  const [latestRenderAt, setLatestRenderAt] = useState(
    initialData.latest_render_at,
  );
  const [isGenerating, startGenerateTransition] = useTransition();
  const [isRendering, startRenderTransition] = useTransition();
  const [isCreatingCanvas, startCreateCanvasTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { lastMessage } = useWebSocket();
  const {
    data: dashboardData,
    incrementPromptCount,
    incrementRenderCount,
  } = useDashboard();
  const user = dashboardData?.user_profile;

  const videoHasExpired = isExpired(latestRenderAt);

  const todayUTC = new Date().toISOString().split('T')[0];
  const limitsAreForToday = user?.last_request_date === todayUTC;

  const promptUsage = user?.prompt_requests_today ?? 0;
  const promptLimit = user?.prompt_daily_limit ?? 10;
  const isGenerateDisabled = limitsAreForToday && promptUsage >= promptLimit;

  const renderUsage = user?.render_requests_today ?? 0;
  const renderLimit = user?.render_daily_limit ?? 30;
  const isRenderDisabled = limitsAreForToday && renderUsage >= renderLimit;

  const limitReached = isGenerateDisabled || isRenderDisabled;

  useEffect(() => {
    if (lastMessage && lastMessage.source_id === initialData.prompt_id) {
      if (lastMessage.status === 'success' && lastMessage.video_url) {
        setVideoUrl(lastMessage.video_url);
        setLatestRenderAt(new Date().toISOString());
      }
    }
  }, [lastMessage, initialData.prompt_id]);

  useEffect(() => {
    setPromptText(initialData.prompt_text || '');
    setCode(initialData.code || '');
    setVideoUrl(initialData.video_url || null);
    setLatestRenderAt(initialData.latest_render_at);
  }, [initialData]);

  const handleGenerate = () => {
    setErrorMessage(null);
    startGenerateTransition(async () => {
      const result = await generateCodeFromPrompt(
        initialData.prompt_id,
        promptText,
      );
      if (result.success) {
        incrementPromptCount();
      } else {
        setErrorMessage(result.error || 'An unknown error occurred.');
      }
    });
  };

  const handleRender = () => {
    setErrorMessage(null);
    startRenderTransition(async () => {
      const result = await renderPrompt(initialData.prompt_id);
      if (result.success) {
        incrementRenderCount();
      } else {
        setErrorMessage(result.error || 'Failed to submit render job.');
      }
    });
  };

  const handleCreateCanvas = () => {
    startCreateCanvasTransition(async () => {
      await createCanvasFromPrompt(promptText || 'Untitled from Prompt', code);
    });
  };

  return (
    <div className="flex flex-col">
      <div className="shrink-0 p-4 border-b border-gray-200 dark:border-slate-800">
        <textarea
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="e.g., A blue square rotating in the center of the screen"
          className="w-full p-2 bg-gray-100 dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          rows={3}
        />

        {limitReached && (
          <LimitReachedMessage
            isGenerateDisabled={isGenerateDisabled}
            isRenderDisabled={isRenderDisabled}
          />
        )}
        {errorMessage && (
          <p className="text-sm text-red-500 mt-2 text-center">
            {errorMessage}
          </p>
        )}

        <div className="flex items-center gap-4 mt-2 flex-wrap">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !promptText || isGenerateDisabled}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-pink-600 rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate
          </button>
          <button
            onClick={handleRender}
            disabled={isRendering || !code || isRenderDisabled}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
          >
            {isRendering ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Render
          </button>
          <button
            onClick={handleCreateCanvas}
            disabled={isCreatingCanvas || !code}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 ml-auto"
          >
            {isCreatingCanvas ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Pencil className="h-4 w-4" />
            )}
            Edit in Canvas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-slate-800 min-h-[500px]">
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        </div>
        <div className="bg-gray-100 dark:bg-slate-900 rounded-lg flex items-center justify-center border border-gray-200 dark:border-slate-800 p-2 min-h-[500px]">
          {videoUrl && !videoHasExpired ? (
            <video
              key={videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="text-center text-gray-500">
              {videoHasExpired ? (
                <>
                  <AlertTriangle className="mx-auto h-10 w-10 text-yellow-500" />
                  <p className="mt-2 font-semibold">Render has expired</p>
                  <p className="text-sm mt-1">
                    This video link was valid for 48 hours. Please render again
                    to generate a new one.
                  </p>
                </>
              ) : (
                <p>No video rendered yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
