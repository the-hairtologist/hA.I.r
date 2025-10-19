import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { ReactNode } from 'react';

interface RoleBasedFeatureGateProps {
  children: ReactNode;
  allowedRoles: Array<'admin' | 'stylist' | 'client'>;
  fallback?: ReactNode;
}

export const RoleBasedFeatureGate = ({ 
  children, 
  allowedRoles, 
  fallback = null 
}: RoleBasedFeatureGateProps) => {
  const { roles } = useEnhancedAuth();

  const hasAccess = roles.some(role => allowedRoles.includes(role as any));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
