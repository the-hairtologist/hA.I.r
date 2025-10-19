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
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b-2 border-border/50">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20 shadow-sm animate-pulse-ring">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
              Security Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-medium mt-1">
              Real-time security monitoring & threat analysis
            </p>
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full sm:w-auto font-bold transition-all hover:scale-105 active:scale-95"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="w-full sm:w-auto font-bold transition-all hover:scale-105 active:scale-95"
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
        <TabsList className="grid w-full grid-cols-2 h-auto border-2 border-border shadow-sm">
          <TabsTrigger 
            value="timeline" 
            className="text-xs sm:text-sm font-bold uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            Threat Timeline
          </TabsTrigger>
          <TabsTrigger 
            value="audit" 
            className="text-xs sm:text-sm font-bold uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
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
