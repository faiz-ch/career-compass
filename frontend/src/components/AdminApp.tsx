import React from 'react';
import { AdminProvider, useAdmin } from '../context/AdminContext';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

const AdminAppContent: React.FC = () => {
  const { admin, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return admin ? <AdminDashboard /> : <AdminLogin />;
};

const AdminApp: React.FC = () => {
  return (
    <AdminProvider>
      <AdminAppContent />
    </AdminProvider>
  );
};

export default AdminApp;
