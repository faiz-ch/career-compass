// Authentication types
export interface UserLogin {
  email: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface TokenData {
  user_id?: string;
}

// Student types
export interface StudentBase {
  roll_number: string;
  name: string;
  email: string;
  hobbies?: string;
  interests?: string;
}

export interface StudentCreate extends StudentBase {
  password: string;
}

export interface StudentRead extends StudentBase {
  id: number;
  created_at: string;
}

// Program types
export interface ProgramBase {
  degree_title: string;
  university_name: string;
  eligibility?: string;
  location?: string;
  duration?: string;
  fee?: number;
}

export interface ProgramCreate extends ProgramBase {}

export interface ProgramRead extends ProgramBase {
  id: number;
}

// Career types
export interface CareerBase {
  title: string;
  description?: string;
  required_skills?: string;
}

export interface CareerCreate extends CareerBase {}

export interface CareerRead extends CareerBase {
  id: number;
}

// Admission types
export interface AdmissionBase {
  student_id: number;
  program_id: number;
  status?: string;
}

export interface AdmissionCreate extends AdmissionBase {}

export interface AdmissionRead extends AdmissionBase {
  id: number;
  applied_at: string;
}

// Default export for module resolution
export default {
  UserLogin,
  Token,
  TokenData,
  StudentBase,
  StudentCreate,
  StudentRead,
  ProgramBase,
  ProgramCreate,
  ProgramRead,
  CareerBase,
  CareerCreate,
  CareerRead,
  AdmissionBase,
  AdmissionCreate,
  AdmissionRead,
}; 