import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { adminApi } from '../services/adminApi';

interface UserStats {
  total_users: number;
  new_users_today: number;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  roll_number?: string;
  created_at: string;
}

interface Career {
  id: number;
  title: string;
  description?: string;
  created_at: string;
}

interface Program {
  id: number;
  name: string;
  data: any;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const { admin, logout } = useAdmin();
  const [activeTab, setActiveTab] = useState<'users' | 'careers' | 'programs' | 'admins'>('users');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUserStats();
      fetchUsers();
    } else if (activeTab === 'careers') {
      fetchCareers();
    } else if (activeTab === 'programs') {
      fetchPrograms();
    }
  }, [activeTab]);

  const fetchUserStats = async () => {
    try {
      const data = await adminApi.getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCareers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getCareers();
      setCareers(data);
    } catch (error) {
      console.error('Error fetching careers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getPrograms();
      setPrograms(data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminApi.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
        fetchUserStats(); // Refresh stats
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleDeleteCareer = async (careerId: number) => {
    if (window.confirm('Are you sure you want to delete this career?')) {
      try {
        await adminApi.deleteCareer(careerId);
        setCareers(careers.filter(career => career.id !== careerId));
      } catch (error) {
        console.error('Error deleting career:', error);
        alert('Failed to delete career');
      }
    }
  };

  const handleDeleteProgram = async (programId: number) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await adminApi.deleteProgram(programId);
        setPrograms(programs.filter(program => program.id !== programId));
      } catch (error) {
        console.error('Error deleting program:', error);
        alert('Failed to delete program');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {admin?.first_name}</span>
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

      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('careers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'careers'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Career Management
            </button>
            <button
              onClick={() => setActiveTab('programs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'programs'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Program Management
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'admins'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Admin Management
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'users' && (
          <div className="px-4 py-6 sm:px-0">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">👥</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                          <dd className="text-lg font-medium text-gray-900">{stats.total_users}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">📈</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">New Today</dt>
                          <dd className="text-lg font-medium text-gray-900">{stats.new_users_today}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">All Users</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage registered students</p>
              </div>
              <div className="border-t border-gray-200">
                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <li key={user.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {user.first_name[0]}{user.last_name[0]}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              {user.roll_number && (
                                <div className="text-sm text-gray-500">Roll: {user.roll_number}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              Joined: {formatDate(user.created_at)}
                            </span>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'careers' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">All Careers</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage career options</p>
              </div>
              <div className="border-t border-gray-200">
                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {careers.map((career) => (
                      <li key={career.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{career.title}</div>
                            {career.description && (
                              <div className="text-sm text-gray-500 mt-1">{career.description}</div>
                            )}
                            <div className="text-sm text-gray-500 mt-1">
                              Created: {formatDate(career.created_at)}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteCareer(career.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'programs' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">All Programs</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage university programs</p>
              </div>
              <div className="border-t border-gray-200">
                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {programs.map((program) => (
                      <li key={program.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{program.name}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              Created: {formatDate(program.created_at)}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteProgram(program.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Admin Management</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage admin users</p>
              </div>
              <div className="border-t border-gray-200 p-4">
                <p className="text-gray-500">Admin management features coming soon...</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
