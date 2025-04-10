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
  
  if (!reportText) {
    return null;
  }
  
  // Extract trainer email from the report text
  const extractTrainerEmail = () => {
    const emailMatch = reportText.match(/# Weekly Report for ([^\s]+)/);
    if (emailMatch && emailMatch[1]) {
      return emailMatch[1];
    }
    return 'weekly-report';
  };
  
  return (
    <div className="mt-10 mb-6">
      <div className="card border-border shadow-md overflow-hidden">
        <div className="card-header bg-secondary flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-5 h-5 text-primary"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <h3 className="text-lg font-medium text-foreground">Generated Report</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              type="button"
              className={`
                inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md
                transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1
                ${copied 
                  ? 'bg-success text-success-foreground hover:bg-success-hover focus:ring-success/30'
                  : 'bg-primary text-primary-foreground hover:bg-primary-hover focus:ring-primary/30'
                }
              `}
            >
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
                  Copied to Clipboard
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                  </svg>
                  Copy to Clipboard
                </>
              )}
            </button>
            <button
              onClick={() => {
                // Create a blob with the text content
                const blob = new Blob([reportText], { type: 'text/plain' });
                // Create a URL for the blob
                const url = URL.createObjectURL(blob);
                // Create a temporary anchor element to trigger the download
                const a = document.createElement('a');
                a.href = url;
                // Get trainer email for filename
                const trainerEmail = extractTrainerEmail();
                a.download = `weekly-report-${trainerEmail}.txt`;
                // Trigger a click on the anchor element
                document.body.appendChild(a);
                a.click();
                // Clean up
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-foreground bg-secondary-hover rounded-md hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download
            </button>
          </div>
        </div>
        <div className="bg-card p-0 overflow-hidden">
          <div className="border-b border-border bg-muted px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground">
                <polyline points="4 7 4 4 20 4 20 7"></polyline>
                <line x1="9" y1="20" x2="15" y2="20"></line>
                <line x1="12" y1="4" x2="12" y2="20"></line>
              </svg>
              <span className="text-xs font-medium text-muted-foreground">Report Content</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {reportText.split('\n').length} lines
            </div>
          </div>
          <pre className="text-sm whitespace-pre-wrap font-mono max-h-[500px] overflow-y-auto bg-card p-5 text-black">
            {reportText}
          </pre>
        </div>
      </div>
      <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <span>You can copy this report to your clipboard or download it as a text file.</span>
      </div>
    </div>
  );
}

export default ReportOutput; 