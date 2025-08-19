import React, { useState } from 'react';
import { aiAPI } from '../services/api';

interface DynamicQuestion {
  question: string;
  is_final_question: boolean;
}

interface SkillAnalysis {
  technical_skills: string[];
  soft_skills: string[];
  learning_style: string;
  career_interests: string[];
  confidence_level: string;
}

interface CareerRecommendation {
  title: string;
  description: string;
  match_reason: string;
  confidence_score: number;
  required_skills: string[];
  learning_path: string;
}

const AIInterview: React.FC = () => {
  const [interests, setInterests] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<DynamicQuestion | null>(null);
  const [currentResponse, setCurrentResponse] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [responses, setResponses] = useState<string[]>([]);
  const [skillAnalysis, setSkillAnalysis] = useState<SkillAnalysis | null>(null);
  const [careerRecommendations, setCareerRecommendations] = useState<CareerRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingCareers, setIsSearchingCareers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'interests' | 'interview' | 'analysis' | 'careers'>('interests');

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
      const newQuestions = [...questions, currentQuestion.question];
      const newResponses = [...responses, currentResponse];
      
      setQuestions(newQuestions);
      setResponses(newResponses);
      
      if (currentQuestion.is_final_question) {
        const analysis = await aiAPI.analyzeInterviewResponses({
          interests,
          responses: newResponses
        });
        setSkillAnalysis(analysis);
        setCurrentStep('analysis');
      } else {
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

  const findCareers = async () => {
    if (!skillAnalysis) return;
    
    setIsSearchingCareers(true);
    setError(null);
    
    try {
      const recommendations = await aiAPI.getCareerRecommendations({
        interview_analysis: skillAnalysis
      });
      setCareerRecommendations(recommendations.recommended_careers);
      setCurrentStep('careers');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to find careers. Please try again.';
      setError(`Error: ${errorMessage}`);
    } finally {
      setIsSearchingCareers(false);
    }
  };

  const resetInterview = () => {
    setInterests('');
    setCurrentQuestion(null);
    setCurrentResponse('');
    setQuestions([]);
    setResponses([]);
    setSkillAnalysis(null);
    setCareerRecommendations([]);
    setError(null);
    setIsSearchingCareers(false);
    setCurrentStep('interests');
  };

  return (
    <div className="min-h-screen bg-dark-950 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs with Enhanced Effects */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-cyber-500/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-cyber-400/15 rounded-full blur-lg animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-1/3 w-20 h-20 bg-cyber-600/20 rounded-full blur-md animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-cyber-300/25 rounded-full blur-sm animate-float" style={{ animationDelay: '6s' }}></div>
        
        {/* Cyber Grid with Enhanced Animation */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyber-500 to-transparent animate-pulse"></div>
          <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-cyber-500 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyber-400 to-transparent animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Particle Effects */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyber-400/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-dark-900/50 backdrop-blur-sm border-b border-cyber-500/20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyber-500 to-cyber-600 rounded-xl shadow-cyber transform-3d hover:rotate-y-12 transition-transform duration-500">
                <svg className="w-6 h-6 text-white m-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-display font-bold neon-text">AI Career Interview</h1>
                <p className="text-xs text-dark-400">Powered by Advanced AI</p>
              </div>
            </div>
            <button
              onClick={resetInterview}
              className="cyber-button px-4 py-2 text-sm"
            >
              New Interview
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-red-800 mb-2">Error Details:</h3>
            <p className="text-red-600 text-sm whitespace-pre-wrap">{error}</p>
            <p className="text-xs text-red-500 mt-2">
              This might be due to API rate limits. Please try again later or check your API key configuration.
            </p>
          </div>
        )}

        {/* Step 1: Interests Input */}
        {currentStep === 'interests' && (
          <div className="cyber-card p-8 transform-3d hover:rotate-x-12 transition-all duration-500">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyber-500 to-cyber-600 rounded-2xl shadow-cyber-lg mb-6 transform-3d hover:rotate-y-12 transition-transform duration-500">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-display font-bold neon-text mb-4">Tell Us About Yourself</h2>
              <p className="text-dark-400 text-lg">
                Share your interests, hobbies, and what excites you. This helps our AI tailor the perfect interview experience.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="relative group">
                <textarea
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g., I love coding, solving puzzles, working with data, helping people, creating art, building things, learning new technologies..."
                  className="cyber-input w-full h-32 group-hover:border-cyber-400 group-hover:shadow-cyber transition-all duration-300 resize-none"
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyber-500/0 to-cyber-500/0 group-hover:from-cyber-500/10 group-hover:to-cyber-500/10 transition-all duration-300 pointer-events-none"></div>
              </div>
              
              <button
                onClick={startInterview}
                disabled={isLoading || !interests.trim()}
                className="cyber-button w-full relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Starting AI Interview...
                    </>
                  ) : (
                    'Begin AI Interview'
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyber-500/0 via-cyber-400/20 to-cyber-500/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Dynamic Interview */}
        {currentStep === 'interview' && currentQuestion && (
          <div className="space-y-6">
            {/* Progress Header */}
            <div className="cyber-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-display font-bold neon-text">AI Interview in Progress</h2>
                <div className="text-sm text-cyber-400 font-mono">
                  Question {questions.length + 1} of ~8
                </div>
              </div>
              
              {/* Enhanced Progress Bar */}
              <div className="w-full bg-dark-700 rounded-full h-3 mb-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyber-500 to-cyber-400 h-3 rounded-full transition-all duration-1000 ease-out shadow-cyber"
                  style={{ width: `${((questions.length + 1) / 8) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-dark-400">
                <div className="w-2 h-2 bg-cyber-500 rounded-full animate-pulse"></div>
                <span>AI is analyzing your responses...</span>
              </div>
            </div>

            {/* Current Question Card */}
            <div className="cyber-card p-8 transform-3d hover:rotate-x-12 transition-all duration-500">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyber-500 to-cyber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Current Question</h3>
                  <p className="text-cyber-300 text-lg leading-relaxed">{currentQuestion.question}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="relative group">
                  <textarea
                    value={currentResponse}
                    onChange={(e) => setCurrentResponse(e.target.value)}
                    placeholder="Share your thoughts, experiences, and insights..."
                    className="cyber-input w-full h-32 group-hover:border-cyber-400 group-hover:shadow-cyber transition-all duration-300 resize-none"
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyber-500/0 to-cyber-500/0 group-hover:from-cyber-500/10 group-hover:to-cyber-500/10 transition-all duration-300 pointer-events-none"></div>
                </div>
                
                <button
                  onClick={submitResponse}
                  disabled={isLoading || !currentResponse.trim()}
                  className="cyber-button w-full relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Submit Answer'
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyber-500/0 via-cyber-400/20 to-cyber-500/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </button>
              </div>
            </div>

            {/* Previous Q&A History */}
            {questions.length > 0 && (
              <div className="cyber-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 text-cyber-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Interview History
                </h3>
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {questions.map((question, index) => (
                    <div key={index} className="bg-dark-800/50 border border-cyber-500/20 rounded-lg p-4 hover:border-cyber-400/40 transition-all duration-300">
                      <p className="font-medium text-cyber-300 mb-2">Q: {question}</p>
                      <p className="text-dark-300">A: {responses[index]}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Skill Analysis */}
        {currentStep === 'analysis' && skillAnalysis && (
          <div className="cyber-card p-8 transform-3d hover:rotate-x-12 transition-all duration-500">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyber-500 to-cyber-600 rounded-2xl shadow-cyber-lg mb-6 transform-3d hover:rotate-y-12 transition-transform duration-500">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-display font-bold neon-text mb-4">Your Skill Analysis</h2>
              <p className="text-dark-400 text-lg">
                Based on your interview responses, here's what we discovered about your unique profile.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6">
                <h3 className="font-semibold text-green-400 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Technical Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillAnalysis.technical_skills.map((skill, index) => (
                    <span key={index} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm border border-green-500/30">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
                <h3 className="font-semibold text-purple-400 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Soft Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillAnalysis.soft_skills.map((skill, index) => (
                    <span key={index} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-500/30">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
                <h3 className="font-semibold text-blue-400 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Learning Style
                </h3>
                <p className="text-blue-300">{skillAnalysis.learning_style}</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-6">
                <h3 className="font-semibold text-orange-400 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                  Career Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillAnalysis.career_interests.map((interest, index) => (
                    <span key={index} className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm border border-orange-500/30">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-yellow-400 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Confidence Level
              </h3>
              <p className="text-yellow-300 capitalize text-lg">{skillAnalysis.confidence_level}</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={findCareers}
                disabled={isSearchingCareers}
                className="cyber-button flex-1 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isSearchingCareers ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching Careers...
                    </>
                  ) : (
                    'Find Careers'
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyber-500/0 via-cyber-400/20 to-cyber-500/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
              <button
                onClick={resetInterview}
                className="cyber-button flex-1"
              >
                New Interview
              </button>
            </div>
          </div>
        )}

        {/* Career Search Loading Screen */}
        {isSearchingCareers && (
          <div className="cyber-card p-12 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cyber-500 to-cyber-600 rounded-3xl shadow-cyber-lg mb-6 animate-pulse">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-display font-bold neon-text mb-4">Finding Your Perfect Careers</h2>
            <p className="text-dark-400 text-lg mb-6">
              Our AI is analyzing your skills and interests to find the best career matches...
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-cyber-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-cyber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-cyber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <p className="text-sm text-dark-500">Searching vector database and analyzing matches...</p>
            </div>
          </div>
        )}

        {/* Step 4: Career Recommendations */}
        {currentStep === 'careers' && careerRecommendations.length > 0 && (
          <div className="cyber-card p-8 transform-3d hover:rotate-x-12 transition-all duration-500">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyber-500 to-cyber-600 rounded-2xl shadow-cyber-lg mb-6 transform-3d hover:rotate-y-12 transition-transform duration-500">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <h2 className="text-3xl font-display font-bold neon-text mb-4">Your Career Recommendations</h2>
              <p className="text-dark-400 text-lg mb-4">
                Based on your interview responses, here are the top 5 careers that match your unique profile.
              </p>
              <div className="bg-gradient-to-r from-green-600/20 to-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-300 text-sm font-medium">
                    ✓ Career recommendations saved! You can now view them on your dashboard.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6 mb-8">
              {careerRecommendations.map((career, index) => (
                <div key={index} className="bg-dark-800/50 border border-cyber-500/20 rounded-xl p-6 hover:border-cyber-400/40 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">{career.title}</h3>
                    <span className="bg-gradient-to-r from-cyber-500 to-cyber-400 text-white px-4 py-2 rounded-full text-sm font-bold shadow-cyber">
                      {Math.round(career.confidence_score * 100)}% Match
                    </span>
                  </div>
                  
                  <p className="text-dark-300 mb-4">{career.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-cyber-300 mb-2">Why this career matches you:</h4>
                    <p className="text-dark-400 text-sm">{career.match_reason}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-cyber-300 mb-2">Required Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {career.required_skills.map((skill, skillIndex) => (
                        <span key={skillIndex} className="bg-cyber-500/20 text-cyber-300 px-3 py-1 rounded-full text-xs border border-cyber-500/30">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-cyber-300 mb-2">Suggested Learning Path:</h4>
                    <p className="text-dark-400 text-sm">{career.learning_path}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="cyber-button flex-1 bg-green-500 hover:bg-green-600"
              >
                Go to Dashboard
              </button>
              <button
                onClick={resetInterview}
                className="cyber-button flex-1"
              >
                New Interview
              </button>
              <button
                onClick={() => setCurrentStep('analysis')}
                className="cyber-button flex-1"
              >
                View Analysis
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AIInterview; 
