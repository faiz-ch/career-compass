// Student types
export interface StudentBase {
  first_name: string;
  last_name: string;
  email: string;
  roll_number?: string;
}

export interface StudentCreate extends StudentBase {
  password: string;
}

export interface StudentRead extends StudentBase {
  id: number;
  created_at: string;
}

// Program type for JSON storage in Career (simplified)
export interface Program {
  title: string;
}

// Career types with programs as JSON (simplified to just titles)
export interface CareerBase {
  title: string;
  description?: string;
  required_skills?: string[];
  programs?: string[];  // Array of program titles
}

export interface CareerCreate extends CareerBase {}

export interface CareerUpdate {
  title?: string;
  description?: string;
  required_skills?: string[];
  programs?: string[];  // Array of program titles
}

export interface CareerRead extends CareerBase {
  id: number;
  created_at: string;
}

// Interview Result types
export interface InterviewResultBase {
  technical_skills: string[];
  soft_skills: string[];
  learning_style: string;
  career_interests: string[];
  confidence_level: string;
}

export interface InterviewResultCreate extends InterviewResultBase {}

export interface InterviewResultRead extends InterviewResultBase {
  id: number;
  student_id: number;
  created_at: string;
  updated_at: string;
}
