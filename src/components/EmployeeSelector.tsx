"use client";

import { useState, useEffect, useMemo } from 'react';
import { CSVData, ReportFormData } from '@/types';
import { parseCSVDataToReportData } from '@/lib/utils';

interface EmployeeSelectorProps {
  csvData: CSVData[];
  previousWeekData: CSVData[];
  onEmployeeSelected: (employee: CSVData, formData: Partial<ReportFormData>) => void;
}

export const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({ 
  csvData, 
  previousWeekData,
  onEmployeeSelected 
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  
  const employeesWithEmail = useMemo(() => {
    return csvData.filter(row => row.Contractor && row.Contractor.includes('@'));
  }, [csvData]);
  
  // Generate a unique ID for each employee
  const employeesWithIds = employeesWithEmail.map((employee, index) => {
    // Try to extract email from the contractor field
    const emailMatch = employee.Contractor?.match(/\S+@\S+\.\S+/);
    const email = emailMatch ? emailMatch[0] : '';
    
    // Create a unique ID from email or index
    const id = email || `employee_${index}`;
    
    // Get the name part by removing the email
    const name = employee.Contractor?.replace(email, '').trim() || `Employee ${index + 1}`;
    
    return {
      id,
      name,
      email,
      data: employee
    };
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectedEmployeeId(selectedId);
    
    // Find the selected employee
    const selectedEmployee = employeesWithIds.find(emp => emp.id === selectedId);
    
    if (selectedEmployee) {
      // Parse CSV data to form data using both current week and previous week data
      const formData = parseCSVDataToReportData(selectedEmployee.data, csvData, previousWeekData);
      
      // Call the onEmployeeSelected callback with the employee data and form data
      onEmployeeSelected(selectedEmployee.data, formData);
    }
  };
  
  const handleEmployeeClick = (employee: CSVData) => {
    // Parse CSV data to form data using both current week and previous week data
    const formData = parseCSVDataToReportData(employee, csvData, previousWeekData);
    onEmployeeSelected(employee, formData);
  };
  
  return (
    <div className="mb-6">
      <label htmlFor="employee-selector" className="block text-sm font-medium text-gray-700 mb-2">
        Select Employee
      </label>
      <div className="flex items-center gap-4">
        <select
          id="employee-selector"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={selectedEmployeeId}
          onChange={handleChange}
        >
          <option value="">-- Select an employee --</option>
          {employeesWithIds.map(employee => (
            <option key={employee.id} value={employee.id}>
              {employee.name} {employee.email ? `(${employee.email})` : ''}
            </option>
          ))}
        </select>
        
        {employeesWithIds.length === 0 && (
          <p className="text-sm text-red-600">No valid employee data found in the CSV</p>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Select an employee to automatically populate the form with their data.
      </p>
    </div>
  );
}

export default EmployeeSelector; 