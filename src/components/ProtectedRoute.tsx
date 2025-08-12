import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
      return;
    }

    // Redirect non-admin users from dashboard to view-only dashboard
    if (location.pathname === '/dashboard' && user && !isAdmin) {
      navigate('/view-only-dashboard');
    }
  }, [user, isAdmin, isLoading, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // For transactions page, only allow admin users
  if (location.pathname === '/transactions' && (!user || !isAdmin)) {
    navigate('/view-only-dashboard');
    return null;
  }

  // Allow authenticated users to access view-only dashboard and transactions page
  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
