import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentsAPI, careersAPI, programsAPI, admissionsAPI } from '../services/api';

interface Student {
  id: number;
  name: string;
  email: string;
  roll_number: string;
  hobbies: string;
  interests: string;
}

interface Career {
  id: number;
  title: string;
  description: string;
  required_skills: string;
}

interface Program {
  id: number;
  degree_title: string;
  university_name: string;
  eligibility: string;
  location: string;
  duration: string;
  fee: string;
}

interface Admission {
  id: number;
  student_id: number;
  program_id: number;
  status: string;
  applied_at: string;
  program?: Program;
}

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [careers, setCareers] = useState<Career[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [studentData, careersData, programsData, admissionsData] = await Promise.all([
        studentsAPI.getMyProfile(),
        careersAPI.list(),
        programsAPI.list(),
        admissionsAPI.getMyAdmissions()
      ]);

      setStudent(studentData);
      setCareers(careersData);
      setPrograms(programsData);
      setAdmissions(admissionsData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Career Compass</h1>
              <p className="text-sm text-gray-600">Welcome back, {student?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/ai-interview')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                AI Interview
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Interview Call-to-Action */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 mb-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Discover Your Career Path?</h2>
            <p className="text-xl mb-6">Take our AI-powered interview to get personalized career insights</p>
            <button
              onClick={() => navigate('/ai-interview')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start AI Interview
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Student Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Name:</span>
                <p className="text-gray-900">{student?.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <p className="text-gray-900">{student?.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Roll Number:</span>
                <p className="text-gray-900">{student?.roll_number}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Hobbies:</span>
                <p className="text-gray-900">{student?.hobbies || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Interests:</span>
                <p className="text-gray-900">{student?.interests || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Available Careers */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Careers</h2>
            <div className="space-y-4">
              {careers.length > 0 ? (
                careers.map((career) => (
                  <div key={career.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900">{career.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{career.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      <strong>Required Skills:</strong> {career.required_skills}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No careers available</p>
              )}
            </div>
          </div>

          {/* Available Programs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Programs</h2>
            <div className="space-y-4">
              {programs.length > 0 ? (
                programs.map((program) => (
                  <div key={program.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900">{program.degree_title}</h3>
                    <p className="text-sm text-gray-600">{program.university_name}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      <p><strong>Eligibility:</strong> {program.eligibility}</p>
                      <p><strong>Location:</strong> {program.location}</p>
                      <p><strong>Duration:</strong> {program.duration}</p>
                      <p><strong>Fee:</strong> {program.fee}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No programs available</p>
              )}
            </div>
          </div>

          {/* My Admissions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Admissions</h2>
            <div className="space-y-4">
              {admissions.length > 0 ? (
                admissions.map((admission) => (
                  <div key={admission.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {admission.program?.degree_title || 'Program'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {admission.program?.university_name || 'University'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        admission.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        admission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {admission.status.charAt(0).toUpperCase() + admission.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Applied: {new Date(admission.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No admissions yet</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 