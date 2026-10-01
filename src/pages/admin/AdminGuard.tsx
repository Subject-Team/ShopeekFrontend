import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotFoundPage } from '../NotFoundPage';
import { AdminPage } from '../AdminPage';
import { FullPageLoader } from '../../components/common/AppLoader';

export const AdminGuard: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'Admin') {
    return <NotFoundPage />;
  }

  return <AdminPage />;
};
