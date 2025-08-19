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
