import { DashboardLayout } from '@/components/DashboardLayout';
import { SEOHead } from '@/components/SEOHead';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  TrendingUp,
  Star,
  AlertTriangle,
  DollarSign,
  UserPlus,
} from 'lucide-react';
import { ClientSegmentation } from '@/components/crm/ClientSegmentation';
import { LeadScoring } from '@/components/crm/LeadScoring';
import { FollowUpTracker } from '@/components/crm/FollowUpTracker';
import { ClientLifetimeValue } from '@/components/crm/ClientLifetimeValue';

const CRMDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, isStylist } = useUserRole(user?.id);

  if (!isAdmin && !isStylist) {
    return (
      <DashboardLayout>
        <div className="container max-w-4xl py-12 text-center">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
          <p className="text-muted-foreground">
            CRM Dashboard is only available for stylists and admins.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <SEOHead
        title="CRM Dashboard | hA.I.r"
        description="Enhanced client relationship management with segmentation, lead scoring, and lifetime value tracking"
      />

      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-pixel mb-2">
            Enhanced CRM
          </h1>
          <p className="font-sans text-muted-foreground text-sm sm:text-base lg:text-lg">
            Comprehensive client relationship management and insights
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="brutal-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                <UserPlus className="inline h-3 w-3 mr-1" />
                +0 this month
              </p>
            </CardContent>
          </Card>

          <Card className="brutal-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                VIP Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                <Star className="inline h-3 w-3 mr-1 text-amber-500" />
                Top tier
              </p>
            </CardContent>
          </Card>

          <Card className="brutal-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                At Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                <AlertTriangle className="inline h-3 w-3 mr-1 text-destructive" />
                Need attention
              </p>
            </CardContent>
          </Card>

          <Card className="brutal-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg LTV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0</div>
              <p className="text-xs text-muted-foreground mt-1">
                <DollarSign className="inline h-3 w-3 mr-1" />
                Per client
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main CRM Features */}
        <Tabs defaultValue="segmentation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 border-2">
            <TabsTrigger value="segmentation" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Segments</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Lead Scoring</span>
            </TabsTrigger>
            <TabsTrigger value="followups" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Follow-ups</span>
            </TabsTrigger>
            <TabsTrigger value="ltv" className="gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Lifetime Value</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="segmentation" className="space-y-6">
            <ClientSegmentation />
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <LeadScoring />
          </TabsContent>

          <TabsContent value="followups" className="space-y-6">
            <FollowUpTracker />
          </TabsContent>

          <TabsContent value="ltv" className="space-y-6">
            <ClientLifetimeValue />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CRMDashboard;
