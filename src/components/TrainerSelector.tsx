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
    <div className="mb-8">
      <div className="card hover:shadow-md transition-all">
        <div className="card-header bg-secondary">
          <div className="flex items-center justify-between">
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
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <h3 className="font-medium text-foreground">Select Trainer</h3>
            </div>
            {selectedTrainerId && (
              <span className="badge badge-success">
                Trainer Selected
              </span>
            )}
          </div>
        </div>
        
        <div className="card-body">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <label htmlFor="trainer-selector" className="block text-sm font-medium text-foreground mb-2">
                Choose a trainer to populate the form
              </label>
              <div className="relative">
                <select
                  id="trainer-selector"
                  className="w-full rounded-md border-input bg-card text-foreground shadow-sm p-3 text-sm appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors hover:border-muted-foreground/50 focus:border-primary"
                  value={selectedTrainerId}
                  onChange={handleChange}
                >
                  <option value="">-- Select a trainer --</option>
                  {trainersWithIds.map(trainer => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.name} {trainer.email ? `(${trainer.email})` : ''}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-4 h-4"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
            </div>
            
            {selectedTrainerId && (
              <div className="p-3 bg-success/10 border border-success/30 rounded-md text-success text-sm flex items-start gap-2 animate-fadeIn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mt-0.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <p>Trainer selected and form populated successfully.</p>
              </div>
            )}
            
            {trainersWithIds.length === 0 && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mt-0.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>No valid trainer data found in the CSV</p>
              </div>
            )}
            
            <div className="p-3 bg-muted rounded-md flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mt-0.5 text-primary">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <div className="text-xs text-muted-foreground">
                <span>Select a trainer to automatically populate the form with their data. The dropdown shows all trainers found in the current week CSV data.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrainerSelector; 