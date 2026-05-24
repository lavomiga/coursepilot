export type ClassCategory = 'Computer Science' | 'Humanities' | 'Math' | 'Major Req' | 'Core Req' | 'Elective';
export type WorkloadLevel = 'Low' | 'Medium' | 'High' | 'Intense';
export type CourseStatus = 'In Progress' | 'Planned' | 'Completed' | 'Locked';

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  workload: WorkloadLevel;
  term: string; // e.g., 'Spring 2024', 'Fall 2024', 'Spring 2025', 'Future'
  match: number; // match percentage
  description: string;
  category: ClassCategory;
  status: CourseStatus;
  prerequisites?: string[];
  difficultyScore?: number; // 1-10
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface RoadmapStats {
  gpa: number;
  totalCredits: number;
  completedCredits: number;
  plannedCredits: number;
  weeklyStudyHours: number;
}
