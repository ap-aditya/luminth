import React, { FC } from 'react';
import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react';

type Status = 'initial' | 'met' | 'unmet';
interface StatusCircleProps {
  status: Status;
}

const StatusCircle: FC<StatusCircleProps> = ({ status }) => {
  switch (status) {
    case 'met':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'unmet':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <MinusCircle className="h-4 w-4 text-gray-400" />;
  }
};

export interface PasswordCriterion {
  text: string;
  status: Status;
}

interface PasswordCriteriaIndicatorProps {
  criteria: PasswordCriterion[];
}

export const PasswordCriteriaIndicator: FC<PasswordCriteriaIndicatorProps> = ({ criteria }) => {
  if (criteria.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      <ul className="space-y-1.5">
        {criteria.map((criterion, index) => (
          <li key={index} className="flex items-center text-xs">
            <StatusCircle status={criterion.status} />
            <span className={`ml-2 ${
                criterion.status === 'met' ? 'text-gray-600 dark:text-gray-300' :
                criterion.status === 'unmet' ? 'text-red-500 dark:text-red-400' :
                'text-gray-500 dark:text-gray-400'
              }`}
            >
              {criterion.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};