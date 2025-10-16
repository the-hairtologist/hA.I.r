import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SequenceList } from "@/components/email-sequences/SequenceList";
import { SequenceBuilder } from "@/components/email-sequences/SequenceBuilder";
import { SequenceAnalytics } from "@/components/email-sequences/SequenceAnalytics";
import { EmailTemplates } from "@/components/email-sequences/EmailTemplates";
import { ClientEnrollments } from "@/components/email-sequences/ClientEnrollments";
import { EmailTestPanel } from "@/components/email-automation/EmailTestPanel";
import { Mail, TrendingUp, Users, Layout, Zap } from "lucide-react";

const EmailSequences = () => {
  const { user } = useAuth();
  const { isAdmin, isStylist } = useUserRole(user?.id);

  if (!isAdmin && !isStylist) {
    return (
      <DashboardLayout>
        <div className="container max-w-4xl py-12 text-center">
          <Mail className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
          <p className="text-muted-foreground">
            Email sequence management is only available for stylists and admins.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container max-w-7xl py-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Email Sequences
          </h1>
          <p className="text-muted-foreground">
            Automate your client communication with smart email campaigns
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="sequences" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid border-2">
            <TabsTrigger value="sequences" className="gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Sequences</span>
            </TabsTrigger>
            <TabsTrigger value="enrollments" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Enrollments</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <Layout className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="test" className="gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Test</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sequences" className="space-y-6">
            <SequenceList />
          </TabsContent>

          <TabsContent value="enrollments" className="space-y-6">
            <ClientEnrollments />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <EmailTemplates />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <SequenceAnalytics />
          </TabsContent>

          <TabsContent value="test" className="space-y-6">
            <EmailTestPanel />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default EmailSequences;
