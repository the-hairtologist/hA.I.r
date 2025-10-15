/**
 * Client Hair History Page
 * Simple, clean view for clients to see their hair formulas and history
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, Palette, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { SkeletonList } from "@/components/ui/skeleton-list";

const ClientFormulas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formulas, setFormulas] = useState<any[]>([]);
  const [clientProfile, setClientProfile] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Get client profile
      const { data: client } = await supabase
        .from("client_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (!client) {
        setLoading(false);
        return;
      }

      setClientProfile(client);

      // Get formulas for this client
      const { data: formulasData } = await supabase
        .from("formulas")
        .select(`
          *,
          stylist:stylist_profiles(
            business_name,
            user:profiles(full_name)
          )
        `)
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });

      setFormulas(formulasData || []);
    } catch (error) {
      console.error("Error loading formulas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-display font-bold">My Hair History</h1>
            <p className="text-muted-foreground">Your hair formulas and color history</p>
          </div>
          <SkeletonList count={3} />
        </div>
      </DashboardLayout>
    );
  }

  if (!clientProfile) {
    return (
      <DashboardLayout>
        <Card>
          <CardHeader>
            <CardTitle>Client Profile Required</CardTitle>
            <CardDescription>
              You need a client profile to view your hair history.
            </CardDescription>
          </CardHeader>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-3xl font-display font-bold">My Hair History</h1>
          <p className="text-muted-foreground">
            Your personalized hair formulas and color history
          </p>
        </div>

        {formulas.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Palette className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">No Hair History Yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Your hair formulas will appear here after your stylist creates them. This helps you keep track of what products and techniques work best for your hair.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {formulas.map((formula) => (
              <Card key={formula.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">
                          {formula.color_line || "Hair Formula"}
                        </CardTitle>
                        {formula.tags && formula.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {formula.tags.slice(0, 2).map((tag: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(formula.created_at), { addSuffix: true })}
                        </span>
                        {formula.stylist && (
                          <span>
                            by {formula.stylist.business_name || formula.stylist.user?.full_name || "Your Stylist"}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formula.formula_text && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Palette className="h-4 w-4 text-primary" />
                        Formula
                      </div>
                      <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
                        {formula.formula_text}
                      </p>
                    </div>
                  )}
                  
                  {formula.instructions && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="h-4 w-4 text-primary" />
                        Care Instructions
                      </div>
                      <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
                        {formula.instructions}
                      </p>
                    </div>
                  )}

                  {(formula.processing_time || formula.developer_volume) && (
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      {formula.processing_time && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Processing Time</p>
                          <p className="text-sm font-medium">{formula.processing_time} min</p>
                        </div>
                      )}
                      {formula.developer_volume && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Developer Volume</p>
                          <p className="text-sm font-medium">{formula.developer_volume}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {formula.result_notes && (
                    <div className="space-y-2 pt-2 border-t">
                      <p className="text-xs text-muted-foreground">Results</p>
                      <p className="text-sm">{formula.result_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClientFormulas;
