import React from 'react';

import { Program } from '../types/models';

interface ProgramWithId extends Program {
  id?: number; // Optional for compatibility
}

interface ProgramsModalProps {
  isOpen: boolean;
  onClose: () => void;
  programs: Program[];
  careerName: string;
  isLoading: boolean;
  error?: string;
}

const ProgramsModal: React.FC<ProgramsModalProps> = ({
  isOpen,
  onClose,
  programs,
  careerName,
  isLoading,
  error
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="cyber-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cyber-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyber-500 to-cyber-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Programs for {careerName}</h2>
              <p className="text-xs text-dark-400">Available educational programs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-dark-800/50 hover:bg-dark-700 rounded-lg flex items-center justify-center transition-colors duration-200"
          >
            <svg className="w-5 h-5 text-dark-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyber-500 to-cyber-600 rounded-2xl mb-4 animate-pulse">
                <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-white font-medium">Loading programs...</p>
              <p className="text-dark-400 text-sm mt-1">Finding programs for {careerName}</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-400 font-medium mb-2">Error Loading Programs</p>
              <p className="text-dark-400 text-sm">{error}</p>
            </div>
          )}

          {!isLoading && !error && programs.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-cyber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-cyber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-dark-400 font-medium mb-2">No Programs Found</p>
              <p className="text-dark-500 text-sm">No programs are currently associated with {careerName}</p>
            </div>
          )}

          {!isLoading && !error && programs.length > 0 && (
            <div className="grid gap-4">
              {programs.map((program, index) => (
                <div
                  key={index}
                  className="bg-dark-800/50 border border-cyber-500/20 rounded-lg p-5 hover:border-cyber-400/40 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white mb-2">{program.title}</h3>
                    <div className="flex items-center space-x-2">
                      {program.duration && (
                        <span className="bg-cyber-500/20 text-cyber-300 px-2 py-1 rounded text-xs border border-cyber-500/30">
                          {program.duration}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {program.eligibility && (
                    <div className="bg-dark-900/50 rounded-lg p-3 border border-dark-700/50">
                      <h4 className="text-sm font-medium text-cyber-400 mb-1">Eligibility</h4>
                      <p className="text-dark-300 text-sm">{program.eligibility}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgramsModal;
