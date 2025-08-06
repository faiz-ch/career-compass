import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';

interface DashboardData {
  careers: any[];
  programs: any[];
  admissions: any[];
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData>({ careers: [], programs: [], admissions: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [careers, programs, admissions] = await Promise.all([
        dashboardAPI.getCareers(),
        dashboardAPI.getPrograms(),
        dashboardAPI.getAdmissions(),
      ]);
      setData({ careers, programs, admissions });
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAIInterview = () => {
    navigate('/ai-interview');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyber-500 to-cyber-600 rounded-2xl shadow-cyber-lg mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Loading Dashboard</h2>
          <p className="text-dark-400">Preparing your career insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 relative overflow-hidden w-full">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-cyber-500/5 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-cyber-400/8 rounded-full blur-lg animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-1/3 w-20 h-20 bg-cyber-600/10 rounded-full blur-md animate-float" style={{ animationDelay: '4s' }}></div>
        
        {/* Cyber Grid Lines */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyber-500 to-transparent animate-pulse"></div>
          <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-cyber-500 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-dark-900/50 backdrop-blur-sm border-b border-cyber-500/20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyber-500 to-cyber-600 rounded-xl shadow-cyber transform-3d hover:rotate-y-12 transition-transform duration-500">
                <svg className="w-6 h-6 text-white m-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-display font-bold neon-text">Career Compass</h1>
                <p className="text-xs text-dark-400">AI-Powered Career Guidance</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">Welcome back,</p>
                <p className="text-xs text-dark-400">{user?.name || 'Student'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="cyber-button px-4 py-2 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="cyber-card p-8 mb-8 transform-3d hover:rotate-x-12 transition-all duration-500">
          <div className="text-center">
            <h2 className="text-3xl font-display font-bold neon-text mb-4">Your Career Dashboard</h2>
            <p className="text-dark-400 mb-6 max-w-2xl mx-auto">
              Discover your potential with AI-powered career insights, program recommendations, and personalized guidance.
            </p>
            
            {/* AI Interview CTA */}
            <div className="bg-gradient-to-r from-cyber-600/20 to-cyber-500/20 border border-cyber-500/30 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white mb-2">Ready to Discover Your Path?</h3>
                  <p className="text-dark-300 text-sm">
                    Take our AI-powered interview to get personalized career recommendations
                  </p>
                </div>
                <button
                  onClick={handleAIInterview}
                  className="cyber-button px-6 py-3 text-sm whitespace-nowrap"
                >
                  Start AI Interview
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-8">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Careers Card */}
          <div className="cyber-card p-6 transform-3d hover:rotate-y-12 transition-all duration-500">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyber-500 to-cyber-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-cyber-400">{data.careers.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Recommended Careers</h3>
            <p className="text-dark-400 text-sm">AI-curated career paths based on your profile</p>
          </div>

          {/* Programs Card */}
          <div className="cyber-card p-6 transform-3d hover:rotate-y-12 transition-all duration-500">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyber-500 to-cyber-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-cyber-400">{data.programs.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">University Programs</h3>
            <p className="text-dark-400 text-sm">Matching academic programs and courses</p>
          </div>

          {/* Admissions Card */}
          <div className="cyber-card p-6 transform-3d hover:rotate-y-12 transition-all duration-500">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyber-500 to-cyber-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-cyber-400">{data.admissions.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Applications</h3>
            <p className="text-dark-400 text-sm">Your program applications and status</p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Careers */}
          <div className="cyber-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Recent Career Recommendations</h3>
              <div className="w-8 h-8 bg-cyber-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-cyber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
            </div>
            
            {data.careers.length > 0 ? (
              <div className="space-y-4">
                {data.careers.slice(0, 3).map((career, index) => (
                  <div key={index} className="bg-dark-800/50 border border-cyber-500/20 rounded-lg p-4 hover:border-cyber-400/40 transition-all duration-300">
                    <h4 className="font-semibold text-white mb-1">{career.title}</h4>
                    <p className="text-dark-400 text-sm">{career.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-cyber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-cyber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
                <p className="text-dark-400 text-sm">No career recommendations yet</p>
                <p className="text-dark-500 text-xs mt-1">Complete the AI interview to get personalized recommendations</p>
              </div>
            )}
          </div>

          {/* Recent Programs */}
          <div className="cyber-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Recommended Programs</h3>
              <div className="w-8 h-8 bg-cyber-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-cyber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            
            {data.programs.length > 0 ? (
              <div className="space-y-4">
                {data.programs.slice(0, 3).map((program, index) => (
                  <div key={index} className="bg-dark-800/50 border border-cyber-500/20 rounded-lg p-4 hover:border-cyber-400/40 transition-all duration-300">
                    <h4 className="font-semibold text-white mb-1">{program.degree_title}</h4>
                    <p className="text-cyber-400 text-sm mb-1">{program.university_name}</p>
                    <p className="text-dark-400 text-xs">{program.location}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-cyber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-cyber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-dark-400 text-sm">No program recommendations yet</p>
                <p className="text-dark-500 text-xs mt-1">Complete the AI interview to get program matches</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 
