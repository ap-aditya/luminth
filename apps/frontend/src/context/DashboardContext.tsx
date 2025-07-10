'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
} from 'react';
import { DashboardData, User } from '@/types';
interface DashboardContextType {
  data: DashboardData | null;
  incrementRenderCount: () => void;
  incrementPromptCount: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: DashboardData | null;
}) => {
  const [data, setData] = useState<DashboardData | null>(value);

  const incrementRenderCount = useCallback(() => {
    setData((prevData) => {
      if (!prevData || !prevData.user_profile) return prevData;
      const currentCount = prevData.user_profile.render_requests_today ?? 0;
      const updatedUser: User = {
        ...prevData.user_profile,
        render_requests_today: currentCount + 1,
      };
      return { ...prevData, user_profile: updatedUser };
    });
  }, []);

  const incrementPromptCount = useCallback(() => {
    setData((prevData) => {
      if (!prevData || !prevData.user_profile) return prevData;
      const currentCount = prevData.user_profile.prompt_requests_today ?? 0;
      const updatedUser: User = {
        ...prevData.user_profile,
        prompt_requests_today: currentCount + 1,
      };
      return { ...prevData, user_profile: updatedUser };
    });
  }, []);

  const contextValue = {
    data,
    incrementRenderCount,
    incrementPromptCount,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};
