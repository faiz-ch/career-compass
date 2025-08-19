import React, { useState, useEffect } from 'react';
import { aiAPI } from '../services/api';

interface InterviewResult {
  id: number;
  student_id: number;
  technical_skills: string[];
  soft_skills: string[];
  learning_style: string;
  career_interests: string[];
  confidence_level: string;
  created_at: string;
  updated_at: string;
}

interface AIResultsProps {
  onError?: (error: string | null) => void;
  compact?: boolean;
}

const AIResults: React.FC<AIResultsProps> = ({ onError, compact = false }) => {
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await aiAPI.getInterviewResult();
      setResult(data);
      onError?.(null);
    } catch (err: any) {
      // Check if it's a 404 or similar "not found" error - this is expected when user hasn't taken interview
      if (err.message?.includes('404') || err.response?.status === 404 || err.status === 404) {
        setResult(null); // No results found, but not an error
        setError(null);
        onError?.(null);
      } else {
        // Actual error occurred
        const errorMsg = 'Failed to load interview results';
        setError(errorMsg);
        onError?.(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="cyber-card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-cyber-500/20 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-cyber-500/20 rounded"></div>
            <div className="h-4 bg-cyber-500/20 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cyber-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">AI Interview Results</h2>
          <div className="w-8 h-8 bg-cyber-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-cyber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchResults}
            className="cyber-button px-4 py-2 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    // Show message to take AI interview when no results found
    return (
      <div className="cyber-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyber-500 to-cyber-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Interview Results</h2>
              <p className="text-xs text-dark-400">Discover your career profile</p>
            </div>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-cyber-500/20 to-cyber-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-cyber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Complete Your AI Interview</h3>
          <p className="text-dark-300 text-lg mb-6 max-w-md mx-auto">
            Take our AI-powered career assessment to unlock personalized insights about your skills, interests, and career matches.
          </p>
          <div className="bg-gradient-to-r from-cyber-600/20 to-cyber-500/20 border border-cyber-500/30 rounded-xl p-6 mb-6 max-w-lg mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-cyber-500/30 rounded-lg flex items-center justify-center">
                <span className="text-cyber-300 font-bold text-sm">1</span>
              </div>
              <div className="w-8 h-8 bg-cyber-500/30 rounded-lg flex items-center justify-center">
                <span className="text-cyber-300 font-bold text-sm">2</span>
              </div>
              <div className="w-8 h-8 bg-cyber-500/30 rounded-lg flex items-center justify-center">
                <span className="text-cyber-300 font-bold text-sm">3</span>
              </div>
            </div>
            <p className="text-dark-400 text-sm">
              <span className="text-cyber-400 font-medium">Quick & Easy:</span> Answer a few questions about your interests and skills to get started
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/ai-interview'}
            className="cyber-button px-8 py-4 text-lg font-medium inline-flex items-center space-x-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Start AI Interview</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyber-500 to-cyber-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Interview Results</h2>
            <p className="text-xs text-dark-400">Your personalized career profile</p>
          </div>
        </div>
        <span className="text-xs text-dark-400">
          Updated: {new Date(result.updated_at).toLocaleDateString()}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-dark-800/50 border border-cyber-500/20 rounded-lg p-4 hover:border-cyber-400/40 transition-all duration-300">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-blue-400">Technical Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.technical_skills.map((skill, index) => (
              <span key={index} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm border border-blue-500/30">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-dark-800/50 border border-cyber-500/20 rounded-lg p-4 hover:border-cyber-400/40 transition-all duration-300">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-green-400">Soft Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.soft_skills.map((skill, index) => (
              <span key={index} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm border border-green-500/30">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-dark-800/50 border border-cyber-500/20 rounded-lg p-4 hover:border-cyber-400/40 transition-all duration-300">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-purple-400">Learning Style</h3>
          </div>
          <p className="text-dark-300 text-sm font-medium bg-purple-500/10 px-3 py-2 rounded border border-purple-500/20">{result.learning_style}</p>
        </div>

        <div className="bg-dark-800/50 border border-cyber-500/20 rounded-lg p-4 hover:border-cyber-400/40 transition-all duration-300">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-orange-400">Career Interests</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.career_interests.map((interest, index) => (
              <span key={index} className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs border border-orange-500/30">
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-dark-800/50 border border-cyber-500/20 rounded-lg p-4 hover:border-cyber-400/40 transition-all duration-300">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-indigo-400">Confidence Level</h3>
          </div>
          <div className={`inline-block px-3 py-2 rounded-lg text-sm font-medium border ${
            result.confidence_level === 'high' 
              ? 'bg-green-500/20 text-green-300 border-green-500/30'
              : result.confidence_level === 'medium'
              ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
              : 'bg-red-500/20 text-red-300 border-red-500/30'
          }`}>
            {result.confidence_level.charAt(0).toUpperCase() + result.confidence_level.slice(1)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIResults;