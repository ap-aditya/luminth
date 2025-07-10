'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { CanvasResponse } from '@/types';
import { useWebSocket } from '@/context/WebSocketContext';
import { useDashboard } from '@/context/DashboardContext';
import { updateCanvas, renderCanvas } from '@/app/(app)/canvases/actions';
import Editor from '@monaco-editor/react';
import {
  Save,
  Play,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Timer,
} from 'lucide-react';
import { useDebounce } from 'use-debounce';

interface CanvasEditorProps {
  initialData: CanvasResponse;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const isExpired = (dateString: string | null): boolean => {
  if (!dateString) return false;
  const renderDate = new Date(dateString);
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  return renderDate < fortyEightHoursAgo;
};

const LimitReachedMessage = () => {
  const resetTime = new Date();
  resetTime.setUTCHours(24, 0, 0, 0);

  const formattedTime = resetTime.toLocaleString(undefined, {
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  });

  return (
    <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 mt-1">
      <Timer className="h-3 w-3" />
      <span>Render limit reached. Resets at {formattedTime}.</span>
    </div>
  );
};

export default function CanvasEditor({ initialData }: CanvasEditorProps) {
  const [title, setTitle] = useState(initialData.title);
  const [code, setCode] = useState(initialData.code || '');
  const [videoUrl, setVideoUrl] = useState(initialData.video_url);
  const [latestRenderAt, setLatestRenderAt] = useState(
    initialData.latest_render_at,
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [renderMessage, setRenderMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [lastSavedState, setLastSavedState] = useState({
    title: initialData.title,
    code: initialData.code || '',
  });

  const [isSaving, startSaveTransition] = useTransition();
  const [isRendering, startRenderTransition] = useTransition();

  const [debouncedCode] = useDebounce(code, 1000);
  const [debouncedTitle] = useDebounce(title, 1000);

  const { lastMessage } = useWebSocket();
  const { data: dashboardData, incrementRenderCount } = useDashboard();
  const user = dashboardData?.user_profile;
  const videoHasExpired = isExpired(latestRenderAt);

  const todayUTC = new Date().toISOString().split('T')[0];
  const limitsAreForToday = user?.last_request_date === todayUTC;
  const renderUsage = user?.render_requests_today ?? 0;
  const renderLimit = user?.render_daily_limit ?? 30;
  const isRenderDisabled = limitsAreForToday && renderUsage >= renderLimit;

  useEffect(() => {
    if (lastMessage && lastMessage.source_id === initialData.canvas_id) {
      if (lastMessage.status === 'success' && lastMessage.video_url) {
        setVideoUrl(lastMessage.video_url);
        setLatestRenderAt(new Date().toISOString());
      }
    }
  }, [lastMessage, initialData.canvas_id]);

  useEffect(() => {
    const hasChanges =
      debouncedCode !== lastSavedState.code ||
      debouncedTitle !== lastSavedState.title;

    if (!hasChanges || isSaving) {
      return;
    }

    startSaveTransition(async () => {
      setSaveStatus('saving');
      const result = await updateCanvas(
        initialData.canvas_id,
        debouncedTitle,
        debouncedCode,
      );
      if (result.success) {
        setSaveStatus('saved');
        setLastSavedState({ title: debouncedTitle, code: debouncedCode });
      } else {
        console.error('Auto-save failed:', result.error);
        setSaveStatus('error');
      }
    });
  }, [
    debouncedCode,
    debouncedTitle,
    initialData.canvas_id,
    isSaving,
    lastSavedState,
  ]);

  useEffect(() => {
    if (saveStatus === 'saved' || saveStatus === 'error') {
      const timer = setTimeout(() => setSaveStatus('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const handleRender = () => {
    setRenderMessage(null);
    startRenderTransition(async () => {
      const result = await renderCanvas(initialData.canvas_id);
      if (result.success) {
        setRenderMessage({
          type: 'success',
          text: result.data?.message || 'Render job submitted!',
        });
        incrementRenderCount();
      } else {
        setRenderMessage({
          type: 'error',
          text: result.error || 'Failed to submit render job.',
        });
      }
    });
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-slate-800">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-transparent text-lg font-semibold focus:outline-none w-full"
          placeholder="Untitled Canvas"
        />
        <div className="flex items-center gap-4 shrink-0 ml-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Saved</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span>Error</span>
              </>
            )}
          </div>
          <div className="flex flex-col items-end">
            <button
              onClick={handleRender}
              disabled={isRendering || isRenderDisabled}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
            >
              {isRendering ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Render
            </button>
            {isRenderDisabled && <LimitReachedMessage />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-slate-800 min-h-[500px]">
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{ minimap: { enabled: false }, fontSize: 14 }}
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
              {renderMessage && (
                <p
                  className={`text-sm mt-2 ${renderMessage.type === 'error' ? 'text-red-500' : 'text-green-500'}`}
                >
                  {renderMessage.text}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
