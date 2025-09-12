import React from 'react';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
  success?: string | null;
}

const ApplyModal: React.FC<ApplyModalProps> = ({ isOpen, onClose, onApply, loading = false, error = null, success = null }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-lg mx-4">
        <div className="bg-dark-900 border border-cyber-500/30 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-cyber-500/20">
            <h3 className="text-lg font-semibold text-white">Apply to a University</h3>
            <button onClick={onClose} className="text-dark-300 hover:text-white transition">✕</button>
          </div>

          {/* Status messages */}
          {(error || success) && (
            <div className="px-5 pt-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg p-3 mb-3">{error}</div>
              )}
              {success && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-300 text-sm rounded-lg p-3 mb-3">{success}</div>
              )}
            </div>
          )}

          <div className="p-5">
            {/* Hard-coded University Card */}
            <div className="bg-dark-800/50 border border-cyber-500/20 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyber-500 to-cyber-600 rounded-lg flex items-center justify-center text-white font-bold">
                  U
                </div>
                <div>
                  <h4 className="text-white font-medium">Universal Tech University</h4>
                  <p className="text-xs text-dark-300">Top-ranked CS & AI programs</p>
                </div>
              </div>
              <button
                onClick={onApply}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${loading ? 'bg-dark-700 text-dark-300 cursor-not-allowed' : 'bg-cyber-500 hover:bg-cyber-600 text-white'}`}
              >
                {loading ? 'Applying...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyModal; 