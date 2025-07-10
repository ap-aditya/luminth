import { ReactNode, FC } from 'react';
export interface FCC<T = {}> extends FC<T & { children?: ReactNode }> {}

export interface User {
  user_id: string;
  name: string | null;
  avatar: string;
  dob: string | null;
  prompt_daily_limit: number;
  render_daily_limit: number;
  prompt_requests_today?: number;
  render_requests_today?: number;
  last_request_date?: string;
}

export interface HistoryItem {
  item_type: 'canvas' | 'prompt';
  item_id: string;
  display_text: string;
  updated_at: string;
}

export interface DashboardData {
  user_profile: User;
  recent_activity: HistoryItem[];
}

export interface CanvasResponse {
  canvas_id: string;
  title: string;
  code: string | null;
  video_url: string | null;
  updated_at: string;
  latest_render_at: string | null;
}

export interface PromptResponse {
  prompt_id: string;
  code: string | null;
  video_url: string | null;
  updated_at: string;
  prompt_text: string;
  latest_render_at: string | null;
}

export interface UserMessage {
  message: string;
  video_url?: string | null;
  source_id: string;
  source_type: 'canvas' | 'prompt';
  status: 'success' | 'failure';
  detail?: string | null;
}

export interface PaginatedHistoryResponse {
  total_items: number;
  items: HistoryItem[];
  page: number;
  size: number;
  total_pages: number;
}
