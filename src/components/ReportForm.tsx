"use client";

import { useState, useEffect } from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { reportFormSchema } from '@/lib/schema';
import { ReportFormData, CSVData } from '@/types';
import { generateReport, extractDailyDataFromString } from '@/lib/utils';

import CSVUploader from './CSVUploader';
import EmployeeSelector from './EmployeeSelector';
import { FormField } from './ui/FormField';
import ReportOutput from './ReportOutput';

// Type-safe schema for form
type FormData = z.infer<typeof reportFormSchema>;

const defaultValues: FormData = {
  trainerEmail: '',
  orgAvg: '',
  taskAvg: '',
  taskZ: '',
  teamAvg: '',
  orgAvgPrev: '',
  taskAvgPrev: '',
  taskZPrev: '',
  teamAvgPrev: '',
  qualityRemarks: '',
  qualityProgressRemarks: '',
  hrsOrigTask: '',
  hrsOrigRedoTask: '',
  teamHrsOrigTask: '',
  teamHrsOrigRedoTask: '',
  taskTimeZ: '',
  taskTimePrev: '',
  hrsOrigRedoTaskPrev: '',
  taskTimeZPrev: '',
  monTasks: '',
  monHrs: '',
  tueTasks: '',
  tueHrs: '',
  wedTasks: '',
  wedHrs: '',
  thuTasks: '',
  thuHrs: '',
  friTasks: '',
  friHrs: '',
  satTasks: '',
  satHrs: '',
  sunTasks: '',
  sunHrs: '',
  monTasksAndHours: '',
  tueTasksAndHours: '',
  wedTasksAndHours: '',
  thuTasksAndHours: '',
  friTasksAndHours: '',
  satTasksAndHours: '',
  sunTasksAndHours: '',
  numOrigTasks: '',
  numRedoTasks: '',
  numLowComplex: '',
  pctLowComplex: '',
  numMedComplex: '',
  pctMedComplex: '',
  numHighComplex: '',
  pctHighComplex: '',
  throughputRemarks: '',
  throughputSufficiencyRemarks: '',
  throughputEfficiencyRemarks: '',
  totalLoggedHours: '',
  trainerLoggedHrs: '',
  pctNonTrainerHrs: '',
  activityPercentage: '',
  timeOffDays: '',
  idleHrs: '',
  manualHrs: '',
  suspiciousActivity: false,
  meetingAttendance: true,
  additionalNotes: '',
  complianceRemarks: '',
  complianceIssuesRemarks: '',
  weekRating: '5',
  concludingRemarks: '',
  todoItems: '',
  stepsRemarks: '',
};

export function ReportForm() {
  const [csvData, setCsvData] = useState<CSVData[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Partial<CSVData> | null>(null);
  const [reportText, setReportText] = useState<string>('');
  const [isEmployeeSelected, setIsEmployeeSelected] = useState<boolean>(false);
  const [prefillMessage, setPrefillMessage] = useState<string>('');
  const [previousWeekData, setPreviousWeekData] = useState<CSVData[]>([]);
  const [complexityWarning, setComplexityWarning] = useState<string>('');
  
  const methods = useForm<FormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues,
  });
  
  const { handleSubmit, reset, setValue, watch, formState: { isSubmitting, isSubmitSuccessful } } = methods;
  
  // Watch daily throughput values to update the bar chart
  const dailyValues = {
    monTasks: watch('monTasks'),
    monHrs: watch('monHrs'),
    tueTasks: watch('tueTasks'),
    tueHrs: watch('tueHrs'),
    wedTasks: watch('wedTasks'),
    wedHrs: watch('wedHrs'),
    thuTasks: watch('thuTasks'),
    thuHrs: watch('thuHrs'),
    friTasks: watch('friTasks'),
    friHrs: watch('friHrs'),
    satTasks: watch('satTasks'),
    satHrs: watch('satHrs'),
    sunTasks: watch('sunTasks'),
    sunHrs: watch('sunHrs'),
    hrsOrigRedoTask: watch('hrsOrigRedoTask'), // Track the average time per task
    
    // Watch complexity values and original tasks for validation
    numLowComplex: watch('numLowComplex'),
    numMedComplex: watch('numMedComplex'),
    numHighComplex: watch('numHighComplex'),
    numOrigTasks: watch('numOrigTasks')
  };
  
  // Update bar chart when daily values change
  useEffect(() => {
    // Update combined task and hour display
    if (dailyValues.monTasks && dailyValues.monHrs) {
      setValue('monTasksAndHours', `${dailyValues.monTasks} (${dailyValues.monHrs}h)`);
    }
    if (dailyValues.tueTasks && dailyValues.tueHrs) {
      setValue('tueTasksAndHours', `${dailyValues.tueTasks} (${dailyValues.tueHrs}h)`);
    }
    if (dailyValues.wedTasks && dailyValues.wedHrs) {
      setValue('wedTasksAndHours', `${dailyValues.wedTasks} (${dailyValues.wedHrs}h)`);
    }
    if (dailyValues.thuTasks && dailyValues.thuHrs) {
      setValue('thuTasksAndHours', `${dailyValues.thuTasks} (${dailyValues.thuHrs}h)`);
    }
    if (dailyValues.friTasks && dailyValues.friHrs) {
      setValue('friTasksAndHours', `${dailyValues.friTasks} (${dailyValues.friHrs}h)`);
    }
    if (dailyValues.satTasks && dailyValues.satHrs) {
      setValue('satTasksAndHours', `${dailyValues.satTasks} (${dailyValues.satHrs}h)`);
    }
    if (dailyValues.sunTasks && dailyValues.sunHrs) {
      setValue('sunTasksAndHours', `${dailyValues.sunTasks} (${dailyValues.sunHrs}h)`);
    }
    
    // Convert time string to decimal hours for calculations
    const timeToDecimal = (timeStr: string): number => {
      if (!timeStr) return 0;
      if (timeStr.includes(':')) {
        const [hours, minutes] = timeStr.split(':').map(part => parseInt(part.trim()) || 0);
        return hours + minutes / 60;
      }
      return parseFloat(timeStr) || 0;
    };
    
    // Get average time per task
    const avgTimePerTask = timeToDecimal(dailyValues.hrsOrigRedoTask);
    
    // Update bar heights based on efficiency relative to average time per task
    const updateBar = (id: string, tasks: string, hours: string) => {
      const element = document.getElementById(id);
      if (element && tasks && hours) {
        const taskCount = parseInt(tasks);
        const totalHours = parseFloat(hours);
        
        if (taskCount === 0 || totalHours === 0 || avgTimePerTask === 0) {
          // No tasks or no time spent, bar should be empty
          const bar = element.querySelector('.current-week-bar') as HTMLElement;
          if (bar) {
            bar.style.height = '0%';
          }
          return;
        }
        
        // Calculate efficiency: expected hours for this many tasks vs actual hours
        const expectedHours = taskCount * avgTimePerTask;
        // If actual hours are less than expected, efficiency > 100%, if more then efficiency < 100%
        const efficiency = (expectedHours / totalHours) * 100;
        
        // Cap the efficiency for visualization purposes
        const cappedEfficiency = Math.min(Math.max(efficiency, 0), 200);
        
        // If efficiency is 100%, the bar is half full
        // If efficiency is 200% (twice as fast), the bar is full
        // If efficiency is 50% (half as fast), the bar is quarter full
        const heightPercentage = cappedEfficiency / 2;
        
        const bar = element.querySelector('.current-week-bar') as HTMLElement;
        if (bar) {
          bar.style.height = `${heightPercentage}%`;
          
          // Update bar color based on efficiency
          if (efficiency >= 100) {
            bar.classList.remove('bg-red-500');
            bar.classList.add('bg-green-500');
          } else {
            bar.classList.remove('bg-green-500');
            bar.classList.add('bg-red-500');
          }
        }
      }
    };
    
    updateBar('monday-bar', dailyValues.monTasks, dailyValues.monHrs);
    updateBar('tuesday-bar', dailyValues.tueTasks, dailyValues.tueHrs);
    updateBar('wednesday-bar', dailyValues.wedTasks, dailyValues.wedHrs);
    updateBar('thursday-bar', dailyValues.thuTasks, dailyValues.thuHrs);
    updateBar('friday-bar', dailyValues.friTasks, dailyValues.friHrs);
    updateBar('saturday-bar', dailyValues.satTasks, dailyValues.satHrs);
    updateBar('sunday-bar', dailyValues.sunTasks, dailyValues.sunHrs);
    
  }, [dailyValues, setValue]);
  
  // Effect for auto-calculating complexity percentages
  useEffect(() => {
    // Extract values and convert to numbers
    const lowComplex = parseInt(dailyValues.numLowComplex) || 0;
    const medComplex = parseInt(dailyValues.numMedComplex) || 0;
    const highComplex = parseInt(dailyValues.numHighComplex) || 0;
    const origTasks = parseInt(dailyValues.numOrigTasks) || 0;
    
    // Calculate total tasks
    const totalComplexTasks = lowComplex + medComplex + highComplex;
    
    // Check if sum matches original tasks
    if (totalComplexTasks > 0 && origTasks > 0 && totalComplexTasks !== origTasks) {
      // Set warning message
      setComplexityWarning(`Warning: Sum of complexity tasks (${totalComplexTasks}) doesn't match number of original tasks (${origTasks})`);
    } else {
      setComplexityWarning('');
    }
    
    // Calculate and set percentages
    if (totalComplexTasks > 0) {
      const lowPct = Math.round((lowComplex / totalComplexTasks) * 100);
      const medPct = Math.round((medComplex / totalComplexTasks) * 100);
      const highPct = Math.round((highComplex / totalComplexTasks) * 100);
      
      // Handle rounding issues to ensure total is 100%
      let adjustedHighPct = highPct;
      if (lowPct + medPct + highPct !== 100 && highComplex > 0) {
        adjustedHighPct = 100 - (lowPct + medPct);
      }
      
      // Set values in the form
      setValue('pctLowComplex', `${lowPct}%`);
      setValue('pctMedComplex', `${medPct}%`);
      setValue('pctHighComplex', `${adjustedHighPct}%`);
    } else {
      // If no tasks, set all percentages to 0%
      setValue('pctLowComplex', '0%');
      setValue('pctMedComplex', '0%');
      setValue('pctHighComplex', '0%');
    }
  }, [
    dailyValues.numLowComplex, 
    dailyValues.numMedComplex, 
    dailyValues.numHighComplex,
    dailyValues.numOrigTasks,
    setValue
  ]);
  
  const onSubmit: SubmitHandler<FormData> = (data) => {
    const report = generateReport(data as ReportFormData);
    setReportText(report);
    
    // Scroll to report output
    setTimeout(() => {
      if (document.getElementById('report-output')) {
        document.getElementById('report-output')?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  const handleCSVData = (currentWeekData: CSVData[], previousWeekData: CSVData[]) => {
    setCsvData(currentWeekData);
    setIsEmployeeSelected(false);
    setPrefillMessage('');
    // Store the previous week data for later use
    setPreviousWeekData(previousWeekData);
  };
  
  const handleEmployeeSelected = (data: CSVData, formData: Partial<ReportFormData>) => {
    setSelectedEmployee(data);
    setIsEmployeeSelected(true);
    
    // Track which fields were populated
    const populatedFields: string[] = [];
    
    // List of fields that should NOT be auto-filled
    const evaluatorFields = [
      'qualityRemarks', 
      'qualityProgressRemarks',
      'throughputRemarks', 
      'throughputSufficiencyRemarks',
      'throughputEfficiencyRemarks',
      'complianceRemarks',
      'complianceIssuesRemarks',
      'concludingRemarks', 
      'todoItems',
      'stepsRemarks'
    ];
    
    // Populate form with data from selected employee, skipping evaluator fields
    Object.entries(formData).forEach(([key, value]) => {
      if (
        value !== undefined && 
        value !== null && 
        value !== '' && 
        !evaluatorFields.includes(key)
      ) {
        setValue(key as keyof FormData, value as string);
        populatedFields.push(key);
      }
    });
    
    // Check specifically for previous week throughput data fields
    if (previousWeekData.length > 0) {
      console.log("Previous week data available:", previousWeekData.length, "records");
      
      const employee = data.Contractor || data.Name || data.Email;
      console.log("Looking for previous week data for:", employee);
      
      // Find matching employee in previous week data
      const prevWeekEmployee = previousWeekData.find(
        empData => (empData.Contractor && empData.Contractor === employee) || 
                  (empData.Name && empData.Name === employee) || 
                  (empData.Email && empData.Email === employee)
      );
      
      if (prevWeekEmployee) {
        console.log("Found previous week data for employee:", prevWeekEmployee);
        
        // For Hours per Original + Redo Task
        if (prevWeekEmployee.HrsPerTaskWithRedo) {
          console.log("Setting hrsOrigRedoTaskPrev to:", prevWeekEmployee.HrsPerTaskWithRedo);
          setValue('hrsOrigRedoTaskPrev', prevWeekEmployee.HrsPerTaskWithRedo);
          populatedFields.push('hrsOrigRedoTaskPrev');
        } else if (prevWeekEmployee["Hrs per Task with Redo"]) {
          console.log("Setting hrsOrigRedoTaskPrev from alt field to:", prevWeekEmployee["Hrs per Task with Redo"]);
          setValue('hrsOrigRedoTaskPrev', prevWeekEmployee["Hrs per Task with Redo"]);
          populatedFields.push('hrsOrigRedoTaskPrev');
        }
        
        // For Z-Score
        if (prevWeekEmployee.TimePerTaskZScore) {
          console.log("Setting taskTimeZPrev to:", prevWeekEmployee.TimePerTaskZScore);
          setValue('taskTimeZPrev', prevWeekEmployee.TimePerTaskZScore);
          populatedFields.push('taskTimeZPrev');
        } else if (prevWeekEmployee["Time per Task Z-Score"]) {
          console.log("Setting taskTimeZPrev from alt field to:", prevWeekEmployee["Time per Task Z-Score"]);
          setValue('taskTimeZPrev', prevWeekEmployee["Time per Task Z-Score"]);
          populatedFields.push('taskTimeZPrev');
        }
        
        // Additionally, ensure we have a value for taskTimePrev (Hours per Original Task)
        if (!formData.taskTimePrev) {
          if (prevWeekEmployee.HrsPerTask) {
            setValue('taskTimePrev', prevWeekEmployee.HrsPerTask);
            populatedFields.push('taskTimePrev');
          } else if (prevWeekEmployee["Hrs per Task"]) {
            setValue('taskTimePrev', prevWeekEmployee["Hrs per Task"]);
            populatedFields.push('taskTimePrev');
          }
        }
      } else {
        console.log("No matching employee found in previous week data");
      }
    }
    
    // Set a message about auto-filled fields
    const filledFieldCount = populatedFields.length;
    if (filledFieldCount > 0) {
      const name = data.Contractor 
        ? data.Contractor.replace(/\S+@\S+\.\S+/, '').trim() 
        : 'Selected employee';
      
      const hasPreviousData = previousWeekData.length > 0;
      
      setPrefillMessage(
        `${name}'s data has been loaded. ${filledFieldCount} fields were automatically filled. ` +
        (hasPreviousData 
          ? 'Previous week data has been used for comparison metrics. Evaluation text fields need to be completed manually.' 
          : 'No previous week data available, estimates are being used for comparison. Evaluation text fields need to be completed manually.')
      );
    } else {
      setPrefillMessage('No data could be extracted from the CSV for this employee. Please fill in the form manually.');
    }
  };
  
  const handleReset = () => {
    reset(defaultValues);
    setReportText('');
    setIsEmployeeSelected(false);
    setPrefillMessage('');
  };
  
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Weekly Report Generator</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <CSVUploader onDataParsed={handleCSVData} />
        
        {csvData.length > 0 && (
          <EmployeeSelector 
            csvData={csvData} 
            previousWeekData={previousWeekData}
            onEmployeeSelected={handleEmployeeSelected} 
          />
        )}
        
        {isEmployeeSelected && prefillMessage && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-600">{prefillMessage}</p>
          </div>
        )}
        
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Trainer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="trainerEmail"
                  label="Trainer Email"
                  placeholder="trainer@example.com"
                  required
                />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quality Metrics</h2>
              
              <div className="bg-white p-4 rounded-md border border-gray-200 mb-4">
                <h3 className="text-base font-medium text-gray-700 mb-3">Weekly Comparison</h3>
                
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                        <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Week</th>
                        <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previous Week</th>
                        <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Avg</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="py-2 px-4 text-sm font-medium text-gray-700">Original Task Average</td>
                        <td className="py-2 px-4">
                          <FormField name="orgAvg" label="" placeholder="e.g., 6.95" required />
                        </td>
                        <td className="py-2 px-4">
                          <FormField name="orgAvgPrev" label="" placeholder="e.g., 6.87" required />
                        </td>
                        <td className="py-2 px-4">
                          <FormField name="teamAvg" label="" placeholder="e.g., 6.60" required />
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 text-sm font-medium text-gray-700">Task Average</td>
                        <td className="py-2 px-4">
                          <FormField name="taskAvg" label="" placeholder="e.g., 7.00" required />
                        </td>
                        <td className="py-2 px-4">
                          <FormField name="taskAvgPrev" label="" placeholder="e.g., 6.90" required />
                        </td>
                        <td className="py-2 px-4">
                          <FormField name="teamAvgPrev" label="" placeholder="e.g., 6.55" required />
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 text-sm font-medium text-gray-700">Z-Score</td>
                        <td className="py-2 px-4">
                          <FormField name="taskZ" label="" placeholder="e.g., +1.25" required />
                        </td>
                        <td className="py-2 px-4">
                          <FormField name="taskZPrev" label="" placeholder="e.g., +1.10" required />
                        </td>
                        <td className="py-2 px-4 text-sm text-gray-400 italic">
                          N/A
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <p className="mt-3 text-xs text-gray-500">
                  Z-Score compares the employee's performance relative to team standard deviation. A positive score indicates above-average performance.
                </p>
              </div>
              
              <div className="w-full">
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-gray-700">Quality Evaluation</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      How do you evaluate the trainer's work in terms of quality? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="quality-evaluation-work"
                      {...methods.register("qualityRemarks")}
                      placeholder="Provide specific and insightful evaluation. Avoid directly translating numeric to qualitative assessments and mention specific details that could be missed by the metrics."
                      className="w-full h-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      How do you evaluate the trainer's progress in terms of quality? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="quality-evaluation-progress"
                      {...methods.register("qualityProgressRemarks")}
                      placeholder="Do you observe anything concerning (e.g., a consistent decline in quality or consistently poor quality)? Be specific and insightful."
                      className="w-full h-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Throughput Metrics</h2>
              
              <div className="bg-white p-4 rounded-md border border-gray-200 mb-4">
                <h3 className="text-base font-medium text-gray-700 mb-3">Weekly Comparison</h3>
                
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                        <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Week</th>
                        <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previous Week</th>
                        <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Avg</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="py-2 px-4 text-sm font-medium text-gray-700">Hours per Original Task</td>
                        <td className="py-2 px-4">
                          <FormField name="hrsOrigTask" label="" placeholder="e.g., 2:45" required />
                        </td>
                        <td className="py-2 px-4">
                          <FormField name="taskTimePrev" label="" placeholder="e.g., 3:15" required />
                        </td>
                        <td className="py-2 px-4">
                          <FormField name="teamHrsOrigTask" label="" placeholder="e.g., 5:02" required />
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 text-sm font-medium text-gray-700">Hours per Original + Redo Task</td>
                        <td className="py-2 px-4">
                          <FormField name="hrsOrigRedoTask" label="" placeholder="e.g., 2:58" required />
                        </td>
                        <td className="py-2 px-4">
                          <FormField name="hrsOrigRedoTaskPrev" label="" placeholder="e.g., 3:10" required />
                        </td>
                        <td className="py-2 px-4">
                          <FormField name="teamHrsOrigRedoTask" label="" placeholder="e.g., 4:02" required />
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 text-sm font-medium text-gray-700">Z-Score for Time per Task</td>
                        <td className="py-2 px-4">
                          <FormField name="taskTimeZ" label="" placeholder="e.g., -0.32" required />
                        </td>
                        <td className="py-2 px-4">
                          <FormField name="taskTimeZPrev" label="" placeholder="e.g., -0.28" required />
                        </td>
                        <td className="py-2 px-4 text-sm text-gray-400 italic">
                          N/A
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <p className="mt-3 text-xs text-gray-500">
                  Time per task Z-Score compares the employee's efficiency relative to team standard deviation. A negative score indicates faster-than-average task completion.
                </p>
              </div>
              
              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-4">Daily Throughput</h3>
              <div className="bg-white p-4 rounded-md border border-gray-200 mb-4">
                <div className="flex justify-center mb-2">
                  <div className="flex items-center mr-4">
                    <div className="w-4 h-4 bg-green-500 mr-2"></div>
                    <span className="text-sm">Good Efficiency</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 mr-2"></div>
                    <span className="text-sm">Low Efficiency</span>
                  </div>
                </div>
                <div className="text-xs text-center mb-2 text-gray-600">
                  Bar height shows throughput efficiency relative to average hours per task
                </div>
                <div className="grid grid-cols-7 gap-2">
                  <div className="text-center">
                    <div className="font-medium text-gray-700">Mon</div>
                    <div id="monday-bar" className="mt-2 bg-blue-100 rounded-t-md" style={{ height: '100px', position: 'relative' }}>
                      <div className="current-week-bar absolute bottom-0 left-0 right-0 bg-green-500 rounded-t-md transition-all duration-300" style={{ height: '0%' }}></div>
                    </div>
                    <div className="mt-1">
                      <FormField name="monTasksAndHours" label="" placeholder="0 (0h)" />
                      <input type="hidden" name="monTasks" />
                      <input type="hidden" name="monHrs" />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-700">Tue</div>
                    <div id="tuesday-bar" className="mt-2 bg-blue-100 rounded-t-md" style={{ height: '100px', position: 'relative' }}>
                      <div className="current-week-bar absolute bottom-0 left-0 right-0 bg-green-500 rounded-t-md transition-all duration-300" style={{ height: '0%' }}></div>
                    </div>
                    <div className="mt-1">
                      <FormField name="tueTasksAndHours" label="" placeholder="0 (0h)" />
                      <input type="hidden" name="tueTasks" />
                      <input type="hidden" name="tueHrs" />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-700">Wed</div>
                    <div id="wednesday-bar" className="mt-2 bg-blue-100 rounded-t-md" style={{ height: '100px', position: 'relative' }}>
                      <div className="current-week-bar absolute bottom-0 left-0 right-0 bg-green-500 rounded-t-md transition-all duration-300" style={{ height: '0%' }}></div>
                    </div>
                    <div className="mt-1">
                      <FormField name="wedTasksAndHours" label="" placeholder="0 (0h)" />
                      <input type="hidden" name="wedTasks" />
                      <input type="hidden" name="wedHrs" />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-700">Thu</div>
                    <div id="thursday-bar" className="mt-2 bg-blue-100 rounded-t-md" style={{ height: '100px', position: 'relative' }}>
                      <div className="current-week-bar absolute bottom-0 left-0 right-0 bg-green-500 rounded-t-md transition-all duration-300" style={{ height: '0%' }}></div>
                    </div>
                    <div className="mt-1">
                      <FormField name="thuTasksAndHours" label="" placeholder="0 (0h)" />
                      <input type="hidden" name="thuTasks" />
                      <input type="hidden" name="thuHrs" />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-700">Fri</div>
                    <div id="friday-bar" className="mt-2 bg-blue-100 rounded-t-md" style={{ height: '100px', position: 'relative' }}>
                      <div className="current-week-bar absolute bottom-0 left-0 right-0 bg-green-500 rounded-t-md transition-all duration-300" style={{ height: '0%' }}></div>
                    </div>
                    <div className="mt-1">
                      <FormField name="friTasksAndHours" label="" placeholder="0 (0h)" />
                      <input type="hidden" name="friTasks" />
                      <input type="hidden" name="friHrs" />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-700">Sat</div>
                    <div id="saturday-bar" className="mt-2 bg-blue-100 rounded-t-md" style={{ height: '100px', position: 'relative' }}>
                      <div className="current-week-bar absolute bottom-0 left-0 right-0 bg-green-500 rounded-t-md transition-all duration-300" style={{ height: '0%' }}></div>
                    </div>
                    <div className="mt-1">
                      <FormField name="satTasksAndHours" label="" placeholder="0 (0h)" />
                      <input type="hidden" name="satTasks" />
                      <input type="hidden" name="satHrs" />
                    </div>
                </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-700">Sun</div>
                    <div id="sunday-bar" className="mt-2 bg-blue-100 rounded-t-md" style={{ height: '100px', position: 'relative' }}>
                      <div className="current-week-bar absolute bottom-0 left-0 right-0 bg-green-500 rounded-t-md transition-all duration-300" style={{ height: '0%' }}></div>
                </div>
                    <div className="mt-1">
                      <FormField name="sunTasksAndHours" label="" placeholder="0 (0h)" />
                      <input type="hidden" name="sunTasks" />
                      <input type="hidden" name="sunHrs" />
                </div>
                </div>
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-4">Task Completion</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  name="numOrigTasks"
                  label="Number of Original Tasks"
                  placeholder="e.g., 12"
                  required
                />
                <FormField
                  name="numRedoTasks"
                  label="Number of Redo Tasks"
                  placeholder="e.g., 0"
                  required
                />
              </div>
              
              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-4">Task Complexity</h3>
              {complexityWarning && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-700">{complexityWarning}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="numLowComplex"
                  label="Number of Low Complexity Tasks"
                  placeholder="e.g., 2"
                  required
                />
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Percentage of Low Complexity Tasks <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="pctLowComplex"
                    type="text"
                    placeholder="Auto-calculated"
                    value={watch('pctLowComplex')}
                    readOnly
                    className="w-full px-3 py-2 border rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed border-gray-300"
                  />
                </div>
                <FormField
                  name="numMedComplex"
                  label="Number of Medium Complexity Tasks"
                  placeholder="e.g., 4"
                  required
                />
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Percentage of Medium Complexity Tasks <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="pctMedComplex"
                    type="text"
                    placeholder="Auto-calculated"
                    value={watch('pctMedComplex')}
                    readOnly
                    className="w-full px-3 py-2 border rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed border-gray-300"
                  />
                </div>
                <FormField
                  name="numHighComplex"
                  label="Number of High Complexity Tasks"
                  placeholder="e.g., 3"
                  required
                />
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Percentage of High Complexity Tasks <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="pctHighComplex"
                    type="text"
                    placeholder="Auto-calculated"
                    value={watch('pctHighComplex')}
                    readOnly
                    className="w-full px-3 py-2 border rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed border-gray-300"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="space-y-4">
                    <h3 className="text-base font-medium text-gray-700">Throughput Evaluation</h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        How do you evaluate the trainer's work in terms of throughput? <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="throughput-evaluation-work"
                        {...methods.register("throughputRemarks")}
                        placeholder="Provide specific and insightful evaluation. Avoid directly translating numeric to qualitative assessments and mention specific details that could be missed by the metrics."
                        className="w-full h-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Do you find the trainer's throughput to be sufficient based on the tasks that were done? <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="throughput-evaluation-sufficiency"
                        {...methods.register("throughputSufficiencyRemarks")}
                        placeholder="Consider task complexity, volume, and quality when evaluating sufficiency. Be specific and insightful."
                        className="w-full h-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        How do you evaluate the trainer's time management, efficiency, and working patterns? <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="throughput-evaluation-efficiency"
                        {...methods.register("throughputEfficiencyRemarks")}
                        placeholder="Evaluate work distribution, peaks/troughs in performance, and overall efficiency. Be specific and insightful."
                        className="w-full h-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Compliance Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  name="totalLoggedHours"
                  label="Total Logged Hours"
                  placeholder="e.g., 40.00"
                  required
                />
                <FormField
                  name="trainerLoggedHrs"
                  label="Trainer Logged Hours"
                  placeholder="e.g., 38.80"
                  required
                />
                <FormField
                  name="pctNonTrainerHrs"
                  label="Percentage Non-Trainer Hours"
                  placeholder="e.g., 3%"
                  required
                />
                <FormField
                  name="activityPercentage"
                  label="Activity Percentage"
                  placeholder="e.g., 53%"
                  required
                />
                <FormField
                  name="timeOffDays"
                  label="Time Off Days"
                  placeholder="e.g., 0"
                  required
                />
                <FormField
                  name="idleHrs"
                  label="Idle Hours"
                  placeholder="e.g., 0.00"
                  required
                />
                <FormField
                  name="manualHrs"
                  label="Manual Hours"
                  placeholder="e.g., 0.00"
                  required
                />
                <FormField
                  name="suspiciousActivity"
                  label="Suspicious Activity"
                  type="checkbox"
                />
                <FormField
                  name="meetingAttendance"
                  label="Attended all meetings?"
                  type="checkbox"
                />
                <div className="md:col-span-3">
                  <div className="space-y-4">
                    <h3 className="text-base font-medium text-gray-700">Compliance Evaluation</h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        How do you evaluate the trainer's timecards? <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="compliance-evaluation-timecards"
                        {...methods.register("complianceRemarks")}
                        placeholder="Is there anything suspicious or unnecessary work that you observe? Be specific and insightful."
                        className="w-full h-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Have you noticed any compliance issues? <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="compliance-evaluation-issues"
                        {...methods.register("complianceIssuesRemarks")}
                        placeholder="Consider not meeting minimum hours, not applying for leaves timely, not attending meetings, using disallowed apps, etc. Be specific and insightful."
                        className="w-full h-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Conclusion</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                <FormField
                  name="weekRating"
                  label="Week Rating (1-10)"
                    type="number"
                    min="1"
                    max="10"
                  required
                />
                </div>
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      How do you evaluate the trainer's week overall? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="conclusion-evaluation-overall"
                      {...methods.register("concludingRemarks")}
                      placeholder="Provide a holistic assessment of the trainer's performance this week. Be specific and insightful."
                      className="w-full h-32 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Steps Taken</h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    What actions did you take regarding the trainer? <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="bg-white p-4 rounded-md border border-gray-200">
                    <textarea
                      id="steps-taken-actions"
                      {...methods.register("todoItems")}
                      placeholder="Addressing issues is a must (e.g., discussing throughput issues with the trainer and letting them know they are performing below expectations). List noteworthy actions taken. Use the format below."
                      className="w-full h-32 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                      required
                    />
                    
                    <div className="mt-3 text-sm text-gray-600">
                      <p><strong>Task Format:</strong></p>
                      <ul className="list-disc ml-5 space-y-1">
                        <li>[x] Use this format for completed actions</li>
                        <li>[ ] Use this format for planned actions</li>
                        <li>Each action should be on a new line</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reset Form
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </form>
        </FormProvider>
        
        {reportText && <div id="report-output"><ReportOutput reportText={reportText} /></div>}
      </div>
    </div>
  );
}

export default ReportForm; 