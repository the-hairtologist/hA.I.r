import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useOptimizedCallback } from '@/hooks/useOptimizedCallback';
import { useNavigate } from 'react-router-dom';
import { usePerformance } from '@/hooks/usePerformance';
import { DashboardLayout } from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';
import {
  Plus,
  Loader2,
  Search,
  Edit,
  Save,
  Trash2,
  UserPlus,
  Palette,
  Mic,
  Copy,
  Tag as TagIcon,
  X,
  Clock,
  Beaker,
  FileText,
  ThumbsUp,
  AlertTriangle,
  Download,
  ArrowUpDown,
} from 'lucide-react';
import { exportToCSV, formatDataForExport } from '@/lib/csvExport';
import { SkeletonList } from '@/components/ui/skeleton-list';
import { FormulaCardSkeleton } from '@/components/skeletons/FormulaCardSkeleton';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { AddClientDialog } from '@/components/AddClientDialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { VoiceInput } from '@/components/VoiceInput';
import { ContextualAI } from '@/components/ContextualAI';
import { showCelebration } from '@/components/CelebrationToast';
import { AIDisclaimer } from '@/components/AIDisclaimer';
import { AudioGuidePlayer } from '@/components/AudioGuidePlayer';
import {
  FormulaFiltersComponent,
  FormulaFilters,
} from '@/components/FormulaFilters';
import { PrerequisiteCheck } from '@/components/PrerequisiteCheck';
import {
  EnhancedSearch,
  HighlightedText,
  fuzzyMatch,
} from '@/components/EnhancedSearch';
import { FormulaSuccessPredictor } from '@/components/FormulaSuccessPredictor';
import { AIFeatureErrorBoundary } from '@/components/AIFeatureErrorBoundary';
import { AIFormulaAnalyzer } from '@/components/AIFormulaAnalyzer';
import { formulaSchema } from '@/lib/validation/formulaSchemas';
import { cn } from '@/lib/utils';
import { mobileFirst, touchButton } from '@/lib/responsive/mobile-first-utils';
import { VirtualList } from '@/components/VirtualList';
import { FormulaCard } from '@/components/FormulaCard';
import {
  useFormulasByStylist,
  useCreateFormula,
  useUpdateFormula,
  useDeleteFormula,
} from '@/hooks/useFormulas';
import { useClients } from '@/hooks/useClients';
import { PageHeader } from '@/components/PageHeader';
import { StandardFormField } from '@/components/forms/StandardFormField';
import { typography } from '@/lib/design/typography';

const Formulas = () => {
  // Performance tracking
  usePerformance({
    componentName: 'Formulas',
    trackRenders: true,
    trackMounts: true,
    reportThreshold: 16,
  });

  const navigate = useNavigate();
  const [stylistId, setStylistId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = useOptimizedCallback((...args: any[]) => {
    setSearchTerm(args[0] as string);
  }, []);
  const [editingFormula, setEditingFormula] = useState<any>(null);
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [addClientDialogOpen, setAddClientDialogOpen] = useState(false);
  const [filters, setFilters] = useState<FormulaFilters>({
    clientId: '',
    colorLine: '',
    dateRange: 'all',
    sortBy: 'date-desc',
    tags: [],
  });
  const [processingTimeSort, setProcessingTimeSort] = useState<
    'asc' | 'desc' | null
  >(null);
  const [tagInput, setTagInput] = useState('');
  const [selectedFormulas, setSelectedFormulas] = useState<Set<string>>(
    new Set()
  );
  const [similarFormulasCount, setSimilarFormulasCount] = useState(0);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Form state
  const [selectedClient, setSelectedClient] = useState('');
  const [formulaText, setFormulaText] = useState('');
  const [instructions, setInstructions] = useState('');
  const [colorLine, setColorLine] = useState('');
  const [resultNotes, setResultNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  // New structured fields
  const [processingTime, setProcessingTime] = useState('');
  const [developerVolume, setDeveloperVolume] = useState('');
  const [applicationNotes, setApplicationNotes] = useState('');
  const [whatWorked, setWhatWorked] = useState('');
  const [whatToAvoid, setWhatToAvoid] = useState('');

  // Load stylist profile
  useEffect(() => {
    const loadStylistProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: stylist } = await supabase
        .from('stylist_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!stylist) {
        toast.error('Stylist profile not found');
        navigate('/dashboard');
        return;
      }

      setStylistId(stylist.id);
    };

    loadStylistProfile();
  }, [navigate]);

  // React Query hooks for data fetching
  const { data: formulas = [], isLoading: formulasLoading } =
    useFormulasByStylist(stylistId);
  const { data: clientsData, isLoading: clientsLoading } =
    useClients(stylistId);
  const clients = clientsData?.clients || [];

  const loading = formulasLoading || clientsLoading;

  // Mutation hooks
  const createFormulaMutation = useCreateFormula(stylistId || '');
  const updateFormulaMutation = useUpdateFormula(stylistId || '');
  const deleteFormulaMutation = useDeleteFormula(stylistId || '');

  // Filtered formulas computation
  const filteredFormulas = useMemo(() => {
    let filtered = [...(formulas as any[])];

    // Enhanced fuzzy text search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        formula =>
          fuzzyMatch(formula.client?.full_name || '', searchTerm, 2) ||
          fuzzyMatch(formula.client?.email || '', searchTerm, 2) ||
          fuzzyMatch(formula.formula_text || '', searchTerm, 2) ||
          fuzzyMatch(formula.color_line || '', searchTerm, 2) ||
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
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();

      switch (filters.dateRange) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(f => new Date(f.created_at) >= cutoffDate);
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(
        f => f.tags && f.tags.some((tag: string) => filters.tags.includes(tag))
      );
    }

    // Sort by processing time if enabled
    if (processingTimeSort) {
      filtered.sort((a, b) => {
        const aTime = a.processing_time_minutes || 0;
        const bTime = b.processing_time_minutes || 0;
        return processingTimeSort === 'asc' ? aTime - bTime : bTime - aTime;
      });
    } else {
      // Regular sort
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'date-desc':
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          case 'date-asc':
            return (
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
            );
          case 'client-asc':
            return (a.client?.full_name || '').localeCompare(
              b.client?.full_name || ''
            );
          case 'client-desc':
            return (b.client?.full_name || '').localeCompare(
              a.client?.full_name || ''
            );
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [formulas, searchTerm, filters, processingTimeSort]);

  // Extract unique color lines and tags
  const uniqueColorLines = useMemo(() => {
    const lines = (formulas as any[])
      .map(f => f.color_line)
      .filter((line): line is string => !!line);
    return Array.from(new Set(lines)).sort();
  }, [formulas]);

  const availableTags = useMemo(() => {
    const allTags = (formulas as any[])
      .flatMap(f => f.tags || [])
      .filter((tag): tag is string => !!tag);
    return Array.from(new Set(allTags)).sort();
  }, [formulas]);

  const selectedClientData = useMemo(
    () => clients.find(c => c.id === selectedClient),
    [clients, selectedClient]
  );

  // Export callback
  const handleExportCSV = useCallback(() => {
    if (filteredFormulas.length === 0) {
      toast.error('No formulas to export');
      return;
    }

    const exportData = filteredFormulas.map(f => ({
      client_name: f.client?.full_name || '',
      formula: f.formula_text || '',
      instructions: f.instructions || '',
      color_line: f.color_line || '',
      result_notes: f.result_notes || '',
      tags: f.tags?.join(', ') || '',
      created_at: new Date(f.created_at).toLocaleDateString(),
    }));

    exportToCSV(exportData, 'formulas');
    toast.success('Formulas exported successfully');
  }, [filteredFormulas]);

  // Global keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrlKey: true,
      description: 'New formula',
      action: () => !dialogOpen && setDialogOpen(true),
    },
    {
      key: 'e',
      ctrlKey: true,
      description: 'Export formulas',
      action: () => handleExportCSV(),
    },
  ]);

  const handleSaveFormula = useCallback(async () => {
    if (!stylistId) return;

    // Validate with zod schema
    try {
      const validatedData = formulaSchema.parse({
        client_id: selectedClient,
        formula_text: formulaText,
        instructions,
        color_line: colorLine,
        result_notes: resultNotes,
        processing_time_minutes: processingTime
          ? parseInt(processingTime)
          : null,
        developer_volume: developerVolume,
        application_notes: applicationNotes,
        what_worked: whatWorked,
        what_to_avoid: whatToAvoid,
        tags: tags.length > 0 ? tags : undefined,
      });

      setValidationErrors({});
    } catch (error: any) {
      const errors: Record<string, string> = {};
      error.errors?.forEach((err: any) => {
        errors[err.path[0]] = err.message;
      });
      setValidationErrors(errors);
      toast.error('Please fix validation errors');
      return;
    }

    const formulaData = {
      stylist_id: stylistId,
      client_id: selectedClient,
      formula_text: formulaText,
      instructions: instructions || undefined,
      color_line: colorLine || undefined,
      processing_time_minutes: processingTime
        ? parseInt(processingTime)
        : undefined,
      developer_volume: developerVolume || undefined,
      application_notes: applicationNotes || undefined,
      what_worked: whatWorked || undefined,
      what_to_avoid: whatToAvoid || undefined,
    };

    if (editingFormula) {
      // Update existing formula
      updateFormulaMutation.mutate({ id: editingFormula.id, ...formulaData });
    } else {
      // Create new formula
      createFormulaMutation.mutate(formulaData, {
        onSuccess: () => {
          showCelebration('formula-saved', undefined, formulas.length + 1);
        },
      });
    }

    handleCloseDialog();
  }, [
    stylistId,
    selectedClient,
    formulaText,
    instructions,
    colorLine,
    resultNotes,
    processingTime,
    developerVolume,
    applicationNotes,
    whatWorked,
    whatToAvoid,
    tags,
    editingFormula,
    createFormulaMutation,
    updateFormulaMutation,
    formulas.length,
  ]);

  const handleEditFormula = (formula: any) => {
    setEditingFormula(formula);
    setSelectedClient(formula.client_id);
    setFormulaText(formula.formula_text || '');
    setInstructions(formula.instructions || '');
    setColorLine(formula.color_line || '');
    setResultNotes(formula.result_notes || '');
    setTags(formula.tags || []);
    setProcessingTime(formula.processing_time_minutes?.toString() || '');
    setDeveloperVolume(formula.developer_volume || '');
    setApplicationNotes(formula.application_notes || '');
    setWhatWorked(formula.what_worked || '');
    setWhatToAvoid(formula.what_to_avoid || '');
    setDialogOpen(true);
  };

  const handleDuplicateFormula = (formula: any) => {
    setEditingFormula(null); // Not editing, creating new
    setSelectedClient(formula.client_id);
    setFormulaText(formula.formula_text || '');
    setInstructions(formula.instructions || '');
    setColorLine(formula.color_line || '');
    setResultNotes(formula.result_notes || '');
    setTags(formula.tags || []);
    setProcessingTime(formula.processing_time_minutes?.toString() || '');
    setDeveloperVolume(formula.developer_volume || '');
    setApplicationNotes(formula.application_notes || '');
    setWhatWorked(formula.what_worked || '');
    setWhatToAvoid(formula.what_to_avoid || '');
    setDialogOpen(true);
    toast.success('Formula duplicated successfully');
  };

  const handleDeleteFormula = useCallback(
    (formulaId: string) => {
      const confirmed = window.confirm(
        'Delete this formula?\n\nThis will permanently remove the formula from your records. This action cannot be undone.'
      );
      if (!confirmed) return;

      deleteFormulaMutation.mutate(formulaId);
    },
    [deleteFormulaMutation]
  );

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingFormula(null);
    setSelectedClient('');
    setFormulaText('');
    setInstructions('');
    setColorLine('');
    setResultNotes('');
    setTags([]);
    setTagInput('');
    setProcessingTime('');
    setDeveloperVolume('');
    setApplicationNotes('');
    setWhatWorked('');
    setWhatToAvoid('');
    setValidationErrors({});
    setTouchedFields({});
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim().toLowerCase();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Color Formulas"
          icon={<Beaker className="h-6 w-6" />}
          loading={true}
          backTo="/dashboard"
        />
        <div className="space-y-6 px-4 py-6">
          <Breadcrumbs />
          <SkeletonList count={8} variant="card" showHeader />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Color Formulas"
        icon={<Beaker className="h-6 w-6" />}
        backTo="/dashboard"
      />
      <div className="space-y-6 px-4 py-6">
        <Breadcrumbs />

        {/* AI Disclaimer */}
        <AIDisclaimer context="formula" />

        {/* Contextual AI Suggestions */}
        {selectedClient && (
          <ContextualAI
            context="formula"
            data={{ clientId: selectedClient }}
            onAction={action => {
              if (action === 'load-last-formula') {
                const lastFormula = formulas.find(
                  f => f.client_id === selectedClient
                );
                if (lastFormula) {
                  setFormulaText(lastFormula.formula_text || '');
                  setInstructions(lastFormula.instructions || '');
                  setColorLine(lastFormula.color_line || '');
                  toast.success('Last formula loaded successfully');
                }
              }
            }}
          />
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className={typography.title.page}>
              Client Formulas
            </h1>
            <p className={typography.description.default}>
              View and manage your client formulas
            </p>
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
            <Button
              onClick={() => setDialogOpen(true)}
              disabled={clients.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Formula
            </Button>
          </div>
        </div>

        {/* Show prerequisite alert if no clients */}
        {clients.length === 0 && <PrerequisiteCheck type="clients" />}

        {/* Keyboard shortcut hints */}
        <div className="flex justify-between items-center text-xs sm:text-sm text-muted-foreground">
          <div className="flex gap-4">
            <span>
              <kbd className="px-2 py-1 font-semibold bg-muted rounded border">
                Ctrl+N
              </kbd>{' '}
              New formula
            </span>
            <span>
              <kbd className="px-2 py-1 font-semibold bg-muted rounded border">
                Ctrl+E
              </kbd>{' '}
              Export
            </span>
          </div>
          {processingTimeSort === null &&
            formulas.some(f => f.processing_time_minutes) && (
              <span className="text-primary">
                💡 Tip: Click any processing time to sort formulas
              </span>
            )}
        </div>

        {/* Enhanced Search */}
        <EnhancedSearch
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search formulas..."
          storageKey="formulas_recent_searches"
          showRecentSearches={true}
        />

        {/* Active Sort Indicator */}
        {processingTimeSort && (
          <Card className="border-2 border-primary bg-primary/5">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs sm:text-sm font-medium">
                  Sorted by Processing Time:{' '}
                  {processingTimeSort === 'asc'
                    ? 'Shortest First'
                    : 'Longest First'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setProcessingTimeSort(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        {formulas.length > 0 && (
          <FormulaFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            clients={clients as any}
            colorLines={uniqueColorLines}
            availableTags={availableTags}
          />
        )}

        {/* Bulk Actions Bar */}
        {selectedFormulas.size > 0 && (
          <Card className="border-[3px] border-primary shadow-[4px_4px_0px_0px_hsl(var(--primary))] mb-4 bg-primary/5">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedFormulas.size === filteredFormulas.length}
                  onChange={() => {
                    if (selectedFormulas.size === filteredFormulas.length) {
                      setSelectedFormulas(new Set());
                    } else {
                      setSelectedFormulas(
                        new Set(filteredFormulas.map(f => f.id))
                      );
                    }
                  }}
                  className="h-5 w-5 rounded border-2 border-foreground cursor-pointer focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="Select all formulas"
                />
                <span className="font-medium">
                  {selectedFormulas.size} formula
                  {selectedFormulas.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const confirmed = window.confirm(
                      `Delete ${selectedFormulas.size} formula${selectedFormulas.size !== 1 ? 's' : ''}?\n\nThis will permanently remove the selected formulas from your records.`
                    );
                    if (confirmed) {
                      const formulaIds = Array.from(selectedFormulas);
                      Promise.all(
                        formulaIds.map(id =>
                          deleteFormulaMutation.mutateAsync(id)
                        )
                      )
                        .then(() => {
                          toast.success(
                            `${formulaIds.length} formula${formulaIds.length !== 1 ? 's' : ''} deleted`
                          );
                          setSelectedFormulas(new Set());
                        })
                        .catch(() => {
                          toast.error('Failed to delete some formulas');
                        });
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
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Formula Analyzer - Shows insights for selected formulas */}
        {selectedFormulas.size > 0 && (
          <div className="mb-6">
            <AIFeatureErrorBoundary featureName="formula_analyzer">
              <AIFormulaAnalyzer
                formulas={filteredFormulas.filter(f =>
                  selectedFormulas.has(f.id)
                )}
                onAnalysisComplete={results => {
                  toast.success('Formula analysis completed successfully');
                }}
              />
            </AIFeatureErrorBoundary>
          </div>
        )}

        {/* Formulas List */}
        <div className="grid gap-4">
          {filteredFormulas.length === 0 ? (
            <div className="py-16 px-4 text-center animate-fade-in">
              {searchTerm ||
              filters.clientId ||
              filters.colorLine ||
              filters.tags.length > 0 ? (
                <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] bg-secondary/5">
                  <CardContent className={cn(mobileFirst.padding.lg, "py-12")}>
                    <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className={cn(mobileFirst.text.lg, "font-pixel mb-2 break-words")}>
                      No formulas match your filters
                    </h3>
                    <p className={cn(mobileFirst.text.sm, "text-muted-foreground font-sans mb-4 break-words")}>
                      Try adjusting your search or filters to find what you're
                      looking for
                    </p>
                    <Button
                      variant="outline"
                      className={touchButton.md}
                      onClick={() => {
                        setSearchTerm('');
                        setFilters({
                          clientId: '',
                          colorLine: '',
                          dateRange: 'all',
                          sortBy: 'date-desc',
                          tags: [],
                        });
                        setProcessingTimeSort(null);
                      }}
                    >
                      Clear All Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="relative mb-6 inline-block">
                    <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 rounded-full border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
                      <Palette className="h-16 w-16 text-primary" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-secondary p-2 rounded-full border-2 border-foreground">
                      <span
                        className="text-xl sm:text-2xl md:text-3xl"
                        role="img"
                        aria-label="magic"
                      >
                        🔮
                      </span>
                    </div>
                  </div>
                  <h2 className={cn(mobileFirst.text.xl, "font-pixel mb-2 gradient-text break-words")}>
                    Your Formula Library Awaits!
                  </h2>
                  <p className={cn(mobileFirst.text.sm, "text-muted-foreground font-sans mb-6 max-w-md mx-auto break-words")}>
                    {searchTerm
                      ? 'No formulas match your search. Try different keywords or create a new formula!'
                      : clients.length === 0
                        ? 'Add clients first to start creating formulas. Each formula is tied to a specific client.'
                        : 'Start documenting your color formulas and never forget that perfect shade again'}
                  </p>
                  <Button
                    onClick={() => setDialogOpen(true)}
                    className={cn(touchButton.lg, "gap-2 hover-scale")}
                    size="lg"
                    disabled={clients.length === 0}
                  >
                    <Plus className="h-5 w-5" />
                    Create Your First Formula
                  </Button>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-4">
                    <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">
                      Ctrl
                    </kbd>{' '}
                    +{' '}
                    <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">
                      N
                    </kbd>{' '}
                    for quick access
                  </p>
                </>
              )}
            </div>
          ) : (
            <VirtualList
              items={filteredFormulas}
              estimateSize={350}
              overscan={2}
              className="grid gap-4"
              renderItem={formula => (
                <FormulaCard
                  formula={formula}
                  searchTerm={searchTerm}
                  onEdit={() => handleEditFormula(formula)}
                  onDuplicate={() => handleDuplicateFormula(formula)}
                  onDelete={() => handleDeleteFormula(formula.id)}
                  onToggleSelection={id => {
                    const newSelected = new Set(selectedFormulas);
                    if (newSelected.has(id)) {
                      newSelected.delete(id);
                    } else {
                      newSelected.add(id);
                    }
                    setSelectedFormulas(newSelected);
                  }}
                  isSelected={selectedFormulas.has(formula.id)}
                />
              )}
            />
          )}
        </div>
      </div>

      {/* Add/Edit Formula Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFormula ? 'Edit Formula' : 'Add New Formula'}
            </DialogTitle>
            <DialogDescription>
              {editingFormula
                ? 'Update the formula details'
                : 'Create a new formula for a client'}
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
              <Popover
                open={clientSearchOpen}
                onOpenChange={setClientSearchOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={clientSearchOpen}
                    className="w-full justify-between"
                    disabled={!!editingFormula}
                  >
                    {selectedClientData
                      ? selectedClientData.full_name ||
                        selectedClientData.email ||
                        'Client'
                      : 'Search and select a client...'}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search clients..." />
                    <CommandEmpty>
                      <div className="p-4 text-sm text-center">
                        <p className="text-muted-foreground mb-2">
                          No clients found
                        </p>
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
                      {clients.map(client => (
                        <CommandItem
                          key={client.id}
                          value={client.full_name || client.email || ''}
                          onSelect={() => {
                            setSelectedClient(client.id);
                            setClientSearchOpen(false);
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {client.full_name || 'Client'}
                            </span>
                            {client.email && (
                              <span className="text-xs sm:text-sm text-muted-foreground">
                                {client.email}
                              </span>
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
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Formula *</span>
                <VoiceInput
                  variant="icon"
                  onTranscription={text =>
                    setFormulaText(prev => (prev ? `${prev}\n${text}` : text))
                  }
                />
              </div>
              <StandardFormField
                name="formula_text"
                label=""
                type="textarea"
                value={formulaText}
                onChange={(val) => setFormulaText(String(val))}
                onBlur={() => setTouchedFields(prev => ({ ...prev, formula_text: true }))}
                error={validationErrors.formula_text}
                touched={touchedFields.formula_text}
                required
                placeholder="Enter the complete formula or use voice input..."
                rows={6}
                maxLength={5000}
                description="Detailed formula instructions and product list"
              />
            </div>

            {/* AI Success Prediction */}
            {formulaText && selectedClient && (
              <AIFeatureErrorBoundary featureName="formula_success_predictor">
                <FormulaSuccessPredictor
                  formulaText={formulaText}
                  clientHairType={selectedClientData?.hair_type || undefined}
                  clientAllergies={selectedClientData?.allergies || undefined}
                  similarFormulasCount={similarFormulasCount}
                />
              </AIFeatureErrorBoundary>
            )}

            {/* Instructions */}
            <StandardFormField
              name="instructions"
              label="Application Instructions"
              type="textarea"
              value={instructions}
              onChange={(val) => setInstructions(String(val))}
              onBlur={() => setTouchedFields(prev => ({ ...prev, instructions: true }))}
              error={validationErrors.instructions}
              touched={touchedFields.instructions}
              placeholder="Step-by-step application instructions..."
              rows={4}
              maxLength={2000}
            />

            {/* Color Line */}
            <StandardFormField
              name="color_line"
              label="Color Line"
              type="text"
              value={colorLine}
              onChange={(val) => setColorLine(String(val))}
              onBlur={() => setTouchedFields(prev => ({ ...prev, color_line: true }))}
              error={validationErrors.color_line}
              touched={touchedFields.color_line}
              placeholder="e.g., Wella, Redken"
              maxLength={100}
            />

            {/* Result Notes */}
            <StandardFormField
              name="result_notes"
              label="Result Notes"
              type="textarea"
              value={resultNotes}
              onChange={(val) => setResultNotes(String(val))}
              onBlur={() => setTouchedFields(prev => ({ ...prev, result_notes: true }))}
              error={validationErrors.result_notes}
              touched={touchedFields.result_notes}
              placeholder="Notes about the result..."
              rows={2}
              maxLength={1000}
            />

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Add tags (e.g., blonde, balayage, correction)"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map(tag => (
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
                <AccordionTrigger className="text-xs sm:text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Processing Details
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <StandardFormField
                      name="processing_time_minutes"
                      label="Processing Time (minutes)"
                      type="number"
                      value={processingTime}
                      onChange={(val) => setProcessingTime(String(val))}
                      onBlur={() => setTouchedFields(prev => ({ ...prev, processing_time_minutes: true }))}
                      error={validationErrors.processing_time_minutes}
                      touched={touchedFields.processing_time_minutes}
                      placeholder="e.g., 30"
                      min={1}
                      max={480}
                    />
                    <div className="space-y-2">
                      <StandardFormField
                        name="developer_volume"
                        label="Developer Volume"
                        type="text"
                        value={developerVolume}
                        onChange={(val) => setDeveloperVolume(String(val))}
                        onBlur={() => setTouchedFields(prev => ({ ...prev, developer_volume: true }))}
                        error={validationErrors.developer_volume}
                        touched={touchedFields.developer_volume}
                        placeholder="e.g., 20 vol"
                        maxLength={50}
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
                  <StandardFormField
                    name="application_notes"
                    label="How to Apply (optional)"
                    type="textarea"
                    value={applicationNotes}
                    onChange={(val) => setApplicationNotes(String(val))}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, application_notes: true }))}
                    error={validationErrors.application_notes}
                    touched={touchedFields.application_notes}
                    placeholder="e.g., Apply root to ends, section by section..."
                    rows={3}
                    maxLength={1000}
                  />
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
                    <div className="flex items-center gap-1 mb-1">
                      <ThumbsUp className="h-3 w-3" />
                      <span className="text-xs font-medium">What Worked Well</span>
                    </div>
                    <StandardFormField
                      name="what_worked"
                      label=""
                      type="textarea"
                      value={whatWorked}
                      onChange={(val) => setWhatWorked(String(val))}
                      onBlur={() => setTouchedFields(prev => ({ ...prev, what_worked: true }))}
                      error={validationErrors.what_worked}
                      touched={touchedFields.what_worked}
                      placeholder="e.g., Perfect lift, even tone, client loved it..."
                      rows={2}
                      maxLength={1000}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 mb-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span className="text-xs font-medium">What to Avoid Next Time</span>
                    </div>
                    <StandardFormField
                      name="what_to_avoid"
                      label=""
                      type="textarea"
                      value={whatToAvoid}
                      onChange={(val) => setWhatToAvoid(String(val))}
                      onBlur={() => setTouchedFields(prev => ({ ...prev, what_to_avoid: true }))}
                      error={validationErrors.what_to_avoid}
                      touched={touchedFields.what_to_avoid}
                      placeholder="e.g., Watch timing on roots, less developer needed..."
                      rows={2}
                      maxLength={1000}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button onClick={handleSaveFormula} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {editingFormula ? 'Update Formula' : 'Save Formula'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Client Dialog */}
      <AddClientDialog
        open={addClientDialogOpen}
        onOpenChange={setAddClientDialogOpen}
        stylistId={stylistId || ''}
        onClientAdded={() => {
          setAddClientDialogOpen(false);
          toast.success('Client added successfully');
        }}
      />
    </DashboardLayout>
  );
};

export default Formulas;
