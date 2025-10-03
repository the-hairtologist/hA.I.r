import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Mail, Phone, User, ArrowLeft, UserPlus, Filter, Edit, FileText, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InviteClientDialog } from "@/components/InviteClientDialog";
import { SearchInput } from "@/components/SearchInput";
import { ClientCardSkeleton } from "@/components/LoadingSkeleton";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { useDebounce } from "@/hooks/useDebounce";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo } from "react";
import { EmptyState } from "@/components/EmptyState";

interface ClientProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  hair_type: string | null;
  allergies: string | null;
  notes: string | null;
  created_at: string;
}

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [stylistId, setStylistId] = useState<string | null>(null);
  const [stylistName, setStylistName] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [sortBy, setSortBy] = useState<"name" | "recent">("recent");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    hair_type: "",
    allergies: "",
    notes: "",
  });
  const [clientFormulas, setClientFormulas] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    hair_type: "",
    allergies: "",
    notes: "",
  });

  useEffect(() => {
    loadStylistProfile();
  }, []);

  useEffect(() => {
    if (stylistId) {
      loadClients();
    }
  }, [stylistId]);

  const loadStylistProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: stylistProfile } = await supabase
        .from("stylist_profiles")
        .select("id, user:profiles(full_name)")
        .eq("user_id", user.id)
        .single();

      if (stylistProfile) {
        setStylistId(stylistProfile.id);
        setStylistName(stylistProfile.user?.full_name || "");
      }
    } catch (error) {
      console.error("Error loading stylist profile:", error);
      toast.error("Failed to load profile");
    }
  };

  const loadClients = async () => {
    if (!stylistId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("client_profiles")
        .select("*")
        .eq("preferred_stylist_id", stylistId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error loading clients:", error);
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  // Real-time updates
  useRealtimeUpdates("client_profiles", loadClients, stylistId || undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stylistId) return;

    try {
      const { error } = await supabase.from("client_profiles").insert({
        preferred_stylist_id: stylistId,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        hair_type: formData.hair_type,
        allergies: formData.allergies,
        notes: formData.notes,
      });

      if (error) throw error;

      toast.success("Client added successfully!");
      setIsDialogOpen(false);
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        hair_type: "",
        allergies: "",
        notes: "",
      });
      loadClients();
    } catch (error) {
      console.error("Error adding client:", error);
      toast.error("Failed to add client");
    }
  };

  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    try {
      const { error } = await supabase
        .from("client_profiles")
        .update({
          full_name: editFormData.full_name,
          email: editFormData.email,
          phone: editFormData.phone,
          hair_type: editFormData.hair_type,
          allergies: editFormData.allergies,
          notes: editFormData.notes,
        })
        .eq("id", selectedClient.id);

      if (error) throw error;

      toast.success("Client updated successfully!");
      setEditDialogOpen(false);
      loadClients();
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("Failed to update client");
    }
  };

  const openEditDialog = async (client: ClientProfile) => {
    setSelectedClient(client);
    setEditFormData({
      full_name: client.full_name || "",
      email: client.email || "",
      phone: client.phone || "",
      hair_type: client.hair_type || "",
      allergies: client.allergies || "",
      notes: client.notes || "",
    });

    // Load formulas for this client
    try {
      const { data: formulas } = await supabase
        .from("formulas")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });

      setClientFormulas(formulas || []);
    } catch (error) {
      console.error("Error loading formulas:", error);
      setClientFormulas([]);
    }

    setEditDialogOpen(true);
  };

  // Filter and sort clients
  const filteredClients = useMemo(() => {
    let filtered = clients;

    // Search filter with debounced value
    if (debouncedSearch) {
      filtered = filtered.filter(
        (client) =>
          client.full_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          client.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          client.phone?.includes(debouncedSearch)
      );
    }

    // Sort
    if (sortBy === "name") {
      filtered = [...filtered].sort((a, b) =>
        (a.full_name || "").localeCompare(b.full_name || "")
      );
    }

    return filtered;
  }, [clients, debouncedSearch, sortBy]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <ClientCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto py-8 px-4">
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2 gradient-text">My Clients</h1>
            <p className="text-muted-foreground">Manage your client profiles and information</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] transition-all">
                <Plus className="h-4 w-4" />
                Add Client
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto border-[3px] border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]">
            <DialogHeader>
              <DialogTitle className="text-2xl gradient-text">Add New Client</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Client's full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="client@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hair_type">Hair Type</Label>
                <Input
                  id="hair_type"
                  value={formData.hair_type}
                  onChange={(e) => setFormData({ ...formData, hair_type: e.target.value })}
                  placeholder="e.g., 3C Curly, Fine Straight"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="Any known allergies or sensitivities"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about the client"
                />
              </div>
              <Button type="submit" className="w-full">Add Client</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, email, or phone..."
            className="flex-1 border-[2px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))]"
          />
          <Select value={sortBy} onValueChange={(value: "name" | "recent") => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-48 border-[2px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredClients.length === 0 ? (
          searchQuery || sortBy !== "recent" ? (
            <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] bg-secondary/5">
              <CardContent className="py-12 text-center">
                <User className="h-12 w-12 mx-auto mb-4 text-secondary" />
                <h3 className="text-lg font-display font-bold mb-2">No clients match your search</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => { setSearchQuery(""); setSortBy("recent"); }}
                  className="border-[2px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] transition-all"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] bg-secondary/5">
              <CardContent className="py-12 text-center">
                <User className="h-12 w-12 mx-auto mb-4 text-secondary" />
                <h3 className="text-lg font-display font-bold mb-2">No clients yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start adding client profiles to keep track of their hair information
                </p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Client
                </Button>
              </CardContent>
            </Card>
          )
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client) => (
              <Card 
                key={client.id} 
                className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:translate-y-[-4px] hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] transition-all duration-300 bg-gradient-to-br from-card via-card to-secondary/5 cursor-pointer"
                onClick={() => openEditDialog(client)}
              >
                <CardHeader className="border-b-[3px] border-foreground bg-secondary/10">
                  <CardTitle className="flex items-center gap-2 font-display">
                    <div className="p-2 bg-secondary rounded-lg border-[2px] border-foreground">
                      <User className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    {client.full_name || "Unnamed Client"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm p-2 bg-primary/5 rounded-lg border-[2px] border-primary/20">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm p-2 bg-accent/5 rounded-lg border-[2px] border-accent/20">
                      <Phone className="h-4 w-4 text-accent" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.hair_type && (
                    <div className="text-sm p-2 bg-muted rounded-lg border-[2px] border-border">
                      <span className="font-semibold text-secondary">Hair Type:</span> {client.hair_type}
                    </div>
                  )}
                  {client.allergies && (
                    <div className="text-sm p-2 bg-destructive/5 rounded-lg border-[2px] border-destructive/20">
                      <span className="font-semibold text-destructive">Allergies:</span> {client.allergies}
                    </div>
                  )}
                  {client.notes && (
                    <div className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-lg border-[2px] border-border italic">
                      {client.notes}
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-[2px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(client);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    {client.email && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-[2px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClient(client);
                          setInviteDialogOpen(true);
                        }}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedClient && (
          <InviteClientDialog
            open={inviteDialogOpen}
            onOpenChange={setInviteDialogOpen}
            clientEmail={selectedClient.email || ""}
            clientName={selectedClient.full_name || ""}
            stylistName={stylistName}
          />
        )}

        {/* Edit Client Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-[3px] border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]">
            <DialogHeader>
              <DialogTitle className="text-2xl gradient-text">Edit Client Profile</DialogTitle>
            </DialogHeader>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Client Info Form */}
              <div>
                <h3 className="text-lg font-display font-bold mb-4 text-secondary">Client Information</h3>
                <form onSubmit={handleEditClient} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_full_name">Full Name *</Label>
                    <Input
                      id="edit_full_name"
                      required
                      value={editFormData.full_name}
                      onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                      placeholder="Client's full name"
                      className="border-[2px] border-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_email">Email</Label>
                    <Input
                      id="edit_email"
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      placeholder="client@example.com"
                      className="border-[2px] border-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_phone">Phone</Label>
                    <Input
                      id="edit_phone"
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="border-[2px] border-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_hair_type">Hair Type</Label>
                    <Input
                      id="edit_hair_type"
                      value={editFormData.hair_type}
                      onChange={(e) => setEditFormData({ ...editFormData, hair_type: e.target.value })}
                      placeholder="e.g., 3C Curly, Fine Straight"
                      className="border-[2px] border-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_allergies">Allergies</Label>
                    <Textarea
                      id="edit_allergies"
                      value={editFormData.allergies}
                      onChange={(e) => setEditFormData({ ...editFormData, allergies: e.target.value })}
                      placeholder="Any known allergies or sensitivities"
                      className="border-[2px] border-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_notes">Notes</Label>
                    <Textarea
                      id="edit_notes"
                      value={editFormData.notes}
                      onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                      placeholder="Additional notes about the client"
                      className="border-[2px] border-foreground"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] transition-all"
                  >
                    Save Changes
                  </Button>
                </form>
              </div>

              {/* Formulas List */}
              <div>
                <h3 className="text-lg font-display font-bold mb-4 text-primary flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Hair Formulas ({clientFormulas.length})
                </h3>
                
                {clientFormulas.length === 0 ? (
                  <div className="text-center py-8 border-[3px] border-dashed border-muted rounded-lg bg-muted/5">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No formulas yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {clientFormulas.map((formula) => (
                      <Card 
                        key={formula.id}
                        className="border-[2px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] bg-gradient-to-br from-card to-primary/5"
                      >
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-semibold text-sm mb-1 text-primary">
                                {formula.color_line || "Custom Formula"}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(formula.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {formula.formula_text && (
                            <p className="text-sm bg-background/50 p-2 rounded border border-border">
                              {formula.formula_text}
                            </p>
                          )}
                          {formula.result_notes && (
                            <p className="text-xs text-muted-foreground italic">
                              {formula.result_notes}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
