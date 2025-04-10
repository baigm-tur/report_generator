// Report form data types
export interface ReportFormData {
  // Trainer information
  trainerEmail: string;
  
  // Quality metrics
  orgAvg: string;
  taskAvg: string;
  taskZ: string;
  teamAvg: string;
  orgAvgPrev: string;
  taskAvgPrev: string;
  taskZPrev: string;
  teamAvgPrev: string;
  qualityRemarks: string;
  qualityProgressRemarks: string;
  
  // Throughput metrics
  hrsOrigTask: string;
  hrsOrigRedoTask: string;
  teamHrsOrigTask: string;
  teamHrsOrigRedoTask: string;
  taskTimeZ: string; // Z-score for time per task
  taskTimePrev: string; // Previous week's time per task
  hrsOrigRedoTaskPrev: string; // Previous week's hours per original + redo task
  taskTimeZPrev: string; // Previous week's Z-score for time per task
  
  // Daily throughput
  monTasks: string;
  monHrs: string;
  tueTasks: string;
  tueHrs: string;
  wedTasks: string;
  wedHrs: string;
  thuTasks: string;
  thuHrs: string;
  friTasks: string;
  friHrs: string;
  satTasks: string;
  satHrs: string;
  sunTasks: string;
  sunHrs: string;
  
  // Task completion 
  numOrigTasks: string;
  numRedoTasks: string;
  
  // Task complexity
  numLowComplex: string;
  pctLowComplex: string;
  numMedComplex: string;
  pctMedComplex: string;
  numHighComplex: string;
  pctHighComplex: string;
  throughputRemarks: string;
  throughputSufficiencyRemarks: string;
  throughputEfficiencyRemarks: string;
  
  // Compliance
  totalLoggedHours: string;
  trainerLoggedHrs: string;
  pctNonTrainerHrs: string;
  activityPercentage: string;
  timeOffDays: string;
  idleHrs: string;
  manualHrs: string;
  suspiciousActivity: boolean;
  meetingAttendance: boolean;
  additionalNotes: string;
  complianceRemarks: string;
  complianceIssuesRemarks: string;
  
  // Conclusion
  weekRating: string;
  concludingRemarks: string;
  
  // Steps
  todoItems: string;
  
  // Task display properties for combined data
  monTasksAndHours: string;
  tueTasksAndHours: string;
  wedTasksAndHours: string;
  thuTasksAndHours: string;
  friTasksAndHours: string;
  satTasksAndHours: string;
  sunTasksAndHours: string;
}

// CSV data structure
export interface CSVData {
  Week?: string;
  Contractor?: string;
  Campaign?: string;
  Lead?: string;
  '(O)C'?: string; // Original Tasks
  'T(O)C'?: string; // Total Original Tasks
  'Z(O)C'?: string; // Z-Score Original Tasks
  'CC'?: string;
  '(R)C'?: string; // Redo Tasks
  'T(R)C'?: string; // Total Redo Tasks
  'Z(R)C'?: string; // Z-Score Redo Tasks
  'TTC'?: string; // Total Tasks Count
  'R'?: string; // Resolved Tasks
  'ZR'?: string; // Z-Score Resolved
  'T(O)R'?: string; // Total Original Resolved
  'T(R)R'?: string; // Total Redo Resolved
  'TTR'?: string; // Total Tasks Resolved
  'Score Count'?: string;
  'QC%'?: string; // Quality Control Percentage
  'T(O)QC%'?: string; // Total Original Quality Control Percentage
  'T(T)QC%'?: string; // Total Tasks Quality Control Percentage
  'T(O)FR'?: string;
  'T(R)FR'?: string;
  'TTFR'?: string;
  'AvR'?: string; // Average Rating
  'ZAvR'?: string; // Z-Score Average Rating
  'T(O)AvR'?: string; // Total Original Average Rating
  'T(R)AvR'?: string; // Total Redo Average Rating
  'T(T)AvR'?: string; // Total Tasks Average Rating
  'Src Mon Tue Wed Thu Fri Sat Sun'?: string; // Daily data
  'NoSD'?: string; // No. of Days
  'Mode'?: string; // Full Time or Part Time
  'LH'?: string; // Logged Hours
  'T(C)LH'?: string; // Total Contractor Logged Hours
  'T(NC)LH'?: string; // Total Non-Contractor Logged Hours
  'TLH'?: string; // Total Logged Hours
  'H/T'?: string; // Hours per Task
  'ZH/T'?: string; // Z-Score Hours per Task
  'T(O)H/T'?: string; // Total Original Hours per Task
  'T(C)H/T'?: string; // Total Contractor Hours per Task
  'T(T)H/T'?: string; // Total Tasks Hours per Task
  'MH'?: string; // Manual Hours
  'IH'?: string; // Idle Hours
  'MH%'?: string; // Manual Hours Percentage
  'IH%'?: string; // Idle Hours Percentage
  'Ac'?: string; // Activity
  'ZAc'?: string; // Z-Score Activity
  'Ac<5%'?: string; // Activity < 5%
  'Ac<10%'?: string; // Activity < 10%
  'Ac<20%'?: string; // Activity < 20%
  'Ac>90%'?: string; // Activity > 90%
  'Doff'?: string; // Days Off
  ''?: string; // Empty column (appears twice in the data)
  'QCTC'?: string;
  'QCH/T'?: string;
  'ZQCTC'?: string;
  'Context'?: string;
  'Flag'?: string;
  [key: string]: string | undefined; // Allow for any additional columns
}

// Helper types
export type WeeklyReportData = {
  contractor: string;
  email: string;
  reportData: ReportFormData;
}; 