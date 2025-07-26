import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentsAPI, careersAPI, programsAPI, admissionsAPI } from '../services/api';
import type { StudentRead } from '../types/auth';
import type { CareerRead, ProgramRead, AdmissionRead } from '../types/models';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [careers, setCareers] = useState<CareerRead[]>([]);
  const [programs, setPrograms] = useState<ProgramRead[]>([]);
  const [admissions, setAdmissions] = useState<AdmissionRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [careersData, programsData, admissionsData] = await Promise.all([
          careersAPI.list(),
          programsAPI.list(),
          admissionsAPI.getMyAdmissions(),
        ]);
        setCareers(careersData);
        setPrograms(programsData);
        setAdmissions(admissionsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Career Compass</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Profile Section */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Roll Number:</strong> {user?.roll_number}</p>
              </div>
              <div>
                <p><strong>Hobbies:</strong> {user?.hobbies || 'Not specified'}</p>
                <p><strong>Interests:</strong> {user?.interests || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Careers Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Available Careers</h2>
              <div className="space-y-3">
                {careers.slice(0, 5).map((career) => (
                  <div key={career.id} className="border rounded-lg p-3">
                    <h3 className="font-medium text-gray-900">{career.title}</h3>
                    <p className="text-sm text-gray-600">{career.description}</p>
                    {career.required_skills && (
                      <p className="text-xs text-gray-500 mt-1">
                        Skills: {career.required_skills}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Programs Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">University Programs</h2>
              <div className="space-y-3">
                {programs.slice(0, 5).map((program) => (
                  <div key={program.id} className="border rounded-lg p-3">
                    <h3 className="font-medium text-gray-900">{program.degree_title}</h3>
                    <p className="text-sm text-gray-600">{program.university_name}</p>
                    <p className="text-xs text-gray-500">
                      {program.location} • {program.duration} • ${program.fee}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Admissions Section */}
        <div className="bg-white overflow-hidden shadow rounded-lg mt-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Applications</h2>
            {admissions.length === 0 ? (
              <p className="text-gray-500">No applications yet.</p>
            ) : (
              <div className="space-y-3">
                {admissions.map((admission) => (
                  <div key={admission.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Application #{admission.id}</p>
                        <p className="text-sm text-gray-600">
                          Applied: {new Date(admission.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        admission.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        admission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {admission.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 