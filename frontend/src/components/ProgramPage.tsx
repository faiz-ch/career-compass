import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { programsAPI } from '../services/api';

interface University {
  name: string;
  link: string;
  icon?: string;
  location?: string;
}

interface ProgramResponse {
  name: string;
  data: { universities: University[] };
}

const ProgramPage: React.FC = () => {
  const { name = '' } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [program, setProgram] = useState<ProgramResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await programsAPI.getByName(name);
        setProgram(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load program');
      } finally {
        setIsLoading(false);
      }
    };

    if (name) fetchProgram();
  }, [name]);

  return (
    <div className="min-h-screen bg-dark-950 w-full">
      <header className="bg-dark-900/50 border-b border-cyber-500/20">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 bg-dark-800/50 hover:bg-dark-700 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-dark-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-display font-bold neon-text">{decodeURIComponent(name)}</h1>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && (
          <div className="cyber-card p-8 text-center">Loading program...</div>
        )}

        {error && (
          <div className="cyber-card p-8 text-center text-red-400">{error}</div>
        )}

        {!isLoading && !error && program && (
          <div className="cyber-card p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Universities offering {program.name}</h2>
            {(!program.data?.universities || program.data.universities.length === 0) && (
              <p className="text-dark-300">No universities found for this program.</p>
            )}
            <div className="grid gap-4">
              {program.data?.universities?.map((u, idx) => (
                <a
                  key={idx}
                  href={u.link}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-dark-800/50 border border-cyber-500/20 rounded-lg p-5 hover:border-cyber-400/40 transition-all duration-300 flex items-center space-x-4"
                >
                  {u.icon && (
                    <img src={u.icon} alt={u.name} className="w-12 h-12 object-contain rounded" />
                  )}
                  <div className="flex-1">
                    <div className="text-white font-semibold">{u.name}</div>
                    {u.location && <div className="text-dark-400 text-sm">{u.location}</div>}
                    <div className="text-cyber-400 text-xs mt-1">{u.link}</div>
                  </div>
                  <svg className="w-5 h-5 text-cyber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProgramPage;


