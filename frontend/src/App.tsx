import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/RegistrationForm';
import StudentDashboard from './pages/StudentDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/Unauthorized';
import { useAuthStore } from './store/authStore';

const App = () => {
  const { user } = useAuthStore();

  // Modified Protected Route component
  const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
    // For development/testing - allow access to routes without authentication
    // Comment this out or modify for production
    return <>{children}</>;
    
    // Uncomment this for actual authentication
    /*
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    if (allowedRoles.includes(user.role)) {
      return <>{children}</>;
    } else {
      return <Unauthorized />;
    }
    */
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Direct dashboard routes */}
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/lecturer" element={<LecturerDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* Nested routes for each dashboard */}
        <Route path="/student/*" element={<StudentDashboard />} />
        <Route path="/lecturer/*" element={<LecturerDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;