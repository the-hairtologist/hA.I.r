import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { ReferralSystem } from "@/components/ReferralSystem";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Gift } from "lucide-react";

const Referrals = () => {
  const { user } = useAuth();
  const { isStylist, loading } = useUserRole(user?.id);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isStylist) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8">
          <Card className="border-destructive/50">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2">Stylists Only</h2>
              <p className="text-muted-foreground">
                The referral program is currently available for stylists only.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6 max-w-4xl">
        <PageHeader
          title="Referral Program"
          icon={<Gift className="h-8 w-8" />}
        />
        <p className="text-muted-foreground mb-8">
          Earn rewards by inviting other stylists to join hA.I.r
        </p>
        <ReferralSystem />
      </div>
    </DashboardLayout>
  );
};

export default Referrals;
