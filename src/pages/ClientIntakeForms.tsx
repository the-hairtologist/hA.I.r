import { DashboardLayout } from "@/components/DashboardLayout";
import { IntakeFormBuilder } from "@/components/intake-forms/IntakeFormBuilder";
import { useEnhancedAuth } from "@/contexts/EnhancedAuthContext";
import { FileText } from "lucide-react";

const ClientIntakeForms = () => {
  const { user, roles } = useEnhancedAuth();
  const isAdmin = roles.includes('admin');
  const isStylist = roles.includes('stylist');

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
