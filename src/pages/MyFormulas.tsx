import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
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
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">My Hair Color History</h1>
          <p className="text-foreground/70 font-medium">
            View your complete color formula archive and track your hair journey
          </p>
        </div>

        {/* Formulas */}
        {formulas.length === 0 ? (
          <Card className="border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] bg-purple-400">
            <CardContent className="text-center py-12">
              <Scissors className="h-16 w-16 text-foreground/70 mx-auto mb-4" />
              <p className="text-xl font-display font-bold mb-2 text-foreground">No formulas saved yet</p>
              <p className="text-foreground/80 mb-4 font-medium">
                Your stylist will create custom formulas during your appointments
              </p>
              <Button onClick={() => navigate("/book-appointment")}>
                Book Appointment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {formulas.map((formula, idx) => (
              <Card key={formula.id} className={`border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] hover:shadow-[7px_7px_0px_0px_hsl(var(--primary))] hover:-translate-y-1 transition-all ${
                idx % 4 === 0 ? 'bg-blue-400' :
                idx % 4 === 1 ? 'bg-green-400' :
                idx % 4 === 2 ? 'bg-yellow-300' : 'bg-purple-400'
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-foreground/70" />
                        <p className="text-sm text-foreground/80 font-medium">
                          {format(new Date(formula.created_at), "MMMM d, yyyy")}
                        </p>
                      </div>
                      {formula.stylist && (
                        <p className="text-sm text-foreground/80 font-medium">
                          by {formula.stylist.business_name || formula.stylist.user?.full_name}
                        </p>
                      )}
                    </div>
                    {formula.color_line && (
                      <Badge variant="secondary" className="bg-white border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">{formula.color_line}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Formula */}
                  <div>
                    <h3 className="font-display font-bold mb-2 text-foreground">Formula</h3>
                    <div className="bg-white border-2 border-foreground p-4 rounded-lg shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
                      <pre className="text-sm whitespace-pre-wrap font-mono text-foreground">
                        {formula.formula_text}
                      </pre>
                    </div>
                  </div>

                  {/* Instructions */}
                  {formula.instructions && (
                    <div>
                      <h3 className="font-display font-bold mb-2 text-foreground">Application Instructions</h3>
                      <p className="text-sm text-foreground/80 font-medium">
                        {formula.instructions}
                      </p>
                    </div>
                  )}

                  {/* Results */}
                  {formula.result_notes && (
                    <div>
                      <h3 className="font-display font-bold mb-2 text-foreground">Results & Notes</h3>
                      <p className="text-sm text-foreground/80 font-medium">
                        {formula.result_notes}
                      </p>
                    </div>
                  )}

                  {/* Photo */}
                  {formula.hair_photo_url && (
                    <div>
                      <h3 className="font-display font-bold mb-2 text-foreground">Result Photo</h3>
                      <img
                        src={formula.hair_photo_url}
                        alt="Hair color result"
                        className="rounded-lg border-2 border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] max-w-md w-full h-auto"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tips Card */}
        <Card className="mt-8 bg-red-400 border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))]">
          <CardHeader>
            <CardTitle className="text-lg font-display">💡 Helpful Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-foreground/80 font-medium">
            <p>• Share your favorite formulas with your stylist for consistent results</p>
            <p>• Take progress photos to document your hair transformation journey</p>
            <p>• Keep notes on which formulas worked best for your hair type</p>
            <p>• Discuss any adjustments or concerns with your stylist at your next appointment</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MyFormulas;
