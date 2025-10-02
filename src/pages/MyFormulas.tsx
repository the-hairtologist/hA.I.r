import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Scissors, ArrowLeft, Loader2, Calendar, User } from "lucide-react";
import { format } from "date-fns";

const MyFormulas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formulas, setFormulas] = useState<any[]>([]);
  const [selectedFormula, setSelectedFormula] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadFormulas();
  }, []);

  const loadFormulas = async () => {
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
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (!clientProfile) {
        toast.error("Client profile not found");
        navigate("/dashboard");
        return;
      }

      // Get formulas with stylist info
      const { data: formulasData, error } = await supabase
        .from("formulas")
        .select(`
          *,
          stylist:stylist_profiles(
            business_name,
            user_id,
            profiles:profiles(full_name)
          )
        `)
        .eq("client_id", clientProfile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFormulas(formulasData || []);
    } catch (error: any) {
      console.error("Error loading formulas:", error);
      toast.error("Error loading your formulas");
    } finally {
      setLoading(false);
    }
  };

  const handleViewFormula = (formula: any) => {
    setSelectedFormula(formula);
    setDialogOpen(true);
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
              <h1 className="text-2xl font-bold">My Hair Formulas</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="mb-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle>Your Color History</CardTitle>
            <CardDescription>
              View all your past hair color formulas and results. Share these with any stylist for consistent results.
            </CardDescription>
          </CardHeader>
        </Card>

        {formulas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Scissors className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No formulas yet</p>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                Your stylist will create formulas for you after appointments. They'll appear here for your reference.
              </p>
              <Button onClick={() => navigate("/book")}>
                Book an Appointment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {formulas.map((formula) => (
              <Card 
                key={formula.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewFormula(formula)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(formula.created_at), "MMMM d, yyyy")}
                        </span>
                      </div>
                      {formula.color_line && (
                        <Badge variant="secondary" className="mb-2">
                          {formula.color_line}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {formula.stylist && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">by</span>
                      <span className="font-medium">
                        {formula.stylist.business_name || formula.stylist.profiles?.full_name || "Your Stylist"}
                      </span>
                    </div>
                  )}

                  {formula.hair_photo_url && (
                    <div className="relative rounded-lg overflow-hidden border">
                      <img 
                        src={formula.hair_photo_url} 
                        alt="Hair result"
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}

                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm font-mono line-clamp-2">
                      {formula.formula_text}
                    </p>
                  </div>

                  <Button variant="outline" className="w-full" onClick={(e) => {
                    e.stopPropagation();
                    handleViewFormula(formula);
                  }}>
                    View Full Formula
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Formula Detail Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scissors className="h-5 w-5 text-primary" />
                Formula Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedFormula && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(selectedFormula.created_at), "MMMM d, yyyy 'at' h:mm a")}
                  </span>
                  {selectedFormula.color_line && (
                    <Badge variant="secondary">{selectedFormula.color_line}</Badge>
                  )}
                </div>

                {selectedFormula.stylist && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Stylist</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedFormula.stylist.business_name || selectedFormula.stylist.profiles?.full_name}
                    </p>
                  </div>
                )}

                {selectedFormula.hair_photo_url && (
                  <div className="rounded-lg overflow-hidden border">
                    <img 
                      src={selectedFormula.hair_photo_url} 
                      alt="Hair result"
                      className="w-full object-contain max-h-96"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Formula</Label>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-mono whitespace-pre-wrap">
                      {selectedFormula.formula_text}
                    </p>
                  </div>
                </div>

                {selectedFormula.instructions && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Application Instructions</Label>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedFormula.instructions}
                    </p>
                  </div>
                )}

                {selectedFormula.result_notes && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Result Notes</Label>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedFormula.result_notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

const Label = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <label className={`block text-sm font-medium ${className}`}>{children}</label>
);

export default MyFormulas;
