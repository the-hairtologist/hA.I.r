import { Navigate, useLocation } from 'react-router-dom';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { useEffect } from 'react';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'stylist' | 'client')[];
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { user, loading, roles } = useEnhancedAuth();
  const location = useLocation();
  const { setLoading } = useGlobalLoading();

  // Wait for roles to fully load if user exists
  const isStillLoading = loading || (user && roles.length === 0);

  // Sync loading state with global loader
  useEffect(() => {
    setLoading(isStillLoading, 'Verifying access...');
  }, [isStillLoading, setLoading]);

  if (isStillLoading) {
    // Return null - the global loader will show
    return null;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If no role restriction, allow access
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user has any of the allowed roles
  const userHasAllowedRole = roles.some(role =>
    allowedRoles.includes(role as 'admin' | 'stylist' | 'client')
  );

  if (!userHasAllowedRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
