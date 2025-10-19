import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Download, RefreshCw } from "lucide-react";
import { SecurityMetricsCards } from "@/components/admin/SecurityMetricsCards";
import { RecentAuditLog } from "@/components/admin/RecentAuditLog";
import { ThreatTimeline } from "@/components/admin/ThreatTimeline";
import { SecurityHealthScore } from "@/components/admin/SecurityHealthScore";
import { toast } from "sonner";

/**
 * Security Dashboard - Real-time threat monitoring and audit logs
 * Admin-only access with comprehensive security metrics
 */
export default function SecurityDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Security data refreshed");
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    toast.success("Exporting security report...");
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Security Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Real-time security monitoring and threat analysis
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Security Health Score */}
      <SecurityHealthScore />

      {/* Metrics Cards */}
      <SecurityMetricsCards />

      {/* Tabs for Details */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="timeline" className="text-xs sm:text-sm">
            Threat Timeline
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-xs sm:text-sm">
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-6">
          <ThreatTimeline />
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <RecentAuditLog />
        </TabsContent>
      </Tabs>
    </div>
  );
}
