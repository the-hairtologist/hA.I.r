import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Shield, CheckCircle, XCircle, Loader2, Calendar, User, MapPin } from "lucide-react";
import { format } from "date-fns";

interface PendingStylist {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  business_name: string;
  license_number: string;
  license_state: string;
  license_photo_url: string | null;
  verification_status: string;
  created_at: string;
  bio: string | null;
  specialty: string | null;
  location: string | null;
}

const StylistVerification = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { roles, loading: roleLoading } = useUserRole(user?.id);
  const [loading, setLoading] = useState(true);
  const [stylists, setStylists] = useState<PendingStylist[]>([]);
  const [selectedStylist, setSelectedStylist] = useState<PendingStylist | null>(null);
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!roleLoading && !roles.includes('admin')) {
      navigate("/dashboard");
      return;
    }
    if (!roleLoading && roles.includes('admin')) {
      loadPendingStylists();
    }
  }, [roleLoading, roles, navigate]);

  const loadPendingStylists = async () => {
    try {
      const { data, error } = await supabase
        .from("stylist_profiles")
        .select(`
          id,
          user_id,
          business_name,
          license_number,
          license_state,
          license_photo_url,
          verification_status,
          created_at,
          bio,
          specialty,
          location,
          user:profiles!stylist_profiles_user_id_fkey (
            full_name,
            email
          )
        `)
        .eq("verification_status", "pending")
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Flatten the data structure
      const flattenedData = (data || []).map(s => ({
        id: s.id,
        user_id: s.user_id,
        full_name: (s.user as any)?.full_name || "Unknown",
        email: (s.user as any)?.email || "Unknown",
        business_name: s.business_name || "Not set",
        license_number: s.license_number || "Not provided",
        license_state: s.license_state || "Not provided",
        license_photo_url: s.license_photo_url,
        verification_status: s.verification_status,
        created_at: s.created_at,
        bio: s.bio,
        specialty: s.specialty,
        location: s.location,
      }));

      setStylists(flattenedData);
    } catch (error: any) {
      console.error("Error loading pending stylists:", error);
      toast.error("Failed to load pending verifications");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (stylistId: string, status: 'verified' | 'rejected') => {
    if (status === 'rejected' && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase.rpc('verify_stylist', {
        _stylist_id: stylistId,
        _status: status,
        _notes: notes.trim() || null,
        _rejection_reason: status === 'rejected' ? rejectionReason.trim() : null,
      });

      if (error) throw error;

      toast.success(status === 'verified' ? "Stylist verified successfully!" : "Stylist rejected");
      setSelectedStylist(null);
      setNotes("");
      setRejectionReason("");
      await loadPendingStylists();
    } catch (error: any) {
      console.error("Error verifying stylist:", error);
      toast.error("Failed to process verification");
    } finally {
      setProcessing(false);
    }
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <PageHeader
        title="Stylist Verification"
        icon={<Shield className="h-6 w-6" />}
        backTo="/admin/dashboard"
      />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {stylists.length === 0 ? (
          <Card className="border-primary/20">
            <CardContent className="py-12 text-center">
              <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-display font-bold mb-2">All caught up!</h3>
              <p className="text-muted-foreground">No pending stylist verifications at this time.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Pending Verifications</h2>
              <p className="text-muted-foreground">
                {stylists.length} stylist{stylists.length !== 1 ? 's' : ''} waiting for verification
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {stylists.map((stylist) => (
                <Card key={stylist.id} className="border-primary/20 hover:border-primary/40 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="font-display">{stylist.full_name}</CardTitle>
                        <CardDescription className="mt-1">{stylist.email}</CardDescription>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{stylist.business_name}</span>
                      </div>
                      
                      {stylist.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {stylist.location}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Applied {format(new Date(stylist.created_at), "MMM d, yyyy")}
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">License Information:</p>
                        <p className="font-mono text-xs">
                          <strong>Number:</strong> {stylist.license_number}
                        </p>
                        <p className="font-mono text-xs">
                          <strong>State:</strong> {stylist.license_state}
                        </p>
                      </div>

                      {stylist.bio && (
                        <p className="text-xs text-muted-foreground line-clamp-2 pt-2">
                          {stylist.bio}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedStylist(stylist);
                          setNotes("");
                          setRejectionReason("");
                        }}
                      >
                        Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Review Dialog */}
        {selectedStylist && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Review: {selectedStylist.full_name}</CardTitle>
                <CardDescription>Verify stylist license and information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedStylist.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Business Name</p>
                    <p className="font-medium">{selectedStylist.business_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">License Number</p>
                    <p className="font-mono font-medium">{selectedStylist.license_number}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">License State</p>
                    <p className="font-medium">{selectedStylist.license_state}</p>
                  </div>
                  {selectedStylist.specialty && (
                    <div>
                      <p className="text-muted-foreground">Specialty</p>
                      <p className="font-medium">{selectedStylist.specialty}</p>
                    </div>
                  )}
                  {selectedStylist.location && (
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">{selectedStylist.location}</p>
                    </div>
                  )}
                </div>

                {selectedStylist.bio && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Bio</p>
                    <p className="text-sm">{selectedStylist.bio}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">Internal Notes (Optional)</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any internal notes about this verification..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Rejection Reason (If rejecting)</label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide reason for rejection (required if rejecting)..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedStylist(null)}
                    disabled={processing}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleVerify(selectedStylist.id, 'rejected')}
                    disabled={processing}
                    className="flex-1"
                  >
                    {processing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleVerify(selectedStylist.id, 'verified')}
                    disabled={processing}
                    className="flex-1"
                  >
                    {processing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Verify
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default StylistVerification;
