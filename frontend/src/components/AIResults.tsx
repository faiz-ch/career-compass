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

const AIResults: React.FC = () => {
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
    } catch (err: any) {
      if (err.message?.includes('404')) {
        setError('No interview results found. Take the AI interview to see your results here.');
      } else {
        setError('Failed to load interview results');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Interview Results</h2>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchResults}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">AI Interview Results</h2>
        <span className="text-sm text-gray-500">
          Last updated: {new Date(result.updated_at).toLocaleDateString()}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Technical Skills</h3>
          <div className="space-y-2">
            {result.technical_skills.map((skill, index) => (
              <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm">
                {skill}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-3">Soft Skills</h3>
          <div className="space-y-2">
            {result.soft_skills.map((skill, index) => (
              <div key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm">
                {skill}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-purple-800 mb-2">Learning Style</h3>
          <p className="text-purple-700 text-sm">{result.learning_style}</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-orange-800 mb-2">Career Interests</h3>
          <div className="space-y-1">
            {result.career_interests.map((interest, index) => (
              <div key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                {interest}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-indigo-800 mb-2">Confidence Level</h3>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            result.confidence_level === 'high' 
              ? 'bg-green-100 text-green-800'
              : result.confidence_level === 'medium'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {result.confidence_level.charAt(0).toUpperCase() + result.confidence_level.slice(1)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIResults;