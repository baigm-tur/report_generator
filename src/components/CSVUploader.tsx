"use client";

import { useState, useRef } from 'react';
import { parseCSVData } from '@/lib/utils';
import { CSVData } from '@/types';

interface CSVUploaderProps {
  onDataParsed: (currentWeekData: CSVData[], previousWeekData: CSVData[]) => void;
}

export function CSVUploader({ onDataParsed }: CSVUploaderProps) {
  const [currentWeekFileName, setCurrentWeekFileName] = useState<string>('');
  const [previousWeekFileName, setPreviousWeekFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const currentWeekFileInputRef = useRef<HTMLInputElement>(null);
  const previousWeekFileInputRef = useRef<HTMLInputElement>(null);
  
  // Store the parsed CSV data
  const [currentWeekData, setCurrentWeekData] = useState<CSVData[]>([]);
  const [previousWeekData, setPreviousWeekData] = useState<CSVData[]>([]);

  const readFileAsync = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleCurrentWeekFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setCurrentWeekFileName(file.name);
    setIsLoading(true);
    setError(null);
    
    try {
      const content = await readFileAsync(file);
      const csvData = parseCSVData(content);
      
      if (csvData.length === 0) {
        throw new Error("No data found in the current week CSV file or the format is incorrect.");
      }
      
      setCurrentWeekData(csvData);
      
      // If both files are uploaded, call the callback
      if (previousWeekData.length > 0) {
        onDataParsed(csvData, previousWeekData);
        setSuccess(true);
      }
    } catch (error) {
      console.error("Error processing current week CSV:", error);
      setError(error instanceof Error ? error.message : "Error processing current week CSV file. Please check the format.");
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousWeekFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setPreviousWeekFileName(file.name);
    setIsLoading(true);
    setError(null);
    
    try {
      const content = await readFileAsync(file);
      const csvData = parseCSVData(content);
      
      if (csvData.length === 0) {
        throw new Error("No data found in the previous week CSV file or the format is incorrect.");
      }
      
      setPreviousWeekData(csvData);
      
      // If both files are uploaded, call the callback
      if (currentWeekData.length > 0) {
        onDataParsed(currentWeekData, csvData);
        setSuccess(true);
      }
    } catch (error) {
      console.error("Error processing previous week CSV:", error);
      setError(error instanceof Error ? error.message : "Error processing previous week CSV file. Please check the format.");
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrentWeekClick = () => {
    currentWeekFileInputRef.current?.click();
  };

  const handlePreviousWeekClick = () => {
    previousWeekFileInputRef.current?.click();
  };

  return (
    <div className="mb-8 space-y-6">
      <h3 className="text-lg font-medium mb-4">Data Import</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card hover:shadow-md transition-all">
          <div className="card-header bg-secondary">
            <div className="flex items-center justify-between w-full">
              <label className="font-medium text-foreground">Current Week Data</label>
              {currentWeekFileName && (
                <span className={`badge ${currentWeekData.length > 0 ? 'badge-success' : 'badge-warning'}`}>
                  {currentWeekData.length > 0 ? 'Processed' : 'Pending'}
                </span>
              )}
            </div>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-3">
              <button
                onClick={handleCurrentWeekClick}
                type="button"
                className="w-full px-4 py-3 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Upload Current Week CSV
                  </>
                )}
              </button>
              {currentWeekFileName && (
                <div className="bg-secondary text-xs px-3 py-2 rounded-md text-muted-foreground">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span className="text-xs truncate max-w-full" title={currentWeekFileName}>{currentWeekFileName}</span>
                  </div>
                </div>
              )}
              <input
                ref={currentWeekFileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCurrentWeekFileChange}
              />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md transition-all">
          <div className="card-header bg-secondary">
            <div className="flex items-center justify-between w-full">
              <label className="font-medium text-foreground">Previous Week Data</label>
              {previousWeekFileName && (
                <span className={`badge ${previousWeekData.length > 0 ? 'badge-success' : 'badge-warning'}`}>
                  {previousWeekData.length > 0 ? 'Processed' : 'Pending'}
                </span>
              )}
            </div>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-3">
              <button
                onClick={handlePreviousWeekClick}
                type="button"
                className="w-full px-4 py-3 text-sm font-medium text-accent-foreground bg-accent rounded-md hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Upload Previous Week CSV
                  </>
                )}
              </button>
              {previousWeekFileName && (
                <div className="bg-secondary text-xs px-3 py-2 rounded-md text-muted-foreground">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span className="text-xs truncate max-w-full" title={previousWeekFileName}>{previousWeekFileName}</span>
                  </div>
                </div>
              )}
              <input
                ref={previousWeekFileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handlePreviousWeekFileChange}
              />
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm flex items-start gap-3 fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div>
            <p className="font-medium mb-1">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-success/10 border border-success/30 rounded-lg text-success text-sm flex items-start gap-3 fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <div>
            <p className="font-medium mb-1">Success</p>
            <p>CSV files processed successfully! Select a trainer from the dropdown below to populate the form.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CSVUploader; 