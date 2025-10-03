import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Mail, Phone, User, ArrowLeft, UserPlus, Filter } from "lucide-react";
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">My Clients</h1>
          <p className="text-muted-foreground">Manage your client profiles and information</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
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
          className="flex-1"
        />
        <Select value={sortBy} onValueChange={(value: "name" | "recent") => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-48">
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
          <Card>
            <CardContent className="py-12 text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No clients match your search</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search terms
              </p>
              <Button variant="outline" onClick={() => { setSearchQuery(""); setSortBy("recent"); }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No clients yet</h3>
              <p className="text-muted-foreground mb-4">
                Start adding client profiles to keep track of their hair information
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Client
              </Button>
            </CardContent>
          </Card>
        )
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {client.full_name || "Unnamed Client"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {client.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.hair_type && (
                  <div className="text-sm">
                    <span className="font-semibold">Hair Type:</span> {client.hair_type}
                  </div>
                )}
                {client.allergies && (
                  <div className="text-sm">
                    <span className="font-semibold">Allergies:</span> {client.allergies}
                  </div>
                )}
                {client.notes && (
                  <div className="text-sm text-muted-foreground mb-3">
                    {client.notes}
                  </div>
                )}
                {client.email && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedClient(client);
                      setInviteDialogOpen(true);
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite to App
                  </Button>
                )}
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
    </div>
  );
}
