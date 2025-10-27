/**
 * Audit Logs Page - Week 3 Admin Feature
 * Comprehensive audit log viewer for admins
 */

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Download, Filter, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useEnhancedAuth } from "@/contexts/EnhancedAuthContext";
import { Navigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { exportToCSV } from "@/lib/csvExport";
import { logger } from "@/lib/logging/productionLogger";
import { trackSelect } from "@/lib/logging/supabaseTracker";

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
}

export default function AuditLogs() {
  const { user, isAdmin, loading: authLoading } = useEnhancedAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [tableFilter, setTableFilter] = useState("all");
  const [dateRange, setDateRange] = useState("7");

  const loadLogs = useCallback(async () => {
    try {
      setLoadingLogs(true);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange, 10));

      const result = await trackSelect(
        async () => {
          return await supabase
            .from("audit_logs")
            .select("*")
            .gte("created_at", cutoffDate.toISOString())
            .order("created_at", { ascending: false })
            .limit(500);
        },
        "audit_logs",
        "AuditLogs"
      );

      const { data, error } = result;
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      logger.error("Error loading audit logs", error, { context: "AuditLogs" });
      toast.error("Failed to load audit logs");
    } finally {
      setLoadingLogs(false);
    }
  }, [dateRange]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || !isAdmin) {
      setLoadingLogs(false);
      return;
    }

    void loadLogs();
  }, [authLoading, isAdmin, loadLogs, user]);

  if (authLoading) {
    return <LoadingSpinner message="Verifying access..." />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_id.includes(searchTerm);

    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesTable = tableFilter === "all" || log.table_name === tableFilter;

    return matchesSearch && matchesAction && matchesTable;
  });

  const uniqueActions = Array.from(new Set(logs.map(l => l.action))).sort();
  const uniqueTables = Array.from(new Set(logs.map(l => l.table_name))).sort();

  const handleExport = () => {
    const exportData = filteredLogs.map(log => ({
      timestamp: format(new Date(log.created_at), "PPpp"),
      user_id: log.user_id,
      action: log.action,
      table: log.table_name,
      record_id: log.record_id || "N/A",
      changes: log.new_data ? JSON.stringify(log.new_data) : "N/A",
    }));

    exportToCSV(exportData, `audit_logs_${format(new Date(), "yyyy-MM-dd")}`);
    toast.success("Audit logs exported!");
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      INSERT: "default",
      UPDATE: "secondary",
      DELETE: "destructive",
      ADMIN_GRANT: "default",
      ADMIN_REVOKE: "destructive",
    };

    return (
      <Badge variant={variants[action] || "outline"}>
        {action}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-pixel flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              Audit Logs
            </h1>
            <p className="font-sans text-muted-foreground">
              Complete activity log for security and compliance
            </p>
          </div>
          <Badge className="bg-warning text-warning-foreground border-2 border-foreground">
            ADMIN ACCESS
          </Badge>
        </div>

        {/* Filters */}
        <Card className="border-4 border-foreground shadow-brutal">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map(action => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={tableFilter} onValueChange={setTableFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Table" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tables</SelectItem>
                  {uniqueTables.map(table => (
                    <SelectItem key={table} value={table}>
                      {table}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last 24 Hours</SelectItem>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Showing {filteredLogs.length} of {logs.length} logs
              </p>
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={filteredLogs.length === 0}
                className="gap-2 w-full sm:w-auto"
                size="sm"
              >
                <Download className="h-4 w-4" />
                <span className="sm:inline">Export CSV</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="border-4 border-foreground shadow-brutal">
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>
              Detailed record of all system actions and changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingLogs ? (
              <div className="py-8 text-center">
                <LoadingSpinner message="Loading logs..." />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No audit logs found</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3 max-h-[600px] overflow-y-auto">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 sm:p-4 border-2 border-foreground rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col gap-3">
                      {/* Badges and timestamp - wrap on mobile */}
                      <div className="flex flex-wrap items-center gap-2">
                        {getActionBadge(log.action)}
                        <Badge variant="outline" className="text-xs">{log.table_name}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(log.created_at), "PPp")}
                        </span>
                      </div>

                      {/* User and record info */}
                      <div className="space-y-1">
                        <p className="font-mono text-xs text-muted-foreground break-all">
                          User: {log.user_id}
                        </p>
                        {log.record_id && (
                          <p className="font-mono text-xs text-muted-foreground break-all">
                            Record: {log.record_id}
                          </p>
                        )}
                      </div>

                      {/* Changes details */}
                      {log.new_data && (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-xs font-medium hover:text-primary touch-manipulation min-h-[44px] flex items-center">
                            View Changes
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto max-w-full">
                            {JSON.stringify(log.new_data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
