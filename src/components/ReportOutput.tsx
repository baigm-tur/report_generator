"use client";

import { useState } from 'react';
import { copyToClipboard } from '@/lib/utils';

interface ReportOutputProps {
  reportText: string;
}

export function ReportOutput({ reportText }: ReportOutputProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    const success = await copyToClipboard(reportText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Generated Report</h3>
        <button
          onClick={handleCopy}
          type="button"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {copied ? "Copied!" : "Copy to Clipboard"}
        </button>
      </div>
      <div className="bg-gray-100 p-4 rounded-md">
        <pre className="text-sm whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
          {reportText}
        </pre>
      </div>
    </div>
  );
}

export default ReportOutput; 