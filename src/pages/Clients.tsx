import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useOptimizedCallback } from "@/hooks/useOptimizedCallback";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useClients, useCreateClient, useUpdateClient, useDeleteClient, useBulkDeleteClients } from "@/hooks/useClients";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Mail, Phone, User, UserPlus, Filter, Edit, FileText, Calendar, X, Download, Trash2, AlertTriangle, Users } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { exportToCSV, formatDataForExport } from "@/lib/csvExport";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { Breadcrumbs } from "@/components/shared";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InviteClientDialog } from "@/components/clients";
import { SearchInput } from "@/components/SearchInput";
import { ClientCardSkeleton } from "@/components/LoadingSkeleton";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { useDebounce } from "@/hooks/useDebounce";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared";
import { ContextualAI } from "@/components/ContextualAI";
import { showCelebration } from "@/components/CelebrationToast";
import { HairMemoryTimeline } from "@/components/HairMemoryTimeline";
import { HelpTooltip } from "@/components/shared";
import { ClientHistoryTimeline, ClientCSVImport, ClientRiskIndicator } from "@/components/clients";
import { BulkActionsBar } from "@/components/admin/BulkActionsBar";
import { CSVImportDialog } from "@/components/admin/CSVImportDialog";
import { AIFeatureErrorBoundary } from "@/components/AIFeatureErrorBoundary";
import { AIMessageComposer } from "@/components/ai";
import { HairPhotoAnalyzer } from "@/components/HairPhotoAnalyzer";
import { HairPhotoAnalysis } from "@/components/client/HairPhotoAnalysis";
import { FormulaSuggestions } from "@/components/formulas/FormulaSuggestions";
import { clientSchema } from "@/lib/validation/clientSchemas";
import { usePagination } from "@/hooks/usePagination";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { networkErrors, dataErrors } from "@/lib/errorMessages";
import { SaveIndicator } from "@/components/SaveIndicator";
import { ReEngagementDialog } from "@/components/ReEngagementDialog";
import { ClientActivityIndicator } from "@/components/ClientActivityIndicator";
import { VirtualList } from "@/components/VirtualList";
import { ClientCard } from "@/components/ClientCard";

interface ClientProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  hair_type: string | null;
  allergies: string | null;
  notes: string | null;
  created_at: string;
  total_appointments?: number;
  last_appointment_date?: string | null;
  completed_appointments?: number;
  upcoming_appointments?: number;
}

export default function Clients() {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [stylistId, setStylistId] = useState<string | null>(null);
  const [stylistName, setStylistName] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  const handleSearchChange = useOptimizedCallback((value: string) => {
    setSearchQuery(value);
  }, []);
  const [sortBy, setSortBy] = useState<"name" | "recent" | "inactive">("recent");
  const [riskFilter, setRiskFilter] = useState<"all" | "60" | "90" | "120">("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
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
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // React Query hooks with pagination
  const { data: clientsData, isLoading: loading, refetch: refetchClients } = useClients(stylistId);
  const clients = clientsData?.clients || [];
  const totalClients = clientsData?.total || 0;
  
  const createClientMutation = useCreateClient(stylistId || '');
  const updateClientMutation = useUpdateClient(stylistId || '');
  const deleteClientMutation = useDeleteClient(stylistId || '');
  const bulkDeleteMutation = useBulkDeleteClients(stylistId || '');

  // Bulk selection
  const {
    selectedIds,
    selectedCount,
    isSelected,
    toggleSelection,
    clearSelection,
  } = useBulkSelection(clients);

  useEffect(() => {
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
          .maybeSingle();

        if (stylistProfile) {
          setStylistId(stylistProfile.id);
          setStylistName(stylistProfile.user?.full_name || "");
        } else {
          toast.info("This feature is for stylists", {
            description: "The Client Management page is designed for hair stylists to manage their clients."
          });
        }
      } catch (error) {
        console.error("Error loading stylist profile:", error);
        toast.error("Failed to load profile");
      }
    };
    
    loadStylistProfile();
  }, [navigate]);

  // Global keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrlKey: true,
      description: 'New client',
      action: () => !isDialogOpen && setIsDialogOpen(true),
    },
    {
      key: 'e',
      ctrlKey: true,
      description: 'Export clients',
      action: () => handleExportCSV(),
    },
  ]);

  useEffect(() => {
    const handleOpenDialog = () => {
      setIsDialogOpen(true);
    };
    const handleSearchFocus = () => {
      searchInputRef.current?.focus();
    };
    window.addEventListener('open-add-client-dialog', handleOpenDialog);
    window.addEventListener('global-search-focus', handleSearchFocus);
    return () => {
      window.removeEventListener('open-add-client-dialog', handleOpenDialog);
      window.removeEventListener('global-search-focus', handleSearchFocus);
    };
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stylistId) return;

    try {
      const validatedData = clientSchema.parse({
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone || null,
        hair_type: formData.hair_type || null,
        allergies: formData.allergies || null,
        notes: formData.notes || null,
        preferred_stylist_id: stylistId
      });

      await createClientMutation.mutateAsync({
        preferred_stylist_id: stylistId,
        full_name: validatedData.full_name.trim(),
        email: validatedData.email?.trim() || null,
        phone: validatedData.phone?.trim() || null,
        hair_type: validatedData.hair_type?.trim() || null,
        allergies: validatedData.allergies?.trim() || null,
        notes: validatedData.notes?.trim() || null,
      });

      showCelebration("client-added", undefined, clients.length + 1);
      setIsDialogOpen(false);
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        hair_type: "",
        allergies: "",
        notes: "",
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        toast.error(firstError.message);
      }
    }
  };

  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient) return;

    try {
      const validatedData = clientSchema.parse({
        full_name: editFormData.full_name,
        email: editFormData.email || null,
        phone: editFormData.phone || null,
        hair_type: editFormData.hair_type || null,
        allergies: editFormData.allergies || null,
        notes: editFormData.notes || null
      });

      setSaveStatus("saving");
      
      await updateClientMutation.mutateAsync({
        id: selectedClient.id,
        full_name: validatedData.full_name.trim(),
        email: validatedData.email?.trim() || null,
        phone: validatedData.phone?.trim() || null,
        hair_type: validatedData.hair_type?.trim() || null,
        allergies: validatedData.allergies?.trim() || null,
        notes: validatedData.notes?.trim() || null,
      });

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
      setEditDialogOpen(false);
    } catch (error: any) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
      
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        toast.error(firstError.message);
      }
    }
  };

  // Filter and sort clients (memoized)
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

    // Risk filter - at-risk clients by days since last appointment
    if (riskFilter !== "all") {
      const daysAgo = parseInt(riskFilter);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      
      filtered = filtered.filter(client => 
        !client.last_appointment_date || 
        new Date(client.last_appointment_date) < cutoffDate
      );
    }

    // Inactive filter (90+ days since last appointment)
    if (sortBy === "inactive") {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      filtered = filtered.filter(client => 
        !client.last_appointment_date || 
        new Date(client.last_appointment_date) < ninetyDaysAgo
      );
    }

    // Sort
    if (sortBy === "name") {
      filtered = [...filtered].sort((a, b) =>
        (a.full_name || "").localeCompare(b.full_name || "")
      );
    } else if (sortBy === "recent") {
      filtered = [...filtered].sort((a, b) => {
        if (!a.last_appointment_date) return 1;
        if (!b.last_appointment_date) return -1;
        return new Date(b.last_appointment_date).getTime() - new Date(a.last_appointment_date).getTime();
      });
    }

    return filtered;
  }, [clients, debouncedSearch, sortBy, riskFilter]);

  // Export callback (depends on filteredClients)
  const handleExportCSV = useCallback(() => {
    if (filteredClients.length === 0) {
      toast.error("No clients to export");
      return;
    }
    
    const exportData = filteredClients.map(c => ({
      name: c.full_name || "",
      email: c.email || "",
      phone: c.phone || "",
      hair_type: c.hair_type || "",
      allergies: c.allergies || "",
      total_appointments: c.total_appointments || 0,
      last_appointment: c.last_appointment_date 
        ? new Date(c.last_appointment_date).toLocaleDateString()
        : "Never",
      days_since_last: c.last_appointment_date
        ? Math.floor((new Date().getTime() - new Date(c.last_appointment_date).getTime()) / (1000 * 60 * 60 * 24))
        : "N/A",
    }));
    
    exportToCSV(exportData, "clients");
    toast.success("Clients exported!");
  }, [filteredClients]);

  // Pagination
  const {
    currentPage,
    pageSize,
    totalPages,
    canGoNext,
    canGoPrevious,
    goToPage,
    nextPage,
    previousPage,
    setPageSize,
    getPaginatedData,
    paginationInfo,
  } = usePagination<ClientProfile>({
    totalItems: filteredClients.length,
    initialPageSize: typeof window !== 'undefined' && window.innerWidth < 768 ? 25 : 50,
  });

  const paginatedClients = useMemo(
    () => getPaginatedData(filteredClients),
    [filteredClients, getPaginatedData]
  );

  const handleBulkDelete = async () => {
    if (selectedCount === 0) return;
    
    const clientIds = Array.from(selectedIds);
    
    const { count: formulaCount } = await supabase
      .from("formulas")
      .select("*", { count: "exact", head: true })
      .in("client_id", clientIds);
    
    const { count: appointmentCount } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .in("client_id", clientIds);
    
    const message = `Delete ${selectedCount} client${selectedCount !== 1 ? 's' : ''}?\n\nThis will also delete:\n• ${formulaCount || 0} formula${(formulaCount || 0) !== 1 ? 's' : ''}\n• ${appointmentCount || 0} appointment${(appointmentCount || 0) !== 1 ? 's' : ''}`;
    
    if (!confirm(message)) return;

    try {
      await bulkDeleteMutation.mutateAsync(clientIds);
      clearSelection();
    } catch (error) {
      console.error("Error deleting clients:", error);
    }
  };

  const getDaysSinceLastVisit = (lastAppointmentDate: string | null): number | null => {
    if (!lastAppointmentDate) return null;
    const days = Math.floor((new Date().getTime() - new Date(lastAppointmentDate).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <PageHeader title="Clients" icon={<Users className="h-6 w-6" />} backTo="/dashboard" />
        <div className="container mx-auto py-8 px-4">
          <SkeletonList count={9} variant="grid" />
        </div>
      </div>
    );
  }

  // Show empty state for non-stylists
  if (!stylistId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <PageHeader title="Clients" icon={<Users className="h-6 w-6" />} backTo="/dashboard" />
        <main className="container mx-auto py-8 px-4">
          <EmptyState
            icon={Users}
            title="This Feature is for Stylists"
            description="Client Management is designed for hair stylists to manage their client profiles, track formulas, and maintain relationships. If you're a stylist, please make sure you've completed your stylist profile setup."
            actionLabel="Go to Dashboard"
            onAction={() => navigate("/dashboard")}
            gradient="bg-[image:var(--gradient-purple-pink)]"
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg">
        Skip to main content
      </a>
      <PageHeader title="Clients" icon={<Users className="h-6 w-6" />} backTo="/dashboard" />
      <main id="main-content" role="main" aria-label="Clients" className="container mx-auto py-8 px-4">
        
        {/* CSV Import - Week 2 Feature */}
        {stylistId && (
          <>
            <ClientCSVImport stylistId={stylistId} onImportComplete={() => refetchClients()} />
            <CSVImportDialog />
          </>
        )}

        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-pixel mb-2 gradient-text break-words">Clients & Formulas</h1>
            <p className="text-sm sm:text-base text-muted-foreground font-sans">Manage your client profiles, formulas, and preferences</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Re-engagement Campaign Button - Shows when clients selected */}
            {selectedCount > 0 && stylistId && (
              <ReEngagementDialog
                selectedClients={filteredClients.filter(c => selectedIds.has(c.id))}
                stylistId={stylistId}
              />
            )}
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={filteredClients.length === 0}
              className="gap-1.5 xs:gap-2 text-xs xs:text-sm min-h-[44px] flex-1 xs:flex-none"
            >
              <Download className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
              <span className="hidden xxs:inline">Export</span>
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate("/formulas")}
              className="gap-1.5 xs:gap-2 text-xs xs:text-sm min-h-[44px] flex-1 xs:flex-none border-[2px] xs:border-[3px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] xs:shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px] xs:hover:translate-x-[2px] xs:hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_hsl(var(--foreground))] xs:hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] transition-all"
            >
              <FileText className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
              <span className="hidden xxs:inline">Formulas</span>
            </Button>
            <Button 
              onClick={() => setInviteDialogOpen(true)} 
              variant="outline"
              className="gap-1.5 xs:gap-2 text-xs xs:text-sm min-h-[44px] flex-1 xs:flex-none border-[2px] xs:border-[3px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] xs:shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px] xs:hover:translate-x-[2px] xs:hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_hsl(var(--foreground))] xs:hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] transition-all"
            >
              <UserPlus className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
              <span className="hidden sm:inline">Invite</span>
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1.5 xs:gap-2 text-xs xs:text-sm min-h-[44px] flex-1 xs:flex-none border-[2px] xs:border-[3px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] xs:shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px] xs:hover:translate-x-[2px] xs:hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_hsl(var(--foreground))] xs:hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] transition-all">
                  <Plus className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
                  <span className="hidden xxs:inline">Add</span>
                </Button>
              </DialogTrigger>
          <DialogContent className="max-w-[calc(100vw-2rem)] xs:max-w-md max-h-[85vh] xs:max-h-[90vh] overflow-y-auto border-[2px] xs:border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] xs:shadow-[6px_6px_0px_0px_hsl(var(--foreground))]">
            <DialogHeader>
              <DialogTitle className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-pixel gradient-text break-words">Add a New Client</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3 xs:space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <HelpTooltip
                    title="Client Name"
                    content={{
                      stylist: "Their full name so you can easily find them. First and last name helps avoid confusion with clients who have similar names."
                    }}
                  />
                </div>
                <Input
                  id="full_name"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter client's name"
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
                <div className="flex items-center gap-2">
                  <Label htmlFor="hair_type">Hair Type</Label>
                  <HelpTooltip
                    title="Hair Type & Texture"
                    content={{
                      stylist: "Document their natural texture and porosity. This helps you formulate correctly and remember their hair characteristics between visits."
                    }}
                    examples={[
                      "3C Curly, High Porosity",
                      "Fine Straight, Low Porosity",
                      "Coarse Wavy, Medium Porosity",
                      "Type 4 Coily, Color-Treated"
                    ]}
                  />
                </div>
                <Input
                  id="hair_type"
                  value={formData.hair_type}
                  onChange={(e) => setFormData({ ...formData, hair_type: e.target.value })}
                  placeholder="e.g., 3C Curly, Fine Straight"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="allergies">Allergies & Sensitivities</Label>
                  <HelpTooltip
                    title="Allergies & Sensitivities"
                    content={{
                      stylist: "CRITICAL safety information. Always ask about PPD, ammonia, and fragrance sensitivities. Document any past reactions to products or chemicals."
                    }}
                    tips={[
                      "Ask: 'Have you ever had a reaction to hair color?'",
                      "Note if they've had patch tests before",
                      "Include scalp sensitivities (dry, oily, sensitive)",
                      "Better to over-document than miss something!"
                    ]}
                  />
                </div>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="PPD, ammonia, or other known sensitivities"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <HelpTooltip
                    title="Client Notes"
                    content={{
                      stylist: "Your personal notes about the client. What they like, don't like, goals, lifestyle, preferences - anything that helps you give them better service."
                    }}
                    examples={[
                      "Prefers warm tones, hates brass",
                      "Works from home, low-maintenance preferred",
                      "Getting married in 6 months - growing hair out",
                      "Budget-conscious, books every 12 weeks"
                    ]}
                  />
                </div>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Preferences, goals, or important details to remember"
                />
              </div>
              <Button type="submit" className="w-full">Add Client</Button>
            </form>
          </DialogContent>
        </Dialog>
          </div>
        </div>

        {/* Contextual AI Suggestions */}
        <ContextualAI
          context="client"
          data={{ recentFormulas: clientFormulas }}
          onAction={(action) => {
            if (action === "organize-formulas") {
              toast.info("Formula organization feature coming soon!");
            }
          }}
        />

        {/* AI Message Composer - For first selected client */}
        {selectedCount > 0 && clients.length > 0 && (
          <div className="mb-6">
            <AIFeatureErrorBoundary featureName="message_composer">
              <AIMessageComposer
                clientName={clients.find(c => c.id === Array.from(selectedIds)[0])?.full_name || "Client"}
                stylistName={stylistName}
                lastVisit={clients.find(c => c.id === Array.from(selectedIds)[0])?.last_appointment_date || undefined}
                onSendMessage={(message) => {
                  toast.success("Message ready to send!");
                }}
              />
            </AIFeatureErrorBoundary>
          </div>
        )}

        {/* Keyboard shortcut hints */}
        <div className="flex justify-end text-[10px] xs:text-xs sm:text-sm text-muted-foreground gap-4">
          <span>
            <kbd className="px-2 py-1 font-semibold bg-muted rounded border">Ctrl+N</kbd> New client
          </span>
          <span>
            <kbd className="px-2 py-1 font-semibold bg-muted rounded border">Ctrl+E</kbd> Export
          </span>
          <span>
            <kbd className="px-2 py-1 font-semibold bg-muted rounded border">/</kbd> or <kbd className="px-2 py-1 font-semibold bg-muted rounded border">Ctrl+K</kbd> Search
          </span>
        </div>

        {/* Active Filter Indicator */}
        {riskFilter !== "all" && (
          <Card className="border-2 border-destructive bg-destructive/5">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-xs sm:text-sm font-medium">
                  Showing at-risk clients: Not seen in {riskFilter}+ days
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRiskFilter("all")}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

            {/* Search and Filters - Mobile responsive */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in w-full">
              <SearchInput
            ref={searchInputRef}
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, email, or phone number (Press / or Cmd+K)"
            className="flex-1 brutal-border min-h-[44px]"
          />
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-48 brutal-border min-h-[44px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="inactive">Inactive (90+ days)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={riskFilter} onValueChange={(value: any) => setRiskFilter(value)}>
            <SelectTrigger className={cn(
              "w-full sm:w-48 brutal-border min-h-[44px]",
              riskFilter !== "all" ? "border-destructive bg-destructive/5" : ""
            )}>
              <SelectValue placeholder="At-Risk Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              <SelectItem value="60">Not seen 60+ days</SelectItem>
              <SelectItem value="90">Not seen 90+ days</SelectItem>
              <SelectItem value="120">Not seen 120+ days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions Bar - New Component */}
        <BulkActionsBar
          selectedIds={Array.from(selectedIds)}
          onClearSelection={clearSelection}
          onRefresh={() => refetchClients()}
          type="clients"
        />

        {filteredClients.length === 0 ? (
          searchQuery || sortBy !== "recent" || riskFilter !== "all" ? (
            <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] bg-secondary/5">
              <CardContent className="py-12 text-center">
                {riskFilter !== "all" ? (
                  <>
                    <User className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <h3 className="text-base sm:text-lg md:text-xl font-pixel mb-2">Great News! 🎉</h3>
                    <p className="text-muted-foreground font-sans mb-4">
                      No at-risk clients found - you're doing an amazing job keeping your clients engaged!
                    </p>
                  </>
                ) : (
                  <>
                    <User className="h-12 w-12 mx-auto mb-4 text-secondary" />
                    <h3 className="text-base sm:text-lg md:text-xl font-pixel mb-2">No matches found</h3>
                    <p className="text-muted-foreground font-sans mb-4">
                      Try adjusting your search criteria or clear the filters
                    </p>
                  </>
                )}
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => { setSearchQuery(""); setSortBy("recent"); setRiskFilter("all"); }}
                    className="border-[2px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] transition-all"
                  >
                    Clear All Filters
                  </Button>
                  <Button 
                    onClick={() => setIsDialogOpen(true)}
                    className="gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add New Client
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="py-16 px-4">
              <div className="relative mb-6 inline-block">
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 rounded-full border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
                  <User className="h-16 w-16 text-primary" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-secondary p-2 rounded-full border-2 border-foreground">
                  <span className="text-xl sm:text-2xl md:text-3xl" role="img" aria-label="sparkles">✨</span>
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-pixel mb-2 gradient-text">Your Client Roster Awaits!</h3>
              <p className="text-muted-foreground font-sans mb-6 max-w-md mx-auto">
                Build your dream client list! Track hair profiles, preferences, and formula history all in one beautiful place
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                size="lg"
                className="gap-2 hover-scale border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] transition-all"
              >
                <UserPlus className="h-5 w-5" />
                Add Your First Client
              </Button>
            </div>
          )
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground font-pixel">{paginationInfo}</span>
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-32 border-[2px] border-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <VirtualList
              items={paginatedClients}
              estimateSize={280}
              overscan={2}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              renderItem={(client) => (
                <ClientCard
                  client={client}
                  isSelected={isSelected(client.id)}
                  onToggleSelection={toggleSelection}
                  onEdit={() => openEditDialog(client)}
                  onViewHistory={() => {
                    setSelectedClientId(client.id);
                    setHistoryDialogOpen(true);
                  }}
                  onViewNotes={() => openEditDialog(client)}
                />
              )}
            />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={previousPage}
                      className={cn(
                        "cursor-pointer border-[2px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]",
                        !canGoPrevious && "opacity-50 cursor-not-allowed"
                      )}
                      aria-disabled={!canGoPrevious}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => goToPage(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer border-[2px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={nextPage}
                      className={cn(
                        "cursor-pointer border-[2px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]",
                        !canGoNext && "opacity-50 cursor-not-allowed"
                      )}
                      aria-disabled={!canGoNext}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
          </>
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-[3px] border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-pixel gradient-text">Client Profile</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info">Info & Formulas</TabsTrigger>
                <TabsTrigger value="ai" className="relative">
                  AI Analysis
                  <Badge variant="secondary" className="ml-2 text-[10px] px-1 py-0 h-4 bg-gradient-to-r from-primary to-accent border-0 animate-pulse">
                    NEW
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="timeline">Hair Journey</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
              {/* Client Info Form */}
              <div>
                <h3 className="text-base sm:text-lg md:text-xl font-pixel mb-4 text-secondary">Client Information</h3>
                <form onSubmit={handleEditClient} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_full_name">Full Name *</Label>
                    <Input
                      id="edit_full_name"
                      required
                      value={editFormData.full_name}
                      onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                      placeholder="Enter client's name"
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
                    <Label htmlFor="edit_allergies">Allergies & Sensitivities</Label>
                    <Textarea
                      id="edit_allergies"
                      value={editFormData.allergies}
                      onChange={(e) => setEditFormData({ ...editFormData, allergies: e.target.value })}
                      placeholder="PPD, ammonia, or other known sensitivities"
                      className="border-[2px] border-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_notes">Additional Notes</Label>
                    <Textarea
                      id="edit_notes"
                      value={editFormData.notes}
                      onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                      placeholder="Preferences, goals, or important details to remember"
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
                <h3 className="text-base sm:text-lg md:text-xl font-pixel mb-4 text-primary flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Formula History ({clientFormulas.length})
                </h3>
                
                {clientFormulas.length === 0 ? (
                  <div className="text-center py-8 border-[3px] border-dashed border-muted rounded-lg bg-muted/5">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-xs sm:text-sm text-muted-foreground">No formulas created yet</p>
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
              </TabsContent>
              
              <TabsContent value="ai" className="space-y-6">
                {selectedClient && stylistId && (
                  <>
                    <FormulaSuggestions 
                      clientId={selectedClient.id}
                      stylistId={stylistId}
                      onUseRecommendation={(rec) => {
                        toast.success("Formula Copied", {
                          description: "You can now create a new formula with this recommendation",
                        });
                      }}
                    />
                    <HairPhotoAnalysis 
                      clientId={selectedClient.id}
                      onAnalysisComplete={(result) => {
                        // Analysis complete
                        toast.success("Analysis Complete");
                      }}
                    />
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="timeline">
                {selectedClient && <HairMemoryTimeline clientId={selectedClient.id} />}
              </TabsContent>
              
              <TabsContent value="appointments">
                <p className="text-xs sm:text-sm text-muted-foreground">Appointment history coming soon</p>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Client History Dialog */}
        <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Client History</DialogTitle>
            </DialogHeader>
            {selectedClientId && <ClientHistoryTimeline clientId={selectedClientId} />}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
