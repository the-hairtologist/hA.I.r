import { DashboardLayout } from "@/components/DashboardLayout";
import { AIRetentionDashboard } from "@/components/AIRetentionDashboard";
import { SEOHead } from "@/components/SEOHead";

const ClientRetention = () => {
  return (
    <DashboardLayout>
      <SEOHead 
        title="Client Retention | hA.I.r"
        description="AI-powered client retention insights and automated win-back campaigns"
      />
      
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-2">
            Client Retention Dashboard
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
            AI-powered insights to keep your clients coming back
          </p>
        </div>

        <AIRetentionDashboard />
      </div>
    </DashboardLayout>
  );
};

export default ClientRetention;
