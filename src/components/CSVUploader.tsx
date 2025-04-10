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
    <div className="mb-6 space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Upload Current Week CSV</label>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCurrentWeekClick}
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Upload Current Week CSV"}
          </button>
          {currentWeekFileName && <span className="text-sm text-gray-600">File: {currentWeekFileName}</span>}
          <input
            ref={currentWeekFileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCurrentWeekFileChange}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Upload Previous Week CSV</label>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePreviousWeekClick}
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Upload Previous Week CSV"}
          </button>
          {previousWeekFileName && <span className="text-sm text-gray-600">File: {previousWeekFileName}</span>}
          <input
            ref={previousWeekFileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handlePreviousWeekFileChange}
          />
        </div>
      </div>

      <p className="mt-1 text-xs text-gray-500">
        Upload both the current week and previous week CSV files to automatically fill in form fields.
      </p>
      
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">CSV files processed successfully!</p>
          <p className="text-xs text-green-600 mt-1">Select an employee from the dropdown below to populate the form.</p>
        </div>
      )}

      {currentWeekData.length > 0 && previousWeekData.length === 0 && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-600">Current week CSV uploaded. Please upload the previous week CSV to enable comparison data.</p>
        </div>
      )}

      {currentWeekData.length === 0 && previousWeekData.length > 0 && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-600">Previous week CSV uploaded. Please upload the current week CSV to complete the process.</p>
        </div>
      )}
    </div>
  );
}

export default CSVUploader; 