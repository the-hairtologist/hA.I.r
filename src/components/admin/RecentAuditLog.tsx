import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function RecentAuditLog() {
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const { data: logs, isLoading } = useQuery({
    queryKey: ["recent-audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case "INSERT":
        return "default";
      case "UPDATE":
        return "secondary";
      case "DELETE":
        return "destructive";
      case "ADMIN_GRANT":
      case "ADMIN_REVOKE":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Recent Security Events</h3>
          <Badge variant="secondary" className="ml-auto">
            {logs?.length || 0} events
          </Badge>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {logs?.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={getActionColor(log.action)} className="text-xs">
                        {log.action}
                      </Badge>
                      <span className="text-sm font-medium truncate">
                        {log.table_name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLog(log)}
                    className="flex-shrink-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {!logs?.length && (
              <div className="text-center py-8 text-muted-foreground">
                No audit logs found
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Action</p>
                <Badge variant={getActionColor(selectedLog.action)}>
                  {selectedLog.action}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Table</p>
                <p className="text-sm">{selectedLog.table_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                <p className="text-sm">
                  {new Date(selectedLog.created_at).toLocaleString()}
                </p>
              </div>
              {selectedLog.old_data && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Previous Data
                  </p>
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(selectedLog.old_data, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.new_data && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    New Data
                  </p>
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(selectedLog.new_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
