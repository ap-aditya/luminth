import React, { FC } from 'react';
const CodeBlock: FC<{ code: string }> = ({ code }) => (
  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-slate-900 p-4 rounded-b-lg h-full overflow-x-auto">
    <code>{code}</code>
  </pre>
);
export default CodeBlock;
