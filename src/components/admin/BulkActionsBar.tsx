/**
 * Bulk Actions Bar
 * Select multiple items for batch operations (Admin only)
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { X, Trash2, Mail, CheckCircle, XCircle, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BulkActionsBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onRefresh?: () => void;
  type: "appointments" | "clients" | "users";
}

export function BulkActionsBar({
  selectedIds,
  onClearSelection,
  onRefresh,
  type,
}: BulkActionsBarProps) {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<string>("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleBulkAction = async (actionType: string) => {
    setAction(actionType);
    
    // Show confirmation for destructive actions
    if (["delete", "cancel"].includes(actionType)) {
      setShowConfirmDialog(true);
      return;
    }

    await executeBulkAction(actionType);
  };

  const executeBulkAction = async (actionType: string) => {
    setLoading(true);
    try {
      switch (actionType) {
        case "delete":
          await handleBulkDelete();
          break;
        case "complete":
          await handleBulkComplete();
          break;
        case "cancel":
          await handleBulkCancel();
          break;
        case "email":
          await handleBulkEmail();
          break;
        case "export":
          await handleBulkExport();
          break;
        default:
          toast.error("Unknown action");
      }
      
      onClearSelection();
      onRefresh?.();
      setShowConfirmDialog(false);
    } catch (error: any) {
      console.error("Bulk action error:", error);
      toast.error(error.message || "Failed to perform bulk action");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    const table = type === "appointments" ? "appointments" : 
                  type === "clients" ? "client_profiles" : "profiles";
    
    const { error } = await supabase
      .from(table)
      .delete()
      .in("id", selectedIds);

    if (error) throw error;
    toast.success(`Deleted ${selectedIds.length} ${type}`);
  };

  const handleBulkComplete = async () => {
    if (type !== "appointments") return;

    const { error } = await supabase
      .from("appointments")
      .update({ status: "completed" })
      .in("id", selectedIds);

    if (error) throw error;
    toast.success(`Marked ${selectedIds.length} appointments as completed`);
  };

  const handleBulkCancel = async () => {
    if (type !== "appointments") return;

    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .in("id", selectedIds);

    if (error) throw error;
    toast.success(`Cancelled ${selectedIds.length} appointments`);
  };

  const handleBulkEmail = async () => {
    // Get email addresses
    const table = type === "clients" ? "client_profiles" : "profiles";
    const { data, error } = await supabase
      .from(table)
      .select("email")
      .in("id", selectedIds);

    if (error) throw error;

    const emails = data.map((item: any) => item.email).filter(Boolean);
    
    // Open email client with BCC
    window.location.href = `mailto:?bcc=${emails.join(",")}`;
    toast.success(`Opening email client with ${emails.length} recipients`);
  };

  const handleBulkExport = async () => {
    // Get data
    const table = type === "appointments" ? "appointments" : 
                  type === "clients" ? "client_profiles" : "profiles";
    
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .in("id", selectedIds);

    if (error) throw error;

    // Convert to CSV
    const csv = convertToCSV(data);
    
    // Download
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    
    toast.success(`Exported ${selectedIds.length} ${type}`);
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return "";
    
    const headers = Object.keys(data[0]);
    const rows = data.map(item => 
      headers.map(header => JSON.stringify(item[header] ?? "")).join(",")
    );
    
    return [headers.join(","), ...rows].join("\n");
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[45] animate-slide-in-right">
        <div className="bg-background border-2 border-primary rounded-lg shadow-lg p-3 flex items-center gap-3">
          <Badge variant="secondary" className="px-3 py-1">
            {selectedIds.length} selected
          </Badge>

          <div className="h-6 w-px bg-border" />

          <Select onValueChange={handleBulkAction} disabled={loading}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Bulk actions..." />
            </SelectTrigger>
            <SelectContent>
              {type === "appointments" && (
                <>
                  <SelectItem value="complete">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Mark Completed
                    </div>
                  </SelectItem>
                  <SelectItem value="cancel">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Cancel
                    </div>
                  </SelectItem>
                </>
              )}
              {(type === "clients" || type === "users") && (
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Send Email
                  </div>
                </SelectItem>
              )}
              <SelectItem value="export">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export to CSV
                </div>
              </SelectItem>
              <SelectItem value="delete">
                <div className="flex items-center gap-2 text-red-500">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-9 px-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will {action === "delete" ? "permanently delete" : "cancel"}{" "}
              {selectedIds.length} {type}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => executeBulkAction(action)}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600"
            >
              {loading ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
