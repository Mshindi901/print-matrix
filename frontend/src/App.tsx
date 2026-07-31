import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PrintJobsPage } from './pages/PrintJobsPage';
import { PrintersPage } from './pages/PrintersPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  let isAdmin = false;
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null') as Record<string, unknown> | null;
    const role = typeof user?.role === 'string' ? user.role.toLowerCase() : undefined;
    isAdmin = role === 'admin' || user?.isAdmin === true || (Array.isArray(user?.roles) && user.roles.some((value) => typeof value === 'string' && value.toLowerCase().includes('admin')));
  } catch {
    // A malformed saved user is treated as non-admin.
  }

  return isAdmin ? <>{children}</> : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Dashboard Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="print-jobs" element={<PrintJobsPage />} />
          <Route path="printers" element={<AdminRoute><PrintersPage /></AdminRoute>} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
