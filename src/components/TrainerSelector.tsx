"use client";

import { useState, useEffect, useMemo } from 'react';
import { CSVData, ReportFormData } from '@/types';
import { parseCSVDataToReportData } from '@/lib/utils';

interface TrainerSelectorProps {
  csvData: CSVData[];
  previousWeekData: CSVData[];
  onTrainerSelected: (trainer: CSVData, formData: Partial<ReportFormData>) => void;
}

export const TrainerSelector: React.FC<TrainerSelectorProps> = ({ 
  csvData, 
  previousWeekData,
  onTrainerSelected 
}) => {
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('');
  
  const trainersWithEmail = useMemo(() => {
    return csvData.filter(row => row.Contractor && row.Contractor.includes('@'));
  }, [csvData]);
  
  // Generate a unique ID for each trainer
  const trainersWithIds = trainersWithEmail.map((trainer, index) => {
    // Try to extract email from the contractor field
    const emailMatch = trainer.Contractor?.match(/\S+@\S+\.\S+/);
    const email = emailMatch ? emailMatch[0] : '';
    
    // Create a unique ID from email or index
    const id = email || `trainer_${index}`;
    
    // Get the name part by removing the email
    const name = trainer.Contractor?.replace(email, '').trim() || `Trainer ${index + 1}`;
    
    return {
      id,
      name,
      email,
      data: trainer
    };
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectedTrainerId(selectedId);
    
    // Find the selected trainer
    const selectedTrainer = trainersWithIds.find(emp => emp.id === selectedId);
    
    if (selectedTrainer) {
      // Parse CSV data to form data using both current week and previous week data
      const formData = parseCSVDataToReportData(selectedTrainer.data, csvData, previousWeekData);
      
      // Call the onTrainerSelected callback with the trainer data and form data
      onTrainerSelected(selectedTrainer.data, formData);
    }
  };
  
  const handleTrainerClick = (trainer: CSVData) => {
    // Parse CSV data to form data using both current week and previous week data
    const formData = parseCSVDataToReportData(trainer, csvData, previousWeekData);
    onTrainerSelected(trainer, formData);
  };
  
  return (
    <div className="mb-6">
      <label htmlFor="trainer-selector" className="block text-sm font-medium text-gray-700 mb-2">
        Select Trainer
      </label>
      <div className="flex items-center gap-4">
        <select
          id="trainer-selector"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={selectedTrainerId}
          onChange={handleChange}
        >
          <option value="">-- Select an trainer --</option>
          {trainersWithIds.map(trainer => (
            <option key={trainer.id} value={trainer.id}>
              {trainer.name} {trainer.email ? `(${trainer.email})` : ''}
            </option>
          ))}
        </select>
        
        {trainersWithIds.length === 0 && (
          <p className="text-sm text-red-600">No valid trainer data found in the CSV</p>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Select an trainer to automatically populate the form with their data.
      </p>
    </div>
  );
}

export default TrainerSelector; 