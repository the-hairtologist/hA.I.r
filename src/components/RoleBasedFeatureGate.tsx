import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { ReactNode } from 'react';

interface RoleBasedFeatureGateProps {
  children: ReactNode;
  allowedRoles: Array<'admin' | 'stylist' | 'client'>;
  fallback?: ReactNode;
}

export const RoleBasedFeatureGate = ({
  children,
  allowedRoles,
  fallback = null,
}: RoleBasedFeatureGateProps) => {
  const { user } = useAuth();
  const { roles } = useUserRole(user?.id);

  const hasAccess = roles.some(role => allowedRoles.includes(role as any));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
