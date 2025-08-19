import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, aiAPI, careersAPI } from '../services/api';
import AIResults from './AIResults';
import ProgramsModal from './ProgramsModal';

interface DashboardData {
  careers: any[];
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData>({ careers: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Programs modal state
  const [programsModal, setProgramsModal] = useState({
    isOpen: false,
    programs: [],
    careerName: '',
    isLoading: false,
    error: ''
  });


  useEffect(() => {
    fetchDashboardData();
    // Listen for career recommendations update
    const handleFocus = () => {
      fetchDashboardData();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors
      const careers = await dashboardAPI.getCareers(); // This gets user's recommended careers from AI interview
      setData({ careers });
    } catch (err: any) {
      console.error('Dashboard data fetch error:', err);
      // Check if it's an authentication error
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        // Token might be expired, redirect to login
        logout();
        navigate('/login');
        return;
      }
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

  const handleApplicationForm = () => {
    navigate('/application');
  };


  // Handle getting programs for a career
  const handleGetPrograms = (career: any) => {
    // Convert program strings to Program objects for modal compatibility
    const programObjects = (career.programs || []).map((title: string) => ({ title }));
    setProgramsModal({
      isOpen: true,
      programs: programObjects,
      careerName: career.title,
      isLoading: false,
      error: ''
    });
  };

  // Close programs modal
  const closeModal = () => {
    setProgramsModal({
      isOpen: false,
      programs: [],
      careerName: '',
      isLoading: false,
      error: ''
    });
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
                <p className="text-xs text-dark-400">{user?.first_name ? `${user.first_name} ${user.last_name}` : user?.email || 'Student'}</p>
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

            {/* Application Form CTA */}
            <div className="bg-gradient-to-r from-green-600/20 to-green-500/20 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white mb-2">Apply to Universities</h3>
                  <p className="text-dark-300 text-sm">
                    Complete your comprehensive application form with auto-fill from result data
                  </p>
                </div>
                <button
                  onClick={handleApplicationForm}
                  className="bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-3 rounded-lg text-sm whitespace-nowrap transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Fill Application
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

          {/* Interview Results Card */}
          <div className="cyber-card p-6 transform-3d hover:rotate-y-12 transition-all duration-500">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyber-500 to-cyber-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-cyber-400">AI</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Interview Analysis</h3>
            <p className="text-dark-400 text-sm">Your AI-powered career assessment</p>
          </div>

          {/* Total Programs Card */}
          <div className="cyber-card p-6 transform-3d hover:rotate-y-12 transition-all duration-500">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyber-500 to-cyber-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-cyber-400">
                {data.careers.reduce((total, career) => total + (Array.isArray(career.programs) ? career.programs.length : 0), 0)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Available Programs</h3>
            <p className="text-dark-400 text-sm">Total programs across all careers</p>
          </div>
        </div>

        {/* AI Interview Results Section */}
        <div className="mb-8">
          <AIResults />
        </div>

        {/* Career Recommendations Section */}
        <div className="cyber-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyber-500 to-cyber-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Career Recommendations</h3>
                <p className="text-xs text-dark-400">AI-generated recommendations based on your interview</p>
              </div>
            </div>
          </div>
          
          {/* Success Message */}
          {data.careers.length > 0 && (
            <div className="bg-gradient-to-r from-green-600/20 to-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-300 text-sm font-medium">
                  ✓ {data.careers.length} personalized career recommendations generated by AI!
                </p>
              </div>
            </div>
          )}
          
          {data.careers.length > 0 ? (
            <div className="grid gap-4">
              {data.careers.map((career, index) => (
                <div key={index} className="bg-dark-800/50 border border-cyber-500/20 rounded-lg p-5 hover:border-cyber-400/40 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-2">{career.title}</h4>
                      <p className="text-dark-400 text-sm mb-4">{career.description}</p>
                      {career.required_skills && (
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-cyber-400 mb-2">Required Skills:</h5>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(career.required_skills) 
                              ? career.required_skills.map((skill: string, idx: number) => (
                                  <span key={idx} className="bg-cyber-500/20 text-cyber-300 px-2 py-1 rounded text-xs border border-cyber-500/30">
                                    {skill}
                                  </span>
                                ))
                              : <p className="text-dark-300 text-sm">{career.required_skills}</p>
                            }
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleGetPrograms(career)}
                      className="ml-4 bg-gradient-to-r from-cyber-500 to-cyber-600 hover:from-cyber-600 hover:to-cyber-700 text-white font-medium px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>Get Programs</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-cyber-500/20 to-cyber-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-cyber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-white mb-3">No Career Recommendations Yet</h4>
              <p className="text-dark-300 mb-4 max-w-sm mx-auto">
                Complete the AI interview and click "Find Careers" to receive personalized career recommendations based on your skills and interests.
              </p>
              <button
                onClick={handleAIInterview}
                className="cyber-button px-6 py-3 text-sm inline-flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Take AI Interview</span>
              </button>
            </div>
          )}
        </div>

      </main>

      {/* Programs Modal */}
      <ProgramsModal
        isOpen={programsModal.isOpen}
        onClose={closeModal}
        programs={programsModal.programs}
        careerName={programsModal.careerName}
        isLoading={programsModal.isLoading}
        error={programsModal.error}
      />

    </div>
  );
};

export default Dashboard; 
