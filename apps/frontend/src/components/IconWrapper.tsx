import { FCC } from '@/types';
import { ReactNode } from 'react';
const IconWrapper: FCC = ({ children }) => (
  <div className="bg-gray-200 dark:bg-slate-800/50 p-3 rounded-lg mb-4 border border-gray-300 dark:border-slate-700 inline-block">
    {children}
  </div>
);
export default IconWrapper;