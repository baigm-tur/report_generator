import { z } from 'zod';

export const reportFormSchema = z.object({
  // Trainer information
  trainerEmail: z.string().email('Please enter a valid email address'),
  
  // Quality metrics
  orgAvg: z.string().min(1, 'Required field'),
  taskAvg: z.string().min(1, 'Required field'),
  taskZ: z.string().min(1, 'Required field'),
  teamAvg: z.string().min(1, 'Required field'),
  orgAvgPrev: z.string().min(1, 'Required field'),
  taskAvgPrev: z.string().min(1, 'Required field'),
  taskZPrev: z.string().min(1, 'Required field'),
  teamAvgPrev: z.string().min(1, 'Required field'),
  qualityRemarks: z.string().min(1, 'Please add quality remarks'),
  qualityProgressRemarks: z.string().min(1, 'Please add quality progress remarks'),
  
  // Throughput metrics
  hrsOrigTask: z.string().min(1, 'Required field'),
  hrsOrigRedoTask: z.string().min(1, 'Required field'),
  hrsOrigRedoTaskPrev: z.string().min(1, 'Required field'),
  teamHrsOrigTask: z.string().min(1, 'Required field'),
  teamHrsOrigRedoTask: z.string().min(1, 'Required field'),
  taskTimeZ: z.string().min(1, 'Required field'),
  taskTimeZPrev: z.string().min(1, 'Required field'),
  taskTimePrev: z.string().min(1, 'Required field'),
  
  // Daily throughput
  monTasks: z.string(),
  monHrs: z.string(),
  tueTasks: z.string(),
  tueHrs: z.string(),
  wedTasks: z.string(),
  wedHrs: z.string(),
  thuTasks: z.string(),
  thuHrs: z.string(),
  friTasks: z.string(),
  friHrs: z.string(),
  satTasks: z.string(),
  satHrs: z.string(),
  sunTasks: z.string(),
  sunHrs: z.string(),
  
  // Daily throughput - combined format
  monTasksAndHours: z.string(),
  tueTasksAndHours: z.string(),
  wedTasksAndHours: z.string(),
  thuTasksAndHours: z.string(),
  friTasksAndHours: z.string(),
  satTasksAndHours: z.string(),
  sunTasksAndHours: z.string(),
  
  // Task completion
  numOrigTasks: z.string().min(1, 'Required field'),
  numRedoTasks: z.string().min(1, 'Required field'),
  
  // Task complexity
  numLowComplex: z.string().min(1, 'Required field'),
  pctLowComplex: z.string().min(1, 'Required field'),
  numMedComplex: z.string().min(1, 'Required field'),
  pctMedComplex: z.string().min(1, 'Required field'),
  numHighComplex: z.string().min(1, 'Required field'),
  pctHighComplex: z.string().min(1, 'Required field'),
  throughputRemarks: z.string().min(1, 'Please add throughput remarks'),
  throughputSufficiencyRemarks: z.string().min(1, 'Please add throughput sufficiency remarks'),
  throughputEfficiencyRemarks: z.string().min(1, 'Please add throughput efficiency remarks'),
  
  // Compliance
  totalLoggedHours: z.string().min(1, 'Required field'),
  trainerLoggedHrs: z.string().min(1, 'Required field'),
  pctNonTrainerHrs: z.string().min(1, 'Required field'),
  activityPercentage: z.string().min(1, 'Required field'),
  timeOffDays: z.string().min(1, 'Required field'),
  idleHrs: z.string().min(1, 'Required field'),
  manualHrs: z.string().min(1, 'Required field'),
  suspiciousActivity: z.boolean(),
  meetingAttendance: z.boolean(),
  additionalNotes: z.string().optional(),
  complianceRemarks: z.string().min(1, 'Please add compliance remarks'),
  complianceIssuesRemarks: z.string().min(1, 'Please add compliance issues remarks'),
  
  // Conclusion
  weekRating: z.string().min(1, 'Required field'),
  concludingRemarks: z.string().min(1, 'Please add concluding remarks'),
  
  // Steps
  todoItems: z.string().min(1, 'Please add todo items'),
  stepsRemarks: z.string().optional(),
}); 