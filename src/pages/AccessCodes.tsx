import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Key, Copy, CheckCircle, XCircle, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface AccessCode {
  id: string;
  code: string;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
  is_active: boolean;
  notes: string | null;
}

export default function AccessCodes() {
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: roleLoading } = useUserRole(user?.id);
  
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!authLoading && !roleLoading && user && roles.length > 0) {
      const adminCheck = roles.includes('admin');
      setIsAdmin(adminCheck);
      
      if (!adminCheck) {
        toast.error("Admin access required");
        setLoading(false);
        return;
      }
      
      loadCodes();
    } else if (!authLoading && !user) {
      toast.error("Please sign in");
      setLoading(false);
    }
  }, [authLoading, roleLoading, user, roles]);

  const checkAdminAndLoadCodes = async () => {
    // This function is now handled by the useEffect above with useUserRole hook
  };

  const loadCodes = async () => {
    try {
      const { data, error } = await supabase
        .from("access_codes")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setCodes(data || []);
    } catch (error) {
      console.error("Error loading access codes:", error);
      toast.error("Failed to load access codes");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  const usedCount = codes.filter(c => c.used_by !== null).length;
  const availableCount = codes.filter(c => c.used_by === null && c.is_active).length;

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                This page is only accessible to administrators.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Access Code Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage early access codes for testing users
          </p>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          <Card className="border-[2px] sm:border-[3px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
              <CardTitle className="text-sm font-medium">Total Codes</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{codes.length}</div>
            </CardContent>
          </Card>

          <Card className="border-[2px] sm:border-[3px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
              <CardTitle className="text-sm font-medium">Used Codes</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{usedCount}</div>
            </CardContent>
          </Card>

          <Card className="border-[2px] sm:border-[3px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <XCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{availableCount}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-[2px] sm:border-[3px]">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Access Codes</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Limited to 5 codes for early testing phase
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {codes.map((codeItem) => (
                <div
                  key={codeItem.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border-2 rounded-lg hover:bg-muted/50 transition-colors gap-3"
                >
                  <div className="space-y-1 flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <code className="px-2 sm:px-3 py-1 bg-muted rounded font-mono text-xs sm:text-sm break-all">
                        {codeItem.code}
                      </code>
                      {codeItem.used_by ? (
                        <Badge variant="default" className="bg-green-500 text-xs">Used</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Available</Badge>
                      )}
                    </div>
                    
                    {codeItem.notes && (
                      <p className="text-xs sm:text-sm text-muted-foreground">{codeItem.notes}</p>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created {format(new Date(codeItem.created_at), "MMM d, yyyy")}
                      </div>
                      {codeItem.used_at && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Used {format(new Date(codeItem.used_at), "MMM d, yyyy")}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(codeItem.code)}
                    disabled={!!codeItem.used_by}
                    className="min-h-[44px] min-w-[44px] w-full sm:w-auto"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
