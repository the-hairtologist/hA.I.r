import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { Plus, Loader2, Search, Edit, Save, Trash2, UserPlus, Palette, Mic, Copy, Tag as TagIcon, X, Clock, Beaker, FileText, ThumbsUp, AlertTriangle, Download, ArrowUpDown } from "lucide-react";
import { exportToCSV, formatDataForExport } from "@/lib/csvExport";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useGlobalKeyboardShortcuts } from "@/hooks/useGlobalKeyboardShortcuts";
import { AddClientDialog } from "@/components/AddClientDialog";
import { useKeyboardShortcut, SHORTCUTS } from "@/hooks/useKeyboardShortcut";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { VoiceInput } from "@/components/VoiceInput";
import { ContextualAI } from "@/components/ContextualAI";
import { showCelebration } from "@/components/CelebrationToast";
import { AIDisclaimer } from "@/components/AIDisclaimer";
import { AudioGuidePlayer } from "@/components/AudioGuidePlayer";
import { FormulaFiltersComponent, FormulaFilters } from "@/components/FormulaFilters";
import { PrerequisiteCheck } from "@/components/PrerequisiteCheck";
import { EnhancedSearch, HighlightedText, fuzzyMatch } from "@/components/EnhancedSearch";
import { cn } from "@/lib/utils";

const Formulas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formulas, setFormulas] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [stylistProfile, setStylistProfile] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingFormula, setEditingFormula] = useState<any>(null);
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [addClientDialogOpen, setAddClientDialogOpen] = useState(false);
  const [filters, setFilters] = useState<FormulaFilters>({
    clientId: "",
    colorLine: "",
    dateRange: "all",
    sortBy: "date-desc",
    tags: [],
  });
  const [processingTimeSort, setProcessingTimeSort] = useState<"asc" | "desc" | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [selectedFormulas, setSelectedFormulas] = useState<Set<string>>(new Set());
  
  // Form state
  const [selectedClient, setSelectedClient] = useState("");
  const [formulaText, setFormulaText] = useState("");
  const [instructions, setInstructions] = useState("");
  const [colorLine, setColorLine] = useState("");
  const [resultNotes, setResultNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  // New structured fields
  const [processingTime, setProcessingTime] = useState("");
  const [developerVolume, setDeveloperVolume] = useState("");
  const [applicationNotes, setApplicationNotes] = useState("");
  const [whatWorked, setWhatWorked] = useState("");
  const [whatToAvoid, setWhatToAvoid] = useState("");

  useEffect(() => {
    loadData();
  }, []);
  
  // Global keyboard shortcuts
  useGlobalKeyboardShortcuts([
    {
      key: 'n',
      ctrl: true,
      description: 'New formula',
      action: () => !dialogOpen && setDialogOpen(true),
    },
    {
      key: 'e',
      ctrl: true,
      description: 'Export formulas',
      action: () => handleExportCSV(),
    },
  ]);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Get stylist profile
      const { data: stylist } = await supabase
        .from("stylist_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (!stylist) {
        toast.error("Stylist profile not found");
        navigate("/dashboard");
        return;
      }

      setStylistProfile(stylist);

      // Get formulas
      const { data: formulasData } = await supabase
        .from("formulas")
        .select(`
          *,
          client:client_profiles(
            id,
            full_name,
            email
          )
        `)
        .eq("stylist_id", stylist.id)
        .order("created_at", { ascending: false });

      setFormulas(formulasData || []);

      // Get clients
      const { data: clientsData } = await supabase
        .from("client_profiles")
        .select("id, full_name, email")
        .eq("preferred_stylist_id", stylist.id)
        .order("full_name");

      setClients(clientsData || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Error loading formulas");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFormula = async () => {
    if (!selectedClient || !formulaText) {
      toast.error("Pick a client and add your formula magic! ✨");
      return;
    }

    try {
      const formulaData = {
        formula_text: formulaText,
        instructions,
        color_line: colorLine,
        result_notes: resultNotes,
        tags: tags.length > 0 ? tags : null,
        processing_time_minutes: processingTime ? parseInt(processingTime) : null,
        developer_volume: developerVolume || null,
        application_notes: applicationNotes || null,
        what_worked: whatWorked || null,
        what_to_avoid: whatToAvoid || null,
      };

      if (editingFormula) {
        // Update existing formula
        const { error } = await supabase
          .from("formulas")
          .update(formulaData)
          .eq("id", editingFormula.id);

        if (error) throw error;
        toast.success("Formula updated successfully!");
      } else {
        // Create new formula
        const { error } = await supabase
          .from("formulas")
          .insert({
            stylist_id: stylistProfile.id,
            client_id: selectedClient,
            ...formulaData,
          });

        if (error) throw error;
        
        // Show celebration
        showCelebration("formula-saved", undefined, formulas.length + 1);
      }

      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error("Error saving formula:", error);
      toast.error("Error saving formula");
    }
  };

  const handleEditFormula = (formula: any) => {
    setEditingFormula(formula);
    setSelectedClient(formula.client_id);
    setFormulaText(formula.formula_text || "");
    setInstructions(formula.instructions || "");
    setColorLine(formula.color_line || "");
    setResultNotes(formula.result_notes || "");
    setTags(formula.tags || []);
    setProcessingTime(formula.processing_time_minutes?.toString() || "");
    setDeveloperVolume(formula.developer_volume || "");
    setApplicationNotes(formula.application_notes || "");
    setWhatWorked(formula.what_worked || "");
    setWhatToAvoid(formula.what_to_avoid || "");
    setDialogOpen(true);
  };

  const handleDuplicateFormula = (formula: any) => {
    setEditingFormula(null); // Not editing, creating new
    setSelectedClient(formula.client_id);
    setFormulaText(formula.formula_text || "");
    setInstructions(formula.instructions || "");
    setColorLine(formula.color_line || "");
    setResultNotes(formula.result_notes || "");
    setTags(formula.tags || []);
    setProcessingTime(formula.processing_time_minutes?.toString() || "");
    setDeveloperVolume(formula.developer_volume || "");
    setApplicationNotes(formula.application_notes || "");
    setWhatWorked(formula.what_worked || "");
    setWhatToAvoid(formula.what_to_avoid || "");
    setDialogOpen(true);
    toast.success("Formula duplicated! Make any changes and save.");
  };

  const handleDeleteFormula = async (formulaId: string) => {
    if (!confirm("Are you sure you want to delete this formula?")) return;

    try {
      const { error } = await supabase
        .from("formulas")
        .delete()
        .eq("id", formulaId);

      if (error) throw error;
      toast.success("Formula deleted successfully!");
      loadData();
    } catch (error: any) {
      console.error("Error deleting formula:", error);
      toast.error("Error deleting formula");
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingFormula(null);
    setSelectedClient("");
    setFormulaText("");
    setInstructions("");
    setColorLine("");
    setResultNotes("");
    setTags([]);
    setTagInput("");
    setProcessingTime("");
    setDeveloperVolume("");
    setApplicationNotes("");
    setWhatWorked("");
    setWhatToAvoid("");
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim().toLowerCase();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const filteredFormulas = useMemo(() => {
    let filtered = formulas;

    // Enhanced fuzzy text search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(formula =>
        fuzzyMatch(formula.client?.full_name || "", searchTerm, 2) ||
        fuzzyMatch(formula.client?.email || "", searchTerm, 2) ||
        fuzzyMatch(formula.formula_text || "", searchTerm, 2) ||
        fuzzyMatch(formula.color_line || "", searchTerm, 2) ||
        formula.tags?.some((tag: string) => fuzzyMatch(tag, searchTerm, 1))
      );
    }

    // Client filter
    if (filters.clientId) {
      filtered = filtered.filter(f => f.client_id === filters.clientId);
    }

    // Color line filter
    if (filters.colorLine) {
      filtered = filtered.filter(f => f.color_line === filters.colorLine);
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case "week":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(f => new Date(f.created_at) >= cutoffDate);
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(f =>
        f.tags && f.tags.some((tag: string) => filters.tags.includes(tag))
      );
    }

    // Sort by processing time if enabled
    if (processingTimeSort) {
      filtered.sort((a, b) => {
        const aTime = a.processing_time_minutes || 0;
        const bTime = b.processing_time_minutes || 0;
        return processingTimeSort === "asc" ? aTime - bTime : bTime - aTime;
      });
    } else {
      // Regular sort
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case "date-desc":
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case "date-asc":
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case "client-asc":
            return (a.client?.full_name || "").localeCompare(b.client?.full_name || "");
          case "client-desc":
            return (b.client?.full_name || "").localeCompare(a.client?.full_name || "");
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [formulas, searchTerm, filters]);

  // Extract unique color lines and tags
  const uniqueColorLines = useMemo(() => {
    const lines = formulas
      .map(f => f.color_line)
      .filter((line): line is string => !!line);
    return Array.from(new Set(lines)).sort();
  }, [formulas]);

  const availableTags = useMemo(() => {
    const allTags = formulas
      .flatMap(f => f.tags || [])
      .filter((tag): tag is string => !!tag);
    return Array.from(new Set(allTags)).sort();
  }, [formulas]);

  const selectedClientData = clients.find(c => c.id === selectedClient);

  const handleExportCSV = () => {
    if (filteredFormulas.length === 0) {
      toast.error("No formulas to export");
      return;
    }
    
    const exportData = filteredFormulas.map(f => ({
      client_name: f.client?.full_name || "",
      formula: f.formula_text || "",
      color_line: f.color_line || "",
      processing_time: f.processing_time_minutes || "",
      instructions: f.instructions || "",
      result_notes: f.result_notes || "",
      tags: f.tags?.join(", ") || "",
      created_at: new Date(f.created_at).toLocaleDateString(),
    }));
    
    exportToCSV(exportData, "formulas");
    toast.success("Formulas exported!");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Breadcrumbs />
          <SkeletonList count={8} variant="card" showHeader />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs />
        
        {/* AI Disclaimer */}
        <AIDisclaimer context="formula" />

        {/* Contextual AI Suggestions */}
        {selectedClient && (
          <ContextualAI
            context="formula"
            data={{ clientId: selectedClient }}
            onAction={(action) => {
              if (action === "load-last-formula") {
                const lastFormula = formulas.find(f => f.client_id === selectedClient);
                if (lastFormula) {
                  setFormulaText(lastFormula.formula_text || "");
                  setInstructions(lastFormula.instructions || "");
                  setColorLine(lastFormula.color_line || "");
                  toast.success("Last formula loaded!");
                }
              }
            }}
          />
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Client Formulas</h1>
            <p className="text-muted-foreground">View and manage your client formulas</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleExportCSV}
              disabled={filteredFormulas.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setDialogOpen(true)} disabled={clients.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Add Formula
            </Button>
          </div>
        </div>

        {/* Show prerequisite alert if no clients */}
        {clients.length === 0 && (
          <PrerequisiteCheck type="clients" />
        )}

        {/* Keyboard shortcut hint */}
        <div className="flex justify-end">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">Ctrl</kbd> + <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">N</kbd> to add new formula
          </p>
        </div>

        {/* Enhanced Search */}
        <EnhancedSearch
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search formulas by client, formula, tags, or color line..."
          storageKey="formulas_recent_searches"
          showRecentSearches={true}
        />

        {/* Filters */}
        {formulas.length > 0 && (
          <FormulaFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            clients={clients}
            colorLines={uniqueColorLines}
            availableTags={availableTags}
          />
        )}

            {/* Bulk Actions Bar */}
            {selectedFormulas.size > 0 && (
              <Card className="border-[3px] border-primary shadow-[4px_4px_0px_0px_hsl(var(--primary))] mb-4 bg-primary/5">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <span className="font-medium">
                    {selectedFormulas.size} formula{selectedFormulas.size !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (confirm(`Delete ${selectedFormulas.size} formula${selectedFormulas.size !== 1 ? 's' : ''}?`)) {
                          try {
                            const { error } = await supabase
                              .from("formulas")
                              .delete()
                              .in("id", Array.from(selectedFormulas));
                            
                            if (error) throw error;
                            toast.success(`${selectedFormulas.size} formula${selectedFormulas.size !== 1 ? 's' : ''} deleted`);
                            setSelectedFormulas(new Set());
                            loadData();
                          } catch (error) {
                            console.error("Error deleting formulas:", error);
                            toast.error("Failed to delete formulas");
                          }
                        }
                      }}
                    >
                      Delete Selected
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFormulas(new Set())}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Formulas List */}
            <div className="grid gap-4">
              {filteredFormulas.length === 0 ? (
            <div className="py-16 px-4 text-center animate-fade-in">
              <div className="relative mb-6 inline-block">
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 rounded-full border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
                  <Palette className="h-16 w-16 text-primary" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-secondary p-2 rounded-full border-2 border-foreground">
                  <span className="text-2xl" role="img" aria-label="magic">🔮</span>
                </div>
              </div>
              <h2 className="text-2xl font-display font-bold mb-2 gradient-text">
                Your Formula Library Awaits!
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? "No formulas match your search. Try different keywords or create a new formula!"
                  : clients.length === 0 
                    ? "Add clients first to start creating formulas. Each formula is tied to a specific client."
                    : "Start documenting your color formulas and never forget that perfect shade again"}
              </p>
              <Button 
                onClick={() => setDialogOpen(true)}
                size="lg"
                className="gap-2 hover-scale"
                disabled={clients.length === 0}
              >
                <Plus className="h-5 w-5" />
                Create Your First Formula
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">Ctrl</kbd> + <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">N</kbd> for quick access
              </p>
            </div>
          ) : (
              filteredFormulas.map((formula) => {
                const isSelected = selectedFormulas.has(formula.id);
                return (
                  <Card key={formula.id} className={cn(
                    "border-[3px] hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] hover:-translate-y-1 transition-all",
                    isSelected ? "border-primary ring-2 ring-primary" : "border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]"
                  )}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              const newSelected = new Set(selectedFormulas);
                              if (newSelected.has(formula.id)) {
                                newSelected.delete(formula.id);
                              } else {
                                newSelected.add(formula.id);
                              }
                              setSelectedFormulas(newSelected);
                            }}
                            className="h-5 w-5 rounded border-2 border-foreground cursor-pointer mt-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              <HighlightedText text={formula.client?.full_name || "Client"} query={searchTerm} />
                            </CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-2 mt-1">
                          {formula.client?.email && (
                            <HighlightedText text={formula.client.email} query={searchTerm} />
                          )}
                          {formula.color_line && (
                            <>
                              <span>•</span>
                              <HighlightedText text={formula.color_line} query={searchTerm} />
                            </>
                          )}
                          {formula.created_at && (
                            <span className="text-xs">• {new Date(formula.created_at).toLocaleDateString()}</span>
                          )}
                        </CardDescription>
                        {formula.tags && formula.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {formula.tags.map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicateFormula(formula)}
                          title="Duplicate formula"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditFormula(formula)}
                          title="Edit formula"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteFormula(formula.id)}
                          title="Delete formula"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      </div>
                    </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Formula:</p>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                      {formula.formula_text}
                    </p>
                  </div>
                  {formula.instructions && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium mb-1">Instructions:</p>
                      <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                        {formula.instructions}
                      </p>
                      <AudioGuidePlayer 
                        text={formula.instructions}
                        title={`Instructions for ${formula.client?.full_name || 'Client'}`}
                        voice="nova"
                      />
                    </div>
                  )}
                  {formula.result_notes && (
                    <div>
                      <p className="text-sm font-medium mb-1">Notes:</p>
                      <p className="text-sm text-muted-foreground">{formula.result_notes}</p>
                    </div>
                  )}

                  {/* Structured Details - Show if any exist */}
                  {(formula.processing_time_minutes || formula.developer_volume || formula.application_notes || formula.what_worked || formula.what_to_avoid) && (
                    <div className="border-t pt-3 space-y-3">
                      {/* Processing Details */}
                      {(formula.processing_time_minutes || formula.developer_volume) && (
                        <div className="flex flex-wrap gap-4 text-xs">
                           {formula.processing_time_minutes && (
                            <div 
                              className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md cursor-pointer hover:bg-muted/70"
                              onClick={(e) => {
                                e.stopPropagation();
                                setProcessingTimeSort(processingTimeSort === "asc" ? "desc" : "asc");
                              }}
                              title="Click to sort by processing time"
                            >
                              <Clock className="h-3 w-3 text-primary" />
                              <span className="font-medium">{formula.processing_time_minutes} min</span>
                              <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                            </div>
                          )}
                          {formula.developer_volume && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md">
                              <Beaker className="h-3 w-3 text-primary" />
                              <span className="font-medium">{formula.developer_volume}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Application Notes */}
                      {formula.application_notes && (
                        <div>
                          <p className="text-xs font-medium mb-1 flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Application
                          </p>
                          <p className="text-xs text-muted-foreground pl-4">{formula.application_notes}</p>
                        </div>
                      )}

                      {/* Success/Learnings */}
                      {(formula.what_worked || formula.what_to_avoid) && (
                        <div className="grid gap-2">
                          {formula.what_worked && (
                            <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded-md">
                              <p className="text-xs font-medium mb-1 flex items-center gap-1 text-green-700 dark:text-green-400">
                                <ThumbsUp className="h-3 w-3" />
                                What Worked
                              </p>
                              <p className="text-xs text-green-600 dark:text-green-500/80 pl-4">{formula.what_worked}</p>
                            </div>
                          )}
                          {formula.what_to_avoid && (
                            <div className="bg-amber-50 dark:bg-amber-950/20 p-2 rounded-md">
                              <p className="text-xs font-medium mb-1 flex items-center gap-1 text-amber-700 dark:text-amber-400">
                                <AlertTriangle className="h-3 w-3" />
                                What to Avoid
                              </p>
                              <p className="text-xs text-amber-600 dark:text-amber-500/80 pl-4">{formula.what_to_avoid}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
        </div>
      </div>

      {/* Add/Edit Formula Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFormula ? "Edit Formula" : "Add New Formula"}
            </DialogTitle>
            <DialogDescription>
              {editingFormula ? "Update the formula details" : "Create a new formula for a client"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Client Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Client *</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAddClientDialogOpen(true)}
                  className="h-auto py-1 px-2 text-xs gap-1"
                >
                  <UserPlus className="h-3 w-3" />
                  Add New
                </Button>
              </div>
              <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={clientSearchOpen}
                    className="w-full justify-between"
                    disabled={!!editingFormula}
                  >
                    {selectedClientData
                      ? (selectedClientData.full_name || selectedClientData.email || "Client")
                      : "Search and select a client..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search clients..." />
                    <CommandEmpty>
                      <div className="p-4 text-sm text-center">
                        <p className="text-muted-foreground mb-2">No clients found</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setClientSearchOpen(false);
                            setAddClientDialogOpen(true);
                          }}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Add New Client
                        </Button>
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {clients.map((client) => (
                        <CommandItem
                          key={client.id}
                          value={client.full_name || client.email || ""}
                          onSelect={() => {
                            setSelectedClient(client.id);
                            setClientSearchOpen(false);
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {client.full_name || "Client"}
                            </span>
                            {client.email && (
                              <span className="text-xs text-muted-foreground">{client.email}</span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Formula Text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="formula">Formula *</Label>
                <VoiceInput
                  variant="icon"
                  onTranscription={(text) => setFormulaText(prev => prev ? `${prev}\n${text}` : text)}
                />
              </div>
              <Textarea
                id="formula"
                placeholder="Enter the complete formula or use voice input..."
                value={formulaText}
                onChange={(e) => setFormulaText(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <Label htmlFor="instructions">Application Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Step-by-step application instructions..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Color Line */}
            <div className="space-y-2">
              <Label htmlFor="colorline">Color Line</Label>
              <Input
                id="colorline"
                placeholder="e.g., Wella, Redken"
                value={colorLine}
                onChange={(e) => setColorLine(e.target.value)}
              />
            </div>

            {/* Result Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Result Notes</Label>
              <Textarea
                id="notes"
                placeholder="Notes about the result..."
                value={resultNotes}
                onChange={(e) => setResultNotes(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Add tags (e.g., blonde, balayage, correction)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Structured Formula Details - Accordion */}
            <Accordion type="multiple" className="w-full">
              {/* Processing Details */}
              <AccordionItem value="processing">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Processing Details
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="processing-time" className="text-xs">
                        Processing Time (minutes)
                      </Label>
                      <Input
                        id="processing-time"
                        type="number"
                        placeholder="e.g., 30"
                        value={processingTime}
                        onChange={(e) => setProcessingTime(e.target.value)}
                        min="1"
                        max="180"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="developer-volume" className="text-xs">
                        Developer Volume
                      </Label>
                      <Input
                        id="developer-volume"
                        placeholder="e.g., 20 vol"
                        value={developerVolume}
                        onChange={(e) => setDeveloperVolume(e.target.value)}
                        list="developer-options"
                      />
                      <datalist id="developer-options">
                        <option value="10 vol" />
                        <option value="20 vol" />
                        <option value="30 vol" />
                        <option value="40 vol" />
                      </datalist>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Application Notes */}
              <AccordionItem value="application">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Beaker className="h-4 w-4" />
                    Application Notes
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="application-notes" className="text-xs">
                      How to Apply (optional)
                    </Label>
                    <Textarea
                      id="application-notes"
                      placeholder="e.g., Apply root to ends, section by section..."
                      value={applicationNotes}
                      onChange={(e) => setApplicationNotes(e.target.value)}
                      rows={3}
                      className="resize-none text-sm"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Success & Learnings */}
              <AccordionItem value="learnings">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Success & Learnings
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="what-worked" className="text-xs flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      What Worked Well
                    </Label>
                    <Textarea
                      id="what-worked"
                      placeholder="e.g., Perfect lift, even tone, client loved it..."
                      value={whatWorked}
                      onChange={(e) => setWhatWorked(e.target.value)}
                      rows={2}
                      className="resize-none text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="what-to-avoid" className="text-xs flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      What to Avoid Next Time
                    </Label>
                    <Textarea
                      id="what-to-avoid"
                      placeholder="e.g., Watch timing on roots, less developer needed..."
                      value={whatToAvoid}
                      onChange={(e) => setWhatToAvoid(e.target.value)}
                      rows={2}
                      className="resize-none text-sm"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button onClick={handleSaveFormula} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {editingFormula ? "Update Formula" : "Save Formula"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Client Dialog */}
      <AddClientDialog
        open={addClientDialogOpen}
        onOpenChange={setAddClientDialogOpen}
        stylistId={stylistProfile?.id}
        onClientAdded={() => {
          loadData();
          setAddClientDialogOpen(false);
        }}
      />
    </DashboardLayout>
  );
};

export default Formulas;
