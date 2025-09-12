import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import type { UserLogin, StudentCreate, StudentRead } from '../types/auth';

interface AuthContextType {
  user: StudentRead | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: UserLogin) => Promise<void>;
  register: (studentData: StudentCreate) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<StudentRead | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // Try to fetch user profile with existing token
          const userProfile = await authAPI.getCurrentUser();
          setUser(userProfile);
        } catch (error) {
          console.error('Token validation failed:', error);
          // Token is invalid, remove it
          localStorage.removeItem('access_token');
        }
      }
      setIsLoading(false);
    };
    
    initializeAuth();
  }, []);

  const login = async (credentials: UserLogin) => {
    try {
      const response = await authAPI.login(credentials);
      localStorage.setItem('access_token', response.access_token);
      
      // Fetch user profile from the backend
      try {
        const userProfile = await authAPI.getCurrentUser();
        setUser(userProfile);
      } catch (profileError) {
        console.error('Failed to fetch user profile:', profileError);
        // Set a basic user object if profile fetch fails
        setUser({
          id: 1,
          first_name: '',
          last_name: '',
          email: credentials.email,
          created_at: new Date().toISOString(),
          roll_number: undefined
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (studentData: StudentCreate) => {
    try {
      await authAPI.register(studentData);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 