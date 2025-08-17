import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { StudentCreate } from '../types/auth';

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<StudentCreate>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await register(formData);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-cyber-500/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-cyber-400/15 rounded-full blur-lg animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-1/3 w-20 h-20 bg-cyber-600/20 rounded-full blur-md animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-cyber-300/25 rounded-full blur-sm animate-float" style={{ animationDelay: '6s' }}></div>
        
        {/* Cyber Grid Lines */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyber-500 to-transparent animate-pulse"></div>
          <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-cyber-500 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyber-400 to-transparent animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyber-500 to-cyber-600 rounded-2xl shadow-cyber-lg mb-4 transform-3d hover:rotate-y-12 transition-transform duration-500">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-4xl font-display font-bold neon-text mb-2">Career Compass</h1>
          <p className="text-dark-400 text-sm">Navigate Your Future with AI</p>
        </div>

        {/* Register Card */}
        <div className="cyber-card p-8 transform-3d hover:rotate-x-12 transition-all duration-500 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Join the Future</h2>
            <p className="text-dark-400">Create your account and start your AI-powered career journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name Input */}
              <div className="space-y-2">
                <label htmlFor="first_name" className="block text-sm font-medium text-dark-300">
                  First Name
                </label>
                <div className="relative group">
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="cyber-input w-full group-hover:border-cyber-400 group-hover:shadow-cyber transition-all duration-300"
                    placeholder="Enter your first name"
                    required
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyber-500/0 to-cyber-500/0 group-hover:from-cyber-500/10 group-hover:to-cyber-500/10 transition-all duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Last Name Input */}
              <div className="space-y-2">
                <label htmlFor="last_name" className="block text-sm font-medium text-dark-300">
                  Last Name
                </label>
                <div className="relative group">
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="cyber-input w-full group-hover:border-cyber-400 group-hover:shadow-cyber transition-all duration-300"
                    placeholder="Enter your last name"
                    required
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyber-500/0 to-cyber-500/0 group-hover:from-cyber-500/10 group-hover:to-cyber-500/10 transition-all duration-300 pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-dark-300">
                Email Address
              </label>
              <div className="relative group">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="cyber-input w-full group-hover:border-cyber-400 group-hover:shadow-cyber transition-all duration-300"
                  placeholder="Enter your email address"
                  required
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyber-500/0 to-cyber-500/0 group-hover:from-cyber-500/10 group-hover:to-cyber-500/10 transition-all duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-dark-300">
                Password
              </label>
              <div className="relative group">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="cyber-input w-full group-hover:border-cyber-400 group-hover:shadow-cyber transition-all duration-300"
                  placeholder="Create a strong password"
                  required
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyber-500/0 to-cyber-500/0 group-hover:from-cyber-500/10 group-hover:to-cyber-500/10 transition-all duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="cyber-button w-full relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyber-500/0 via-cyber-400/20 to-cyber-500/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-dark-800 text-dark-400">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <a
              href="/login"
              className="inline-flex items-center text-cyber-400 hover:text-cyber-300 transition-colors duration-300 group"
            >
              <span className="mr-2">Sign in to your account</span>
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-dark-500 text-xs">
            © 2024 Career Compass. Powered by AI.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm; 