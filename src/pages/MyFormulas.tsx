import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Scissors, ArrowLeft, Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";

const MyFormulas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formulas, setFormulas] = useState<any[]>([]);
  const [clientProfile, setClientProfile] = useState<any>(null);

  useEffect(() => {
    checkAccessAndLoad();
  }, []);

  const checkAccessAndLoad = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user is a client
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (roleData?.role !== "client") {
        toast.error("This feature is only available for clients");
        navigate("/dashboard");
        return;
      }

      // Get client profile
      const { data: profile } = await supabase
        .from("client_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (!profile) {
        toast.error("Client profile not found");
        navigate("/dashboard");
        return;
      }

      setClientProfile(profile);

      // Load formulas with stylist info
      const { data: formulasData, error } = await supabase
        .from("formulas")
        .select(`
          *,
          stylist:stylist_profiles(
            business_name,
            user:profiles(full_name)
          )
        `)
        .eq("client_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFormulas(formulasData || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Error loading your formulas");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Scissors className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">My Hair Color History</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Info Card */}
        <Card className="mb-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle>Your Color Journey</CardTitle>
            <CardDescription>
              View all your past color formulas and track your hair transformation
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Formulas */}
        {formulas.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Scissors className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl font-semibold mb-2">No formulas yet</p>
              <p className="text-muted-foreground mb-4">
                Your stylist will create formulas during your appointments
              </p>
              <Button onClick={() => navigate("/book")}>
                Book Appointment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {formulas.map((formula) => (
              <Card key={formula.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(formula.created_at), "MMMM d, yyyy")}
                        </p>
                      </div>
                      {formula.stylist && (
                        <p className="text-sm text-muted-foreground">
                          by {formula.stylist.business_name || formula.stylist.user?.full_name}
                        </p>
                      )}
                    </div>
                    {formula.color_line && (
                      <Badge variant="secondary">{formula.color_line}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Formula */}
                  <div>
                    <h3 className="font-semibold mb-2">Formula</h3>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap font-mono">
                        {formula.formula_text}
                      </pre>
                    </div>
                  </div>

                  {/* Instructions */}
                  {formula.instructions && (
                    <div>
                      <h3 className="font-semibold mb-2">Application Instructions</h3>
                      <p className="text-sm text-muted-foreground">
                        {formula.instructions}
                      </p>
                    </div>
                  )}

                  {/* Results */}
                  {formula.result_notes && (
                    <div>
                      <h3 className="font-semibold mb-2">Results & Notes</h3>
                      <p className="text-sm text-muted-foreground">
                        {formula.result_notes}
                      </p>
                    </div>
                  )}

                  {/* Photo */}
                  {formula.hair_photo_url && (
                    <div>
                      <h3 className="font-semibold mb-2">Result Photo</h3>
                      <img
                        src={formula.hair_photo_url}
                        alt="Hair color result"
                        className="rounded-lg max-w-md w-full h-auto"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tips Card */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">💡 Pro Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Share your favorite formulas with your stylist for future appointments</p>
            <p>• Take progress photos to track your hair journey over time</p>
            <p>• Note which formulas worked best for your hair type</p>
            <p>• Discuss any concerns or adjustments with your stylist</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MyFormulas;
