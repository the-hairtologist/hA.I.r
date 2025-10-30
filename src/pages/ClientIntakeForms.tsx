import { DashboardLayout } from '@/components/DashboardLayout';
import { IntakeFormBuilder } from '@/components/intake-forms/IntakeFormBuilder';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { FileText } from 'lucide-react';

const ClientIntakeForms = () => {
  const { user } = useAuth();
  const { isAdmin, isStylist } = useUserRole(user?.id);

  if (!isAdmin && !isStylist) {
    return (
      <DashboardLayout>
        <div className="container max-w-4xl py-12 text-center">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
          <p className="text-muted-foreground">
            Intake form management is only available for stylists and admins.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container max-w-6xl py-8">
        <IntakeFormBuilder />
      </div>
    </DashboardLayout>
  );
};

export default ClientIntakeForms;
