import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading, user, hasRole, hasAnyRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    if (Array.isArray(requiredRole)) {
      if (!hasAnyRole(requiredRole)) {
        return <Navigate to="/" replace />;
      }
    } else {
      if (!hasRole(requiredRole)) {
        return <Navigate to="/" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;
