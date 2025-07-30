import React, { useState } from 'react';
import { aiAPI } from '../services/api';

interface DynamicQuestion {
  question: string;
  reasoning: string;
  focus_area: string;
  is_final_question: boolean;
}

interface SkillAnalysis {
  technical_skills: string[];
  soft_skills: string[];
  learning_style: string;
  career_interests: string[];
  confidence_level: string;
}

const AIInterview: React.FC = () => {
  const [interests, setInterests] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<DynamicQuestion | null>(null);
  const [currentResponse, setCurrentResponse] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [responses, setResponses] = useState<string[]>([]);
  const [skillAnalysis, setSkillAnalysis] = useState<SkillAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'interests' | 'interview' | 'analysis'>('interests');

  const startInterview = async () => {
    if (!interests.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await aiAPI.startDynamicInterview({ interests });
      setCurrentQuestion(result);
      setCurrentStep('interview');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to start interview. Please try again.';
      setError(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const submitResponse = async () => {
    if (!currentResponse.trim() || !currentQuestion) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Add current Q&A to history
      const newQuestions = [...questions, currentQuestion.question];
      const newResponses = [...responses, currentResponse];
      
      setQuestions(newQuestions);
      setResponses(newResponses);
      
      if (currentQuestion.is_final_question) {
        // Analyze the complete interview
        const analysis = await aiAPI.analyzeInterviewResponses({
          interests,
          responses: newResponses
        });
        setSkillAnalysis(analysis);
        setCurrentStep('analysis');
      } else {
        // Get next dynamic question
        const nextQuestion = await aiAPI.getNextDynamicQuestion({
          interests,
          previous_questions: newQuestions,
          previous_responses: newResponses,
          current_question_number: newQuestions.length + 1
        });
        
        setCurrentQuestion(nextQuestion);
        setCurrentResponse('');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to process response. Please try again.';
      setError(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetInterview = () => {
    setInterests('');
    setCurrentQuestion(null);
    setCurrentResponse('');
    setQuestions([]);
    setResponses([]);
    setSkillAnalysis(null);
    setError(null);
    setCurrentStep('interests');
  };

  if (currentStep === 'interests') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-2xl w-full mx-4">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Dynamic AI Interview</h1>
              <p className="text-gray-600">Tell us about your interests and we'll have a personalized conversation</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">
                  What are your interests and career goals?
                </label>
                <textarea
                  id="interests"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g., I'm interested in technology, programming, and building software solutions..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-red-800 mb-2">Error Details:</h3>
                  <p className="text-red-600 text-sm whitespace-pre-wrap">{error}</p>
                  <p className="text-xs text-red-500 mt-2">
                    This might be due to API rate limits. Please try again later or check your API key configuration.
                  </p>
                </div>
              )}
              
              <button
                onClick={startInterview}
                disabled={isLoading || !interests.trim()}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Starting Interview...' : 'Start Dynamic Interview'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'interview' && currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl w-full mx-4">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Dynamic AI Interview</h1>
                <span className="text-sm text-gray-500">
                  Question {questions.length + 1}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((questions.length + 1) / 8) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-blue-800 mb-2">Current Question</h2>
                <p className="text-blue-700">{currentQuestion.question}</p>
                <div className="mt-3 text-sm text-blue-600">
                  <p><strong>Focus:</strong> {currentQuestion.focus_area}</p>
                  <p><strong>Reasoning:</strong> {currentQuestion.reasoning}</p>
                </div>
              </div>
              
              <div>
                <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Response
                </label>
                <textarea
                  id="response"
                  value={currentResponse}
                  onChange={(e) => setCurrentResponse(e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">{error}</p>
                </div>
              )}
              
              <div className="flex justify-between">
                <button
                  onClick={resetInterview}
                  className="bg-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-400"
                >
                  Start Over
                </button>
                <button
                  onClick={submitResponse}
                  disabled={isLoading || !currentResponse.trim()}
                  className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading 
                    ? (currentQuestion.is_final_question ? 'Analyzing...' : 'Processing...')
                    : (currentQuestion.is_final_question ? 'Finish Interview' : 'Continue')
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'analysis' && skillAnalysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl w-full mx-4">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Interview Analysis Complete!</h1>
              <p className="text-gray-600">Here's what we discovered about your skills and interests</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-blue-800 mb-4">Technical Skills</h2>
                <div className="space-y-2">
                  {skillAnalysis.technical_skills.map((skill, index) => (
                    <div key={index} className="bg-blue-100 text-blue-800 px-3 py-2 rounded-md">
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-green-800 mb-4">Soft Skills</h2>
                <div className="space-y-2">
                  {skillAnalysis.soft_skills.map((skill, index) => (
                    <div key={index} className="bg-green-100 text-green-800 px-3 py-2 rounded-md">
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-purple-800 mb-2">Learning Style</h2>
                <p className="text-purple-700">{skillAnalysis.learning_style}</p>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-orange-800 mb-2">Career Interests</h2>
                <div className="space-y-1">
                  {skillAnalysis.career_interests.map((interest, index) => (
                    <div key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                      {interest}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-indigo-800 mb-2">Confidence Level</h2>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  skillAnalysis.confidence_level === 'high' 
                    ? 'bg-green-100 text-green-800'
                    : skillAnalysis.confidence_level === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {skillAnalysis.confidence_level.charAt(0).toUpperCase() + skillAnalysis.confidence_level.slice(1)}
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={resetInterview}
                className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700"
              >
                Start New Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AIInterview; 