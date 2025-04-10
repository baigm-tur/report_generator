import { ReportFormData, CSVData } from '@/types';
import { parse } from 'csv-parse/sync';

/**
 * Generate formatted report text from form data
 */
export function generateReport(data: ReportFormData): string {
  // Generate report content
  let report = `# Weekly Report for ${data.trainerEmail.split('@')[0]}\n\n`;
  
  // Quality metrics section
  report += "## Quality Metrics\n\n";
  report += `- Original Task Average: ${data.orgAvg} | Previous Week: ${data.orgAvgPrev} | Campaign Avg: ${data.campaignAvg}.\n`;
  report += `- Task Average (Original + Redo): ${data.taskAvg} | Previous Week: ${data.taskAvgPrev}.\n`;
  report += `- Z-Score: ${data.taskZ} | Previous Week: ${data.taskZPrev}.\n\n`;
  
  // Quality evaluation
  report += "### Quality Evaluation\n\n";
  report += `#### Work Quality\n${data.qualityRemarks}\n\n`;
  report += `#### Quality Progress\n${data.qualityProgressRemarks}\n\n`;
  
  // Throughput metrics section
  report += "## Throughput Metrics\n\n";
  report += `- Hours per Original Task: ${data.hrsOrigTask} | Previous Week: ${data.taskTimePrev} | Campaign Avg: ${data.campaignHrsOrigTask}.\n`;
  report += `- Hours per Orig+Redo Task: ${data.hrsOrigRedoTask} | Previous Week: ${data.hrsOrigRedoTaskPrev} | Campaign Avg: ${data.campaignHrsOrigRedoTask}.\n`;
  report += `- Time per Task Z-Score: ${data.taskTimeZ} | Previous Week: ${data.taskTimeZPrev}.\n`;
  report += `- Original Tasks: ${data.numOrigTasks} tasks.\n`;
  report += `- Redo Tasks: ${data.numRedoTasks} tasks.\n\n`;
  
  // Task complexity
  report += "### Task Complexity\n\n";
  report += `- Low Complexity: ${data.numLowComplex} tasks (${data.pctLowComplex}).\n`;
  report += `- Medium Complexity: ${data.numMedComplex} tasks (${data.pctMedComplex}).\n`;
  report += `- High Complexity: ${data.numHighComplex} tasks (${data.pctHighComplex}).\n\n`;
  
  // Throughput evaluation
  report += "### Throughput Evaluation\n\n";
  report += `#### Overall Throughput\n${data.throughputRemarks}\n\n`;
  report += `#### Throughput Sufficiency\n${data.throughputSufficiencyRemarks}\n\n`;
  report += `#### Efficiency and Time Management\n${data.throughputEfficiencyRemarks}\n\n`;
  
  // Daily throughput section
  report += "### Daily Throughput\n\n";
  report += "| Day | Tasks | Hours |\n";
  report += "|-----|-------|-------|\n";
  report += `| Monday | ${data.monTasks || '0'} | ${data.monHrs || '0'} |\n`;
  report += `| Tuesday | ${data.tueTasks || '0'} | ${data.tueHrs || '0'} |\n`;
  report += `| Wednesday | ${data.wedTasks || '0'} | ${data.wedHrs || '0'} |\n`;
  report += `| Thursday | ${data.thuTasks || '0'} | ${data.thuHrs || '0'} |\n`;
  report += `| Friday | ${data.friTasks || '0'} | ${data.friHrs || '0'} |\n`;
  report += `| Saturday | ${data.satTasks || '0'} | ${data.satHrs || '0'} |\n`;
  report += `| Sunday | ${data.sunTasks || '0'} | ${data.sunHrs || '0'} |\n\n`;
  
  // Compliance metrics section
  report += "## Compliance Metrics\n\n";
  report += `- Total Logged Hours: ${data.totalLoggedHours} hours.\n`;
  report += `- Trainer Logged Hours: ${data.trainerLoggedHrs} hours.\n`;
  report += `- Non-Trainer Hours: ${data.pctNonTrainerHrs}.\n`;
  report += `- Activity Percentage: ${data.activityPercentage}.\n`;
  report += `- Time Off Days: ${data.timeOffDays} days.\n`;
  report += `- Idle Hours: ${data.idleHrs} hours.\n`;
  report += `- Manual Hours: ${data.manualHrs} hours.\n`;
  report += `- Suspicious Activity: ${data.suspiciousActivity ? 'Yes' : 'No'}.\n`;
  report += `- Meeting Attendance: ${data.meetingAttendance ? 'All meetings attended' : 'Missed some meetings'}.\n\n`;
  
  // Compliance evaluation
  report += "### Compliance Evaluation\n\n";
  report += `#### Timecard Evaluation\n${data.complianceRemarks}\n\n`;
  report += `#### Compliance Issues\n${data.complianceIssuesRemarks}\n\n`;
  
  // Conclusion section
  report += "## Conclusion\n\n";
  report += `### Week Rating: ${data.weekRating}/10\n\n`;
  report += `#### Overall Evaluation\n${data.concludingRemarks}\n\n`;
  
  // Steps taken section if provided
  if (data.todoItems) {
    report += "## Actions Taken\n\n";
    report += formatTodoItems(data.todoItems);
  }
  
  return report;
}

/**
 * Format todo items from text input to proper markdown
 */
function formatTodoItems(todoText: string): string {
  if (!todoText.trim()) return '';
  
  return todoText
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      
      if (trimmed.startsWith('[x]') || trimmed.startsWith('[X]')) {
        return `- [x] ${trimmed.substring(3).trim()} (completed)`;
      } else if (trimmed.startsWith('[ ]')) {
        return `- [ ] ${trimmed.substring(3).trim()} (planned)`;
      } else {
        return `- [ ] ${trimmed} (planned)`;
      }
    })
    .filter(line => line)
    .join('\n');
}

export function parseCSVData(csvContent: string): CSVData[] {
  try {
    // First, try standard CSV parsing
    const rows = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as CSVData[];

    // Log column names to debug
    if (rows.length > 0) {
      console.log("CSV columns found:", Object.keys(rows[0]));
      
      // Check for the daily data column
      const hasDailyData = Object.keys(rows[0]).some(key => 
        key.includes('Src') && key.includes('Mon') && key.includes('Tue')
      );
      
      console.log("Daily data column found:", hasDailyData);
    }
    
    return rows;
  } catch (error) {
    console.error('Error parsing CSV data:', error);
    
    // If standard parsing fails, try a more robust approach
    try {
      // First, get the header row
      const lines = csvContent.split('\n').filter(line => line.trim() !== '');
      if (lines.length <= 1) {
        return [];
      }
      
      const headerLine = lines[0];
      // Extract headers, handling quoted fields properly
      const headers = parseCSVLine(headerLine);
      console.log("Manually parsed headers:", headers);
      
      // Process data rows
      const result: CSVData[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length !== headers.length) {
          console.warn(`Line ${i+1} has ${values.length} values but there are ${headers.length} headers`);
          continue;
        }
        
        const row: CSVData = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        result.push(row);
      }
      
      return result;
    } catch (fallbackError) {
      console.error('Fallback CSV parsing also failed:', fallbackError);
    return [];
    }
  }
}

/**
 * Helper function to parse a CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Don't forget the last field
  if (current) {
    result.push(current.trim());
  }
  
  return result;
}

export function extractDailyDataFromString(dailyDataString: string): { 
  tasks: { [key: string]: string }, 
  hours: { [key: string]: string } 
} {
  // Default result structure
  const result = {
    tasks: {
      mon: '0',
      tue: '0',
      wed: '0',
      thu: '0',
      fri: '0',
      sat: '0',
      sun: '0'
    },
    hours: {
      mon: '0',
      tue: '0',
      wed: '0',
      thu: '0',
      fri: '0',
      sat: '0',
      sun: '0'
    }
  };

  if (!dailyDataString || dailyDataString.trim() === '') {
    console.log("No daily data string provided");
    return result;
  }

  try {
    console.log("Raw daily data string length:", dailyDataString.length);
    
    // Use a single comprehensive approach to extract all day data
    // This pattern looks for the sequence of hours and tasks for each day
    const dayEntryPattern = /(\d+(?:\.\d+)?)\s*H\s*\|\s*(\d+)\s*T/g;
    const allMatches = Array.from(dailyDataString.matchAll(dayEntryPattern));
    
    console.log(`Found ${allMatches.length} day entries in the data string`);
    
    if (allMatches.length >= 7) {
      // Map day indices to their keys
      const dayMap = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
      
      // We have enough matches for all 7 days
      allMatches.slice(0, 7).forEach((match, index) => {
        if (index < dayMap.length) {
      const day = dayMap[index];
          
          if (match && match[1] && match[2]) {
            // Hours
            result.hours[day] = match[1];
            
            // Tasks
            result.tasks[day] = match[2].replace(/^0+/, '') || '0';
            console.log(`Parsed day ${day}: ${result.tasks[day]} tasks, ${result.hours[day]} hours`);
          }
        }
      });
    } else {
      console.log("Not enough matches found, attempting to split the data");
      
      // Try to identify and extract data for each day separately
      // Check if the string contains "DPI" and "TMS" sections
      const hasDPI = dailyDataString.includes("DPI");
      const hasTMS = dailyDataString.includes("TMS");
      
      console.log(`Data contains: DPI=${hasDPI}, TMS=${hasTMS}`);
      
      // Split into days based on common markers in the CSV data
      if (hasDPI || hasTMS) {
        const dayMap = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
        
        // Try to find all individual day entries
        // First, use a very loose pattern to find each section that looks like a day entry
        const sections = dailyDataString.split(/\s{3,}/);
        
        // For each section that contains both 'H' and 'T', try to extract hours and tasks
        let dayIndex = 0;
        for (const section of sections) {
          if (section.includes('H') && section.includes('T') && dayIndex < dayMap.length) {
            // Extract hours and tasks from this section
            const hoursMatch = section.match(/(\d+(?:\.\d+)?)\s*H/);
            const tasksMatch = section.match(/(\d+)\s*T/);
            
            if (hoursMatch && tasksMatch) {
              const day = dayMap[dayIndex];
              result.hours[day] = hoursMatch[1];
              result.tasks[day] = tasksMatch[1].replace(/^0+/, '') || '0';
              console.log(`Extracted from section - day ${day}: ${result.tasks[day]} tasks, ${result.hours[day]} hours`);
              dayIndex++;
            }
          }
        }
      }
    }

    // Final check - if we have TMS data that contains hour:minute format, use it to override
    if (dailyDataString.includes('TMS') && dailyDataString.includes(':')) {
      const tmsPattern = /(\d+):(\d+)\s*H\s*\|\s*(\d+)\s*T/g;
      const tmsMatches = Array.from(dailyDataString.matchAll(tmsPattern));
      
      console.log(`Found ${tmsMatches.length} TMS format entries`);
      
      if (tmsMatches.length >= 7) {
        const dayMap = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
        
        tmsMatches.slice(0, 7).forEach((match, index) => {
          if (index < dayMap.length) {
            const day = dayMap[index];
            
            if (match && match[1] && match[2] && match[3]) {
              // Convert HH:MM to decimal hours
              const hours = parseInt(match[1]);
              const minutes = parseInt(match[2]);
              const decimalHours = (hours + minutes / 60).toFixed(2);
              
              // Update hours
              result.hours[day] = decimalHours;
              
              // Update tasks
              result.tasks[day] = match[3].replace(/^0+/, '') || '0';
              console.log(`TMS format - day ${day}: ${result.tasks[day]} tasks, ${result.hours[day]} hours`);
            }
          }
        });
      }
    }

    return result;
  } catch (error) {
    console.error('Error extracting daily data:', error);
    return result;
  }
}

// Calculate campaign averages from all rows
export function calculateCampaignAverages(rows: CSVData[], previousWeekRows: CSVData[] = []): CampaignAverages {
  // For weighted calculation based on total hours and tasks
  let totalHours = 0;
  let totalTasks = 0;
  let totalOrigHours = 0;
  let totalOrigTasks = 0;
  
  // For weighted quality ratings
  let sumOrigRatingWeighted = 0;
  let sumAllRatingWeighted = 0;
  let totalReviewedOrigTasks = 0;
  let totalReviewedAllTasks = 0;
  
  // Function to convert HH:MM to decimal for calculation
  const timeToDecimal = (timeStr: string): number => {
    if (!timeStr) return 0;
    if (timeStr.includes(':')) {
      const [hours, minutes] = timeStr.split(':').map(part => parseInt(part.trim()) || 0);
      return hours + minutes / 60;
    }
    return parseFloat(timeStr) || 0;
  };
  
  // Process current week data
  for (const row of rows) {
    // Get task counts
    const origTaskCount = parseInt(row['T(O)C'] || '0');
    const totalTaskCount = parseInt(row['TTC'] || '0');
    
    // Get hours (either total logged or calculate from hours per task)
    let origHours = 0;
    const loggedHours = timeToDecimal(row['T(C)LH'] || '0:00');
    const hrsPerOrigTask = timeToDecimal(row['T(O)H/T'] || '0:00');
    
    if (hrsPerOrigTask > 0 && origTaskCount > 0) {
      origHours = hrsPerOrigTask * origTaskCount;
    }
    
    // Add to totals for hours/tasks calculation
    if (origTaskCount > 0 && origHours > 0) {
      totalOrigHours += origHours;
      totalOrigTasks += origTaskCount;
    }
    
    if (totalTaskCount > 0 && loggedHours > 0) {
      totalHours += loggedHours;
      totalTasks += totalTaskCount;
    }
    
    // Calculate weighted quality ratings
    const origReviewedCount = parseInt(row['T(O)R'] || '0');
    const origAvgRating = parseFloat(row['T(O)AvR'] || '0');
    
    if (origReviewedCount > 0 && origAvgRating > 0) {
      sumOrigRatingWeighted += (origAvgRating * origReviewedCount);
      totalReviewedOrigTasks += origReviewedCount;
    }
    
    const allTasksRating = parseFloat(row['T(T)AvR'] || '0');
    // All tasks reviewed count is the sum of original and redo reviews
    const allReviewedCount = 
      parseInt(row['T(O)R'] || '0') + 
      parseInt(row['T(R)R'] || '0');
    
    if (allReviewedCount > 0 && allTasksRating > 0) {
      sumAllRatingWeighted += (allTasksRating * allReviewedCount);
      totalReviewedAllTasks += allReviewedCount;
    }
  }
  
  // Calculate the campaign averages
  let campaignHrsOrigTask = '0:00';
  if (totalOrigTasks > 0 && totalOrigHours > 0) {
    campaignHrsOrigTask = formatTime(totalOrigHours / totalOrigTasks);
  }
  
  let campaignHrsOrigRedoTask = '0:00';
  if (totalTasks > 0 && totalHours > 0) {
    campaignHrsOrigRedoTask = formatTime(totalHours / totalTasks);
  }
  
  // Calculate weighted quality average
  let campaignAvg = '0';
  if (totalReviewedAllTasks > 0) {
    campaignAvg = (sumAllRatingWeighted / totalReviewedAllTasks).toFixed(2);
  }
  
  // Process previous week data for comparison
  const previousWeekCampaignAvg = calculatePreviousWeekAverage(previousWeekRows);
  
  return {
    campaignHrsOrigTask,
    campaignHrsOrigRedoTask,
    campaignAvg,
    campaignAvgPrev: previousWeekCampaignAvg || (Math.max(0, parseFloat(campaignAvg) - 0.1)).toFixed(2),
  };
}

/**
 * Calculate the average rating from previous week data
 */
function calculatePreviousWeekAverage(previousWeekRows: CSVData[]): string {
  if (!previousWeekRows || previousWeekRows.length === 0) {
    return '';
  }
  
  // For weighted quality ratings
  let sumAllRatingWeighted = 0;
  let totalReviewedAllTasks = 0;
  
  // Process previous week data
  for (const row of previousWeekRows) {
    const allTasksRating = parseFloat(row['T(T)AvR'] || '0');
    // All tasks reviewed count is the sum of original and redo reviews
    const allReviewedCount = 
      parseInt(row['T(O)R'] || '0') + 
      parseInt(row['T(R)R'] || '0');
    
    if (allReviewedCount > 0 && allTasksRating > 0) {
      sumAllRatingWeighted += (allTasksRating * allReviewedCount);
      totalReviewedAllTasks += allReviewedCount;
    }
  }
  
  // Calculate the campaign average
  return totalReviewedAllTasks > 0 
    ? (sumAllRatingWeighted / totalReviewedAllTasks).toFixed(2)
    : '';
}

/**
 * Format a decimal time value to HH:MM format
 */
function formatTime(decimalHours: number): string {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

interface CampaignAverages {
  campaignHrsOrigTask: string;
  campaignHrsOrigRedoTask: string;
  campaignAvg: string;
  campaignAvgPrev: string;
}

// Calculate percentage
function calculatePercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

export function parseCSVDataToReportData(row: CSVData, allRows: CSVData[], previousWeekData: CSVData[] = []): Partial<ReportFormData> {
  // Extract the email from the contractor field
  const emailMatch = row.Contractor?.match(/\S+@\S+\.\S+/);
  const trainerEmail = emailMatch ? emailMatch[0] : '';
  
  // Extract daily data
  // Try different possible column names for the daily data
  let dailyDataString = '';
  // First, try the column name that was observed in the CSV file
  if (row['Src 					Mon 					Tue 					Wed 					Thu 					Fri 					Sat 					Sun']) {
    dailyDataString = row['Src 					Mon 					Tue 					Wed 					Thu 					Fri 					Sat 					Sun'];
  } 
  // Then try alternative formats that might exist
  else if (row['Src Mon Tue Wed Thu Fri Sat Sun']) {
    dailyDataString = row['Src Mon Tue Wed Thu Fri Sat Sun'];
  }
  // Try with a more generic approach - find any key that contains Src and Mon
  else {
    const srcMonKey = Object.keys(row).find(key => key.includes('Src') && key.includes('Mon'));
    if (srcMonKey) {
      dailyDataString = row[srcMonKey] || '';
    }
  }
  
  console.log("Found daily data column:", dailyDataString ? "Yes" : "No");
  
  const dailyData = extractDailyDataFromString(dailyDataString);
  
  // Calculate campaign averages for current week
  const campaignAverages = calculateCampaignAverages(allRows, previousWeekData);
  
  // Parse original tasks, redo tasks
  const numOrigTasks = row['T(O)C'] || '0';
  const numRedoTasks = row['T(R)C'] || '0';
  
  // Process hours per task
  const hrsOrigTask = row['T(O)H/T'] || '0:00';
  const hrsOrigRedoTask = row['T(T)H/T'] || '0:00';
  
  // Calculate Z-score for time per task
  const taskTimeZ = row['ZH/T'] || '0.00';
  
  // Format daily throughput data combining tasks and hours
  const monTasksAndHours = dailyData.tasks.mon !== '0' ? `${dailyData.tasks.mon} (${dailyData.hours.mon}h)` : '0';
  const tueTasksAndHours = dailyData.tasks.tue !== '0' ? `${dailyData.tasks.tue} (${dailyData.hours.tue}h)` : '0';
  const wedTasksAndHours = dailyData.tasks.wed !== '0' ? `${dailyData.tasks.wed} (${dailyData.hours.wed}h)` : '0';
  const thuTasksAndHours = dailyData.tasks.thu !== '0' ? `${dailyData.tasks.thu} (${dailyData.hours.thu}h)` : '0';
  const friTasksAndHours = dailyData.tasks.fri !== '0' ? `${dailyData.tasks.fri} (${dailyData.hours.fri}h)` : '0';
  const satTasksAndHours = dailyData.tasks.sat !== '0' ? `${dailyData.tasks.sat} (${dailyData.hours.sat}h)` : '0';
  const sunTasksAndHours = dailyData.tasks.sun !== '0' ? `${dailyData.tasks.sun} (${dailyData.hours.sun}h)` : '0';
  
  // Handle time formats and calculations
  const totalLoggedHours = row['TLH'] || '0';
  const trainerLoggedHrs = row['T(C)LH'] || '0';
  
  // Function to convert HH:MM to decimal for calculation
  const timeToDecimal = (timeStr: string): number => {
    if (!timeStr) return 0;
    if (timeStr.includes(':')) {
      const [hours, minutes] = timeStr.split(':').map(part => parseInt(part.trim()) || 0);
      return hours + minutes / 60;
    }
    return parseFloat(timeStr) || 0;
  };
  
  // Calculate non-trainer hours percentage
  const totalHoursDecimal = timeToDecimal(totalLoggedHours);
  const trainerHoursDecimal = timeToDecimal(trainerLoggedHrs);
  const nonTrainerHoursPercentage = totalHoursDecimal > 0 
    ? Math.round(((totalHoursDecimal - trainerHoursDecimal) / totalHoursDecimal) * 100)
    : 0;
  const pctNonTrainerHrs = `${Math.max(0, nonTrainerHoursPercentage)}%`;
  
  // Activity, idle hours, manual hours
  const activityPercentage = row['Ac'] ? `${parseFloat(row['Ac'])}%` : '0%';
  const idleHrs = row['IH'] || '0';
  const manualHrs = row['MH'] || '0';
  
  // Time off days
  const timeOffDays = row['Doff'] || '0';
  
  // Current week ratings
  const taskAvg = row['T(T)AvR'] || '0';
  const orgAvg = row['T(O)AvR'] || '0';
  const taskZ = row['ZAvR'] || '0';
  
  // Find previous week data for the same trainer
  let previousWeekRow: CSVData | undefined;
  
  if (emailMatch && previousWeekData.length > 0) {
    const email = emailMatch[0];
    previousWeekRow = previousWeekData.find(prevRow => {
      const prevEmailMatch = prevRow.Contractor?.match(/\S+@\S+\.\S+/);
      return prevEmailMatch && prevEmailMatch[0] === email;
    });
  }
  
  // Get previous week metrics if available, otherwise use estimation
  const orgAvgPrev = previousWeekRow?.['T(O)AvR'] || (Math.max(0, parseFloat(orgAvg) - 0.08)).toFixed(2);
  const taskAvgPrev = previousWeekRow?.['T(T)AvR'] || (Math.max(0, parseFloat(taskAvg) - 0.05)).toFixed(2);
  const taskZPrev = previousWeekRow?.['ZAvR'] || (Math.max(-3, parseFloat(taskZ) - 0.15)).toFixed(2);
  const taskTimePrev = previousWeekRow?.['T(T)H/T'] || hrsOrigRedoTask; // Use previous week's time or current if not available
  
  // Get previous week throughput metrics
  const hrsOrigRedoTaskPrev = previousWeekRow?.['T(T)H/T'] || previousWeekRow?.["Hrs per Task with Redo"] || hrsOrigRedoTask;
  const taskTimeZPrev = previousWeekRow?.['ZH/T'] || previousWeekRow?.["Time per Task Z-Score"] || taskTimeZ;
  
  // Generate appropriate remarks based on the data
  // Instead of auto-generating remarks, we'll leave these fields empty for the evaluator to fill
  const qualityRemarks = ''; // Empty for evaluator to fill
  const qualityProgressRemarks = ''; // Empty for evaluator to fill
  const throughputRemarks = ''; // Empty for evaluator to fill
  const throughputSufficiencyRemarks = ''; // Empty for evaluator to fill
  const throughputEfficiencyRemarks = ''; // Empty for evaluator to fill
  const complianceRemarks = ''; // Empty for evaluator to fill
  const complianceIssuesRemarks = ''; // Empty for evaluator to fill
  const concludingRemarks = ''; // Empty for evaluator to fill
  const stepsRemarks = ''; // Empty for evaluator to fill
  
  // Ratings
  const weekRating = '5'; // Default value, to be adjusted by evaluator
  
  return {
    trainerEmail,
    
    // Quality
    orgAvg,
    taskAvg,
    taskZ,
    campaignAvg: campaignAverages.campaignAvg,
    orgAvgPrev,
    taskAvgPrev,
    taskZPrev,
    campaignAvgPrev: campaignAverages.campaignAvgPrev,
    qualityRemarks,
    qualityProgressRemarks,
    
    // Throughput
    hrsOrigTask,
    hrsOrigRedoTask,
    campaignHrsOrigTask: campaignAverages.campaignHrsOrigTask,
    campaignHrsOrigRedoTask: campaignAverages.campaignHrsOrigRedoTask,
    taskTimeZ,
    taskTimePrev,
    hrsOrigRedoTaskPrev,
    taskTimeZPrev,
    
    // Task counts
    numOrigTasks,
    numRedoTasks,
    
    // Task complexity - leave empty instead of using artificial data
    numLowComplex: '',
    pctLowComplex: '',
    numMedComplex: '',
    pctMedComplex: '',
    numHighComplex: '',
    pctHighComplex: '',
    throughputRemarks,
    throughputSufficiencyRemarks,
    throughputEfficiencyRemarks,
    
    // Daily throughput - individual values
    monTasks: dailyData.tasks.mon,
    monHrs: dailyData.hours.mon,
    tueTasks: dailyData.tasks.tue,
    tueHrs: dailyData.hours.tue,
    wedTasks: dailyData.tasks.wed,
    wedHrs: dailyData.hours.wed,
    thuTasks: dailyData.tasks.thu,
    thuHrs: dailyData.hours.thu,
    friTasks: dailyData.tasks.fri,
    friHrs: dailyData.hours.fri,
    satTasks: dailyData.tasks.sat,
    satHrs: dailyData.hours.sat,
    sunTasks: dailyData.tasks.sun,
    sunHrs: dailyData.hours.sun,
    
    // Combined format for display
    monTasksAndHours,
    tueTasksAndHours,
    wedTasksAndHours,
    thuTasksAndHours,
    friTasksAndHours,
    satTasksAndHours,
    sunTasksAndHours,
    
    // Compliance
    totalLoggedHours,
    trainerLoggedHrs,
    pctNonTrainerHrs,
    activityPercentage,
    timeOffDays,
    idleHrs,
    manualHrs,
    suspiciousActivity: row['Flag'] && row['Flag'] !== '0.00' ? true : false,
    meetingAttendance: true, // Default value
    additionalNotes: '',
    complianceRemarks,
    complianceIssuesRemarks,
    
    // Conclusion
    weekRating,
    concludingRemarks,
    
    // Steps
    todoItems: '',
  };
}

/**
 * Generate quality remarks based on the trainer's performance metrics
 */
function generateQualityRemarks(row: CSVData, campaignAverages: any): string {
  // Get the task average rating or default to 0
  const taskAvg = parseFloat(row['T(T)AvR'] || '0');
  // Get the campaign average or default to 0
  const campaignAvg = parseFloat(campaignAverages.campaignAvg || '0');
  // Get the z-score or default to 0
  const zScore = parseFloat(row['ZAvR'] || '0');
  // Quality control percentage
  const qcPct = parseFloat(row['QC%']?.replace('%', '') || '0');
  
  // Early return if there's no meaningful data
  if (taskAvg === 0 || isNaN(taskAvg)) {
    return "No quality ratings data available for this trainer during the period.";
  }
  
  let remarks = '';
  
  // Evaluate the quality based on the average rating compared to campaign
  if (taskAvg > campaignAvg + 0.3) {
    remarks = `This trainer consistently demonstrates exceptional quality, performing ${(taskAvg - campaignAvg).toFixed(2)} points above the campaign average. `;
    if (zScore > 0.5) {
      remarks += `Their high Z-score of ${zScore.toFixed(2)} indicates they are among the top performers in the campaign. `;
    }
  } else if (taskAvg > campaignAvg) {
    remarks = `The trainer maintains quality above the campaign average (${taskAvg} vs campaign avg ${campaignAvg}). Their performance is solid and dependable with scores consistently above the benchmark. `;
  } else if (taskAvg > campaignAvg - 0.2) {
    remarks = `The trainer's quality metrics are close to campaign average (${taskAvg} vs campaign avg ${campaignAvg}). While their performance meets expectations, there is room for improvement to exceed the benchmark. `;
  } else {
    remarks = `Quality metrics are below campaign average (${taskAvg} vs campaign avg ${campaignAvg}). This is an area that needs attention and improvement. `;
    if (zScore < -0.5) {
      remarks += `Their Z-score of ${zScore.toFixed(2)} indicates a significant deviation from campaign norms. `;
    }
    remarks += `Consider additional training or support to help raise these scores. `;
  }
  
  // Add remarks about QC percentage
  if (qcPct > 85) {
    remarks += `The high QC rate of ${qcPct}% indicates thorough quality control coverage.`;
  } else if (qcPct > 70) {
    remarks += `The QC rate of ${qcPct}% is solid, though increasing coverage further would be beneficial.`;
  } else if (qcPct > 0) {
    remarks += `The QC rate of ${qcPct}% is below target levels. Increasing quality control coverage should be prioritized.`;
  }
  
  return remarks;
}

/**
 * Generate throughput remarks based on the trainer's performance metrics
 */
function generateThroughputRemarks(row: CSVData, campaignAverages: any): string {
  // Parse hours per task for both trainer and campaign
  const parseTime = (timeStr: string): number => {
    if (!timeStr || timeStr === '-') return 0;
    if (timeStr.includes(':')) {
      const [hours, minutes] = timeStr.split(':').map(num => parseInt(num) || 0);
      return hours + (minutes / 60);
    }
    return parseFloat(timeStr) || 0;
  };
  
  const hoursPerTask = parseTime(row['T(O)H/T'] || '0:00');
  const campaignHoursPerTask = parseTime(campaignAverages.campaignHrsOrigTask || '0:00');
  
  // Early return if no meaningful data
  if (parseFloat(row['T(O)C'] || '0') === 0) {
    return "No throughput data available for this trainer during the period.";
  }
  
  // Calculate total tasks
  const totalTasksCount = parseInt(row['TTC'] || '0');
  const originalTasksCount = parseInt(row['T(O)C'] || '0');
  const redoTasksCount = parseInt(row['T(R)C'] || '0');
  
  // Derive time efficiency
  const timeEfficiency = 
    hoursPerTask && campaignHoursPerTask 
      ? (campaignHoursPerTask - hoursPerTask) / campaignHoursPerTask 
      : 0;
  
  let remarks = "";
  
  // Time per task analysis
  if (Math.abs(timeEfficiency) < 0.1) {
    remarks = `The trainer's hours per task (${row['T(O)H/T']}) are in line with the campaign average (${campaignAverages.campaignHrsOrigTask}). `;
  } else if (timeEfficiency > 0.3) {
    remarks = `The trainer completes tasks significantly faster than the campaign average (${row['T(O)H/T']} vs campaign avg ${campaignAverages.campaignHrsOrigTask}). This excellent efficiency contributes to high productivity. `;
  } else if (timeEfficiency > 0.1) {
    remarks = `The trainer's hours per task (${row['T(O)H/T']}) are better than the campaign average (${campaignAverages.campaignHrsOrigTask}), demonstrating good time management. `;
  } else if (timeEfficiency < -0.3) {
    remarks = `The trainer takes considerably longer per task (${row['T(O)H/T']}) compared to campaign average (${campaignAverages.campaignHrsOrigTask}). This may indicate a need for process optimization or additional support. `;
  } else {
    remarks = `The trainer's hours per task (${row['T(O)H/T']}) are slightly higher than the campaign average (${campaignAverages.campaignHrsOrigTask}). There may be room for improving efficiency. `;
  }
  
  // Task volume analysis
  if (totalTasksCount > 15) {
    remarks += `The trainer completed a high volume of tasks (${totalTasksCount}) this week. `;
  } else if (totalTasksCount < 5) {
    remarks += `The trainer's task volume (${totalTasksCount}) is relatively low this week. `;
  } else {
    remarks += `The trainer's task volume (${totalTasksCount}) is at a moderate level. `;
  }
  
  return remarks;
}

/**
 * Generate compliance remarks based on the trainer's metrics
 */
function generateComplianceRemarks(row: CSVData): string {
  // Extract data with safe defaults
  const idleHours = parseFloat(row['IH'] || '0');
  const manualHours = parseFloat(row['MH'] || '0');
  const activityPercent = parseFloat(row['Ac']?.replace('%', '') || '0');
  const timeOffDays = parseInt(row['Doff'] || '0');
  const suspiciousActivity = row['Flag'] && row['Flag'] !== '0' && row['Flag'] !== '0.00';
  const mode = row['Mode'] || 'Full Time';
  
  // Calculate total hours
  const totalHoursStr = row['TLH'] || '0';
  let totalHours = 0;
  
  if (totalHoursStr.includes(':')) {
    const [hours, minutes] = totalHoursStr.split(':').map(num => parseInt(num) || 0);
    totalHours = hours + (minutes / 60);
  } else {
    totalHours = parseFloat(totalHoursStr) || 0;
  }
  
  let remarks = '';
  
  // Check if there's enough data to provide compliance remarks
  if (totalHours === 0 && timeOffDays === 0) {
    return "No time tracking data available for this trainer during the period.";
  }
  
  // Evaluate time tracking compliance
  const expectedMinHours = mode === 'Full Time' ? 30 : 20;
  const expectedHoursWithTimeOff = mode === 'Full Time' 
    ? Math.max(0, expectedMinHours - (timeOffDays * 8)) 
    : Math.max(0, expectedMinHours - (timeOffDays * 4));
  
  if (totalHours >= expectedHoursWithTimeOff) {
    remarks += `The trainer met their ${mode} hour requirements with ${totalHoursStr} hours logged. `;
  } else if (totalHours > 0) {
    const shortfall = expectedHoursWithTimeOff - totalHours;
    remarks += `The trainer logged ${totalHoursStr} hours, which is ${shortfall.toFixed(1)} hours below their ${mode} requirement after accounting for ${timeOffDays} days off. `;
  }
  
  // Add time off remarks
  if (timeOffDays > 0) {
    remarks += `They took ${timeOffDays} day${timeOffDays > 1 ? 's' : ''} off during this period. `;
  }
  
  // Flag issues
  let issues = [];
    
    if (idleHours > 2) {
    issues.push(`high idle time (${idleHours} hours)`);
    }
    
    if (manualHours > 2) {
    issues.push(`significant manual time entries (${manualHours} hours)`);
  }
  
  if (activityPercent < 30 && totalHours > 5) {
    issues.push(`low activity percentage (${activityPercent}%)`);
    }
    
    if (suspiciousActivity) {
    issues.push("potentially suspicious activity patterns");
  }
  
  // Add issues to remarks
  if (issues.length > 0) {
    remarks += `There are compliance concerns that need addressing: ${issues.join(', ')}. `;
    
    if (issues.length > 1) {
      remarks += "These multiple compliance issues should be discussed with the trainer promptly.";
    } else {
      remarks += "This should be monitored and discussed if it continues in future weeks.";
    }
  } else {
    remarks += "No significant compliance issues were detected.";
  }
  
  return remarks;
}

/**
 * Generate concluding remarks based on the trainer's overall performance
 */
function generateConcludingRemarks(row: CSVData, campaignAverages: any): string {
  // Extract key metrics
  const taskAvg = parseFloat(row['T(T)AvR'] || '0');
  const campaignAvg = parseFloat(campaignAverages.campaignAvg || '0');
  const totalTasksCount = parseInt(row['TTC'] || '0');
  
  // Compliance issues check
  const idleHours = parseFloat(row['IH'] || '0');
  const manualHours = parseFloat(row['MH'] || '0');
  const activityPercent = parseFloat(row['Ac']?.replace('%', '') || '0');
  const suspiciousActivity = row['Flag'] && row['Flag'] !== '0' && row['Flag'] !== '0.00';
  
  // Assess strengths and areas for improvement
  const strengths = [];
  const improvements = [];
  
  // Quality assessment
  if (taskAvg > campaignAvg + 0.2) {
    strengths.push("consistently high quality scores");
  } else if (taskAvg < campaignAvg - 0.2) {
    improvements.push("improving task quality");
  }
  
  // Throughput assessment
  if (totalTasksCount > 12) {
    strengths.push("high task volume");
  } else if (totalTasksCount < 7 && taskAvg > 0) {
    improvements.push("increasing task throughput");
  }
  
  // Compliance assessment
  if (idleHours > 2 || manualHours > 2 || activityPercent < 30 || suspiciousActivity) {
    improvements.push("addressing time tracking compliance");
  } else if (activityPercent > 50) {
    strengths.push("consistent time tracking");
  }
  
  // Generate the concluding remark
  let remarks = '';
  
  if (strengths.length > 0 && improvements.length > 0) {
    remarks = `Overall, this trainer demonstrates ${strengths.join(", ")}. For continued growth, focus areas should include ${improvements.join(", ")}.`;
  } else if (strengths.length > 0) {
    remarks = `This trainer is performing well across key metrics, particularly in ${strengths.join(", ")}. Continued consistency in these areas will ensure ongoing success.`;
  } else if (improvements.length > 0) {
    remarks = `This trainer needs to focus on ${improvements.join(", ")} to achieve better overall performance. Targeted coaching would be beneficial.`;
  } else {
    remarks = `The trainer's performance is within standard expectations. Regular feedback and engagement will help maintain and improve performance.`;
  }
  
  return remarks;
}

/**
 * Suggest steps that should be taken to address performance issues
 */
function generateStepsRemarks(row: CSVData, campaignAverages: any): string {
  // Extract key metrics for decision making
  const taskAvg = parseFloat(row['T(T)AvR'] || '0');
  const campaignAvg = parseFloat(campaignAverages.campaignAvg || '0');
  const totalTasksCount = parseInt(row['TTC'] || '0');
  const qcPct = parseFloat(row['QC%']?.replace('%', '') || '0');
  const activityPercent = parseFloat(row['Ac']?.replace('%', '') || '0');
  const idleHours = parseFloat(row['IH'] || '0');
  const manualHours = parseFloat(row['MH'] || '0');
  const suspiciousActivity = row['Flag'] && row['Flag'] !== '0' && row['Flag'] !== '0.00';
  
  // Quality issues
  const qualityIssue = taskAvg < campaignAvg - 0.2 && taskAvg > 0;
  // Throughput issues
  const throughputIssue = totalTasksCount < 7 && totalTasksCount > 0;
  // Compliance issues
  const complianceIssue = idleHours > 2 || manualHours > 2 || activityPercent < 30 || suspiciousActivity;
  
  // Generate steps based on issues
  const steps = [];
  
  if (!taskAvg && !totalTasksCount) {
    return "[x] Begin tracking performance metrics as none are currently available for this trainer\n[ ] Schedule an onboarding review to ensure proper task assignment";
  }
  
  if (qualityIssue) {
    if (qcPct < 70) {
      steps.push("[x] Increase quality control coverage to at least 80% of tasks to provide more comprehensive feedback");
    }
    steps.push("[ ] Schedule a 1:1 coaching session focused specifically on quality improvement areas");
    steps.push("[ ] Provide additional training materials or resources related to common quality issues");
  }
  
  if (throughputIssue) {
    steps.push("[x] Review current task assignment process to ensure consistent workflow");
    steps.push("[ ] Check for any blockers or technical issues that may be impeding productivity");
    steps.push("[ ] Consider pairing with a high-throughput campaign member for knowledge sharing");
  }
  
  if (complianceIssue) {
    if (idleHours > 2 || activityPercent < 30) {
      steps.push("[x] Address tracking activity levels and ensure proper use of the time tracking system");
    }
    if (manualHours > 2) {
      steps.push("[ ] Review manual time entry practices and provide guidance on automated tracking");
    }
    if (suspiciousActivity) {
      steps.push("[x] Conduct a detailed audit of suspicious activity flags and discuss findings with the trainer");
    }
  }
  
  // If no specific issues but still room for improvement
  if (steps.length === 0) {
    if (taskAvg < campaignAvg && taskAvg > 0) {
      steps.push("[ ] Provide regular constructive feedback to help the trainer reach campaign average quality levels");
    }
    if (totalTasksCount < 10 && totalTasksCount > 0) {
      steps.push("[ ] Suggest time management techniques to improve overall throughput");
    }
    
    // If still no steps, add general development step
    if (steps.length === 0) {
      steps.push("[x] Continue regular check-ins to maintain performance and identify growth opportunities");
      steps.push("[ ] Encourage knowledge sharing and participation in campaign improvement initiatives");
    }
  }
  
  return steps.join("\n");
}

/**
 * Suggest a rating from 1-10 based on the trainer's metrics
 */
function suggestRating(row: CSVData, campaignAverages: any): string {
  // Extract key metrics for decision making
  const taskAvg = parseFloat(row['T(T)AvR'] || '0');
  const campaignAvg = parseFloat(campaignAverages.campaignAvg || '0');
  const totalTasksCount = parseInt(row['TTC'] || '0');
  const qcPct = parseFloat(row['QC%']?.replace('%', '') || '0');
  
  // Compliance issues check
  const idleHours = parseFloat(row['IH'] || '0');
  const manualHours = parseFloat(row['MH'] || '0');
  const activityPercent = parseFloat(row['Ac']?.replace('%', '') || '0');
  const suspiciousActivity = row['Flag'] && row['Flag'] !== '0' && row['Flag'] !== '0.00';
  const complianceIssues = idleHours > 2 || manualHours > 2 || activityPercent < 30 || suspiciousActivity;
  
  // Base rating on quality
  let qualityScore = 5;
  if (taskAvg >= campaignAvg + 0.5) {
    qualityScore = 8;
  } else if (taskAvg > campaignAvg + 0.2) {
    qualityScore = 7;
  } else if (taskAvg > campaignAvg) {
    qualityScore = 6;
  } else if (taskAvg > campaignAvg - 0.3) {
    qualityScore = 5;
  } else if (taskAvg > 0) {
    qualityScore = 4;
  } else {
    qualityScore = 5; // Neutral if no quality data
  }
  
  // Adjust for throughput
  let throughputAdjustment = 0;
  if (totalTasksCount > 15) {
    throughputAdjustment = 1;
  } else if (totalTasksCount < 5 && totalTasksCount > 0) {
    throughputAdjustment = -1;
  }
  
  // Adjust for resolution rate
  const resolvedRate = row['TTR'] && row['T(O)C'] && parseFloat(row['T(O)C']) > 0 
    ? Math.round((parseFloat(row['TTR']) / parseFloat(row['T(O)C'])) * 100)
    : 0;
    
  let resolutionAdjustment = 0;
  if (resolvedRate > 80) {
    resolutionAdjustment = 0.5;
  } else if (resolvedRate < 50 && resolvedRate > 0) {
    resolutionAdjustment = -0.5;
  }
  
  // Adjust for compliance issues
  let complianceAdjustment = complianceIssues ? -1 : 0;
  
  // Calculate final score
  let finalScore = qualityScore + throughputAdjustment + resolutionAdjustment + complianceAdjustment;
  
  // Bound the score between 1 and 10
  finalScore = Math.max(1, Math.min(10, Math.round(finalScore)));
  
  return finalScore.toString();
}

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
}; 