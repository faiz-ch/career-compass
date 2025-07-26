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