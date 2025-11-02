import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Loader2,
  Sparkles,
  Send,
  Save,
  CheckSquare,
  History,
  Trash2,
  MessageSquare,
  User,
} from 'lucide-react';
import { LoadingDots } from '@/components/ui/loading-dots';
import { PageHeader } from '@/components/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AIDisclaimer } from '@/components/AIDisclaimer';
import { AIContextPanel } from '@/components/AIContextPanel';
import { ConversationSelector } from '@/components/ConversationSelector';
import { ClientSelectorDialog } from '@/components/ClientSelectorDialog';
import { StructuredFormulaDisplay } from '@/components/StructuredFormulaDisplay';
import { AIFormulaQuickStart } from '@/components/AIFormulaQuickStart';
import { FormulaSafetyBadge } from '@/components/FormulaSafetyBadge';
import { AIFeedbackPrompt } from '@/components/AIFeedbackPrompt';
import { HairAnalysisPanel } from '@/components/HairAnalysisPanel';
import { ModelPerformanceIndicator } from '@/components/ModelPerformanceIndicator';
import { FormulaOutcomeFeedback } from '@/components/FormulaOutcomeFeedback';
import { AIFeatureErrorBoundary } from '@/components/AIFeatureErrorBoundary';
import { CameraCapture } from '@/components/CameraCapture';
import { VoiceControl } from '@/components/VoiceControl';
import { useAIAnalytics } from '@/hooks/useAIAnalytics';
import { useFeatureFlag } from '@/lib/featureFlags';

const Knowledge = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: roleLoading } = useUserRole(user?.id);

  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [aiMessages, setAiMessages] = useState<
    Array<{
      role: 'user' | 'assistant';
      content: string | any;
      imageUrls?: string[];
    }>
  >([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Conversation persistence
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [showConversations, setShowConversations] = useState(false);

  // Context data
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientContext, setClientContext] = useState<any>(null);
  const [stylistContext, setStylistContext] = useState<any>(null);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [showClientSelector, setShowClientSelector] = useState(false);

  // Formula Generator specific state
  const [savedFormulas, setSavedFormulas] = useState<any[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [formulaToSave, setFormulaToSave] = useState('');
  const [formulaName, setFormulaName] = useState('');

  // Color Correction specific state
  const [correctionSteps, setCorrectionSteps] = useState<
    Array<{ step: string; completed: boolean }>
  >([]);

  // AI Analytics & Features
  const analytics = useAIAnalytics();
  const formulaValidationEnabled = useFeatureFlag('FORMULA_VALIDATION');
  const visualAnalysisEnabled = useFeatureFlag('VISUAL_HAIR_ANALYSIS');
  const outcomeTrackingEnabled = useFeatureFlag('OUTCOME_TRACKING');

  // Formula safety validation state
  const [lastFormulaValidation, setLastFormulaValidation] = useState<any>(null);
  const [validatingFormula, setValidatingFormula] = useState(false);

  // Hair analysis state
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);

  // Model performance tracking
  const [lastModelUsed, setLastModelUsed] = useState<string>('');
  const [lastResponseTime, setLastResponseTime] = useState<number>(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages]);

  useEffect(() => {
    if (!authLoading && !roleLoading && user && roles.length > 0) {
      const primaryRole = roles.includes('stylist') ? 'stylist' : roles[0];
      setUserRole(primaryRole);
      setLoading(false);
    } else if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, roleLoading, user, roles]);

  useEffect(() => {
    if (userRole === 'stylist') {
      loadSavedFormulas();
      loadStylistContext();
      loadClientsList();
    }
    loadConversations();
  }, [userRole]);

  // Load conversation when selected
  useEffect(() => {
    if (currentConversationId) {
      loadConversationMessages(currentConversationId);
    }
  }, [currentConversationId]);

  // Load client context when selected
  useEffect(() => {
    if (selectedClientId) {
      loadClientContext(selectedClientId);
    } else {
      setClientContext(null);
    }
  }, [selectedClientId]);

  const checkUserRole = async () => {
    // This function is now handled by the useEffect above with useUserRole hook
  };

  const loadSavedFormulas = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('ai_formulas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setSavedFormulas(data || []);
    } catch (error: any) {
      console.error('Error loading formulas:', error);
    }
  };

  const handleSaveFormula = async () => {
    if (!formulaName.trim() || !formulaToSave) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.from('ai_formulas').insert({
        user_id: session.user.id,
        formula_name: formulaName,
        prompt: aiMessages[aiMessages.length - 2]?.content || '',
        formula_content: formulaToSave,
      });

      if (error) throw error;

      toast.success('Formula saved successfully!');
      setShowSaveDialog(false);
      setFormulaName('');
      setFormulaToSave('');
      loadSavedFormulas();
    } catch (error: any) {
      console.error('Error saving formula:', error);
      toast.error('Failed to save formula');
    }
  };

  const handleDeleteFormula = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_formulas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Formula deleted');
      loadSavedFormulas();
    } catch (error: any) {
      console.error('Error deleting formula:', error);
      toast.error('Failed to delete formula');
    }
  };

  const loadConversations = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setConversations(data || []);
    } catch (error: any) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadConversationMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const messages =
        data?.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          imageUrls: msg.image_urls || undefined,
        })) || [];

      setAiMessages(messages);
    } catch (error: any) {
      console.error('Error loading conversation messages:', error);
      toast.error('Failed to load conversation');
    }
  };

  const saveConversationMessage = async (
    role: 'user' | 'assistant',
    content: string,
    imageUrls?: string[]
  ) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // Create conversation if it doesn't exist
      let convId = currentConversationId;
      if (!convId) {
        const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
        const { data: conv, error: convError } = await supabase
          .from('ai_conversations')
          .insert({
            user_id: session.user.id,
            title,
            context_type: selectedClientId ? 'client' : 'general',
            context_id: selectedClientId,
          })
          .select()
          .maybeSingle();

        if (convError) throw convError;
        if (!conv) throw new Error('Failed to create conversation');
        convId = conv.id;
        setCurrentConversationId(convId);
      }

      // Save message
      const { error } = await supabase.from('ai_conversation_messages').insert({
        conversation_id: convId,
        role,
        content,
        image_urls: imageUrls,
      });

      if (error) throw error;
      loadConversations();
    } catch (error: any) {
      console.error('Error saving message:', error);
    }
  };

  const loadStylistContext = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('stylist_profiles')
        .select('color_line, specialty, years_experience, business_name')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) throw error;
      setStylistContext(data);
    } catch (error: any) {
      console.error('Error loading stylist context:', error);
    }
  };

  const loadClientsList = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data: stylistData } = await supabase
        .from('stylist_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!stylistData) return;

      const { data, error } = await supabase
        .from('client_profiles')
        .select('id, full_name, email')
        .eq('preferred_stylist_id', stylistData.id)
        .order('full_name', { ascending: true });

      if (error) throw error;
      setClientsList(data || []);
    } catch (error: any) {
      console.error('Error loading clients list:', error);
    }
  };

  const loadClientContext = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('client_profiles')
        .select(
          `
          full_name,
          hair_type,
          hair_goals,
          allergies,
          sensitivity_notes,
          notes,
          client_since
        `
        )
        .eq('id', clientId)
        .maybeSingle();

      if (error) throw error;

      // Load recent formulas for this client
      const { data: formulas } = await supabase
        .from('formulas')
        .select('formula_name, created_at, notes')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Load recent appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('appointment_date, service_type, notes')
        .eq('client_id', clientId)
        .order('appointment_date', { ascending: false })
        .limit(3);

      setClientContext({
        ...data,
        recentFormulas: formulas || [],
        recentAppointments: appointments || [],
      });
    } catch (error: any) {
      console.error('Error loading client context:', error);
      toast.error('Failed to load client data');
    }
  };

  const startNewConversation = () => {
    setCurrentConversationId(null);
    setAiMessages([]);
    setSelectedClientId(null);
    setClientContext(null);
    setCorrectionSteps([]);
  };

  const parseStepsFromResponse = (response: string) => {
    const lines = response.split('\n');
    const steps: Array<{ step: string; completed: boolean }> = [];

    lines.forEach(line => {
      if (line.match(/^\d+\.|^Step \d+:|^-/)) {
        steps.push({
          step: line.replace(/^\d+\.|^Step \d+:|^-/, '').trim(),
          completed: false,
        });
      }
    });

    return steps;
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || aiLoading) return;

    const userMessage = aiInput.trim();
    const messageWithImages =
      uploadedImages.length > 0
        ? {
            role: 'user' as const,
            content: userMessage,
            imageUrls: uploadedImages,
          }
        : { role: 'user' as const, content: userMessage };

    setAiInput('');
    setAiMessages(prev => [...prev, messageWithImages]);
    setAiLoading(true);

    const startTime = performance.now();

    try {
      // Hair photo analysis if images uploaded
      if (visualAnalysisEnabled && uploadedImages.length > 0) {
        setAnalyzingPhoto(true);
        try {
          const { data: analysisData } = await supabase.functions.invoke(
            'analyze-hair-photo',
            {
              body: {
                imageUrl: uploadedImages[0],
                clientId: selectedClientId,
              },
            }
          );

          if (analysisData && !analysisData.error) {
            setLastAnalysis(analysisData);
            analytics.trackVisualAnalysis({
              confidence: analysisData.level_confidence || 0.85,
              detectedLevel: analysisData.current_level || 0,
              processingTimeMs: Math.round(performance.now() - startTime),
            });

            toast.success('Hair analysis complete!', {
              description: `Detected Level ${analysisData.current_level} with ${Math.round(analysisData.level_confidence * 100)}% confidence`,
            });
          }
        } catch (analysisError) {
          console.warn(
            'Hair analysis failed, continuing with chat:',
            analysisError
          );
        } finally {
          setAnalyzingPhoto(false);
        }
      }
      // Build conversation history with images
      const historyWithImages = aiMessages.map(msg => {
        if (msg.imageUrls && msg.imageUrls.length > 0) {
          return {
            role: msg.role,
            content: [
              {
                type: 'text',
                text:
                  typeof msg.content === 'string'
                    ? msg.content
                    : JSON.stringify(msg.content),
              },
              ...msg.imageUrls.map(url => ({
                type: 'image_url',
                image_url: { url },
              })),
            ],
          };
        }
        return { role: msg.role, content: msg.content };
      });

      const { data, error } = await supabase.functions.invoke(
        'hair-assistant-chat',
        {
          body: {
            message: userMessage,
            mode: 'unified',
            conversationHistory: historyWithImages,
            images: uploadedImages.length > 0 ? uploadedImages : undefined,
            clientContext: clientContext,
            stylistContext: stylistContext,
            hairAnalysis: lastAnalysis, // Pass analysis to AI
          },
        }
      );

      // Track performance
      const responseTime = Math.round(performance.now() - startTime);
      setLastResponseTime(responseTime);
      if (data?.model_used) {
        setLastModelUsed(data.model_used);
      }

      // Save user message
      await saveConversationMessage(
        'user',
        userMessage,
        uploadedImages.length > 0 ? uploadedImages : undefined
      );

      if (error) throw error;

      const assistantResponse = data.response;
      setAiMessages(prev => [
        ...prev,
        { role: 'assistant', content: assistantResponse },
      ]);

      // Save assistant message
      await saveConversationMessage('assistant', assistantResponse);

      // Validate formula if response contains formula-like content
      if (
        formulaValidationEnabled &&
        typeof assistantResponse === 'string' &&
        (assistantResponse.includes('developer') ||
          assistantResponse.includes('processing'))
      ) {
        setValidatingFormula(true);
        try {
          const { data: validation } = await supabase.functions.invoke(
            'validate-formula',
            {
              body: {
                formula: {
                  base: {
                    /* extracted from response */
                  },
                },
                clientId: selectedClientId,
              },
            }
          );

          if (validation && !validation.error) {
            setLastFormulaValidation(validation);
            analytics.trackFormulaValidation({
              isSafe: validation.isSafe,
              warningCount: validation.warnings?.length || 0,
              blockerCount: validation.blockers?.length || 0,
            });
          }
        } catch (validationError) {
          console.warn('Formula validation failed:', validationError);
        } finally {
          setValidatingFormula(false);
        }
      }

      // Auto-parse steps from any response that contains numbered lists
      const steps = parseStepsFromResponse(data.response);
      if (steps.length > 0) {
        setCorrectionSteps(steps);
      }

      // Clear uploaded images after successful send
      setUploadedImages([]);
    } catch (error: any) {
      console.error('AI Error:', error);

      // Provide actionable error message
      const errorMessage = error.message?.includes('rate limit')
        ? 'AI service is busy. Please wait a moment and try again.'
        : error.message?.includes('network')
          ? 'Connection issue. Check your internet and try again.'
          : 'AI service temporarily unavailable. Please try again.';

      toast.error(errorMessage, {
        description: 'Your message was saved and you can retry',
        action: {
          label: 'Retry',
          onClick: () => handleAiSubmit(new Event('submit') as any),
        },
      });
    } finally {
      setAiLoading(false);
    }
  };

  const toggleStepCompletion = (index: number) => {
    setCorrectionSteps(prev =>
      prev.map((step, i) =>
        i === index ? { ...step, completed: !step.completed } : step
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            className="h-8 w-8 animate-spin text-primary"
            aria-hidden="true"
          />
          <p className="text-xs sm:text-sm text-muted-foreground">
            Loading AI Assistant...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <PageHeader
        title="AI Assistant"
        icon={<Sparkles className="h-6 w-6" />}
        backTo="/dashboard"
      />

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* AI Assistant Header */}
        <div className="mb-6">
          <div className="max-w-2xl mx-auto text-center p-5 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl border-4 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground)_/_0.2)]">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Sparkles className="h-7 w-7 text-primary animate-pulse" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-pixel bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                AI Hair Pro
              </h2>
            </div>
            <p className="text-[10px] xs:text-xs sm:text-sm font-sans text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">
                Ask anything hair-related!
              </span>{' '}
              Get instant color formulas, step-by-step guides for tricky
              corrections, technique tips, product recommendations, and
              professional advice—all powered by AI trained on expert hair
              knowledge.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-4 md:gap-6">
          {/* Left Sidebar */}
          <div className="space-y-4 md:space-y-5">
            {/* AI Context Panel - Shows what AI knows */}
            {userRole === 'stylist' && (
              <AIContextPanel
                clientContext={clientContext}
                stylistContext={stylistContext}
                onSelectClient={() => setShowClientSelector(true)}
                showClientSelector={true}
              />
            )}

            {/* Formula History - STYLIST ONLY */}
            {userRole === 'stylist' && savedFormulas.length > 0 && (
              <div className="window-chrome bg-gradient-to-br from-secondary/5 to-primary/5">
                <div className="p-3 md:p-4">
                  <div className="flex items-center gap-2 mb-3 md:mb-4">
                    <History className="h-4 w-4 text-secondary" />
                    <h3 className="text-sm font-pixel">Saved Formulas</h3>
                  </div>
                  <div className="space-y-2">
                    {savedFormulas.map(formula => (
                      <div
                        key={formula.id}
                        className="group flex items-center justify-between p-2 md:p-3 rounded-lg bg-background/50 border-2 border-secondary/20 hover:border-secondary/40 transition-all"
                      >
                        <span className="text-xs truncate flex-1 font-medium">
                          {formula.formula_name}
                        </span>
                        <button
                          onClick={() => handleDeleteFormula(formula.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-destructive/20 rounded-md touch-manipulation"
                          aria-label="Delete formula"
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step Progress - STYLIST ONLY - Auto-shows when AI provides steps */}
            {userRole === 'stylist' && correctionSteps.length > 0 && (
              <div className="window-chrome bg-gradient-to-br from-accent/5 to-primary/5">
                <div className="p-3 md:p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-accent" />
                      <h3 className="text-sm font-pixel">Step Tracker</h3>
                    </div>
                    <Badge variant="secondary" className="text-xs font-mono">
                      {correctionSteps.filter(s => s.completed).length}/
                      {correctionSteps.length}
                    </Badge>
                  </div>
                  <p className="text-xs font-sans text-muted-foreground mb-3">
                    Check off steps as you complete them
                  </p>
                  <div className="space-y-2.5">
                    {correctionSteps.map((step, idx) => (
                      <label
                        key={idx}
                        className="flex items-start gap-3 cursor-pointer group p-2 rounded-lg hover:bg-accent/5 transition-colors touch-manipulation"
                      >
                        <Checkbox
                          checked={step.completed}
                          onCheckedChange={() => toggleStepCompletion(idx)}
                          className="mt-0.5"
                        />
                        <span
                          className={`text-xs leading-relaxed transition-all ${
                            step.completed
                              ? 'line-through text-muted-foreground'
                              : 'group-hover:text-accent font-medium'
                          }`}
                        >
                          {step.step}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Chat Area */}
          <div className="min-h-[min(60vh,500px)] md:min-h-0">
            <div className="window-frame h-[calc(100vh-280px)] md:h-[calc(100vh-200px)] flex flex-col bg-background">
              <div className="window-titlebar bg-gradient-to-r from-primary via-secondary to-accent">
                <div className="flex items-center justify-between gap-2 md:gap-3">
                  <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                    <div className="window-controls hidden md:flex">
                      <div className="window-control bg-destructive"></div>
                      <div className="window-control bg-warning"></div>
                      <div className="window-control bg-accent"></div>
                    </div>
                    <h2 className="text-primary-foreground font-pixel text-xs md:text-sm flex items-center gap-1 md:gap-2 truncate">
                      <Sparkles className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                      <span className="truncate">
                        AI Hair Pro
                        {clientContext ? ` - ${clientContext.full_name}` : ''}
                      </span>
                    </h2>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConversations(true)}
                      className="h-7 md:h-8 px-2 md:px-3 text-xs text-primary-foreground hover:bg-primary/20"
                      title="Conversation History"
                    >
                      <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden md:inline ml-1">History</span>
                    </Button>

                    {currentConversationId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={startNewConversation}
                        className="h-7 md:h-8 px-2 md:px-3 text-xs text-primary-foreground hover:bg-primary/20"
                        title="New Conversation"
                      >
                        <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden md:inline ml-1">New</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-3 md:p-5 bg-gradient-to-br from-background to-muted/20">
                {/* AI Disclaimer */}
                <div className="mb-3 md:mb-4">
                  <AIDisclaimer context="chat" />
                </div>

                {aiLoading && aiMessages.length === 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-2xl p-4 bg-muted/50 border-2 border-border animate-pulse">
                        <div className="h-4 w-64 bg-muted-foreground/20 rounded mb-2" />
                        <div className="h-4 w-48 bg-muted-foreground/20 rounded" />
                      </div>
                    </div>
                  </div>
                ) : aiMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-6 px-4">
                    <div className="relative animate-bounce-gentle">
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-[6px_6px_0px_0px_hsl(var(--foreground)_/_0.2)] border-4 border-foreground">
                        <Sparkles className="h-12 w-12 text-primary-foreground" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center animate-pulse border-3 border-foreground">
                        <span className="text-sm">✨</span>
                      </div>
                    </div>
                    <div className="space-y-3 max-w-md text-center">
                      <p className="text-lg font-pixel gradient-text">
                        Ready to Create Magic ✨
                      </p>
                      <p className="text-sm font-sans text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground">
                          Ask anything hair-related!
                        </span>{' '}
                        Get instant color formulas, step-by-step guides for
                        tricky corrections, technique tips, product
                        recommendations, and professional advice—all powered by
                        AI trained on expert hair knowledge.
                      </p>
                    </div>
                    {/* Quick Start Templates */}
                    <div className="w-full max-w-2xl mt-6">
                      <AIFormulaQuickStart
                        onSelectTemplate={prompt => {
                          setAiInput(prompt);
                          // Auto-focus the input
                          setTimeout(() => {
                            const input = document.querySelector(
                              'input[placeholder*="Ask me anything"]'
                            ) as HTMLInputElement;
                            input?.focus();
                          }, 100);
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {aiMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                      >
                        {msg.role === 'assistant' ? (
                          <div className="max-w-[90%] w-full">
                            {/* Try to render as structured formula first */}
                            <StructuredFormulaDisplay
                              data={msg.content}
                              onSave={formula => {
                                setFormulaToSave(formula);
                                setShowSaveDialog(true);
                              }}
                            />

                            {/* Fallback to regular message if not structured */}
                            {!msg.content.toString().includes('"formula"') &&
                              !msg.content
                                .toString()
                                .includes('"application_steps"') && (
                                <div
                                  className="bg-background border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground)_/_0.1)] max-w-[80%] rounded-2xl px-5 py-4 border-3"
                                  style={{ border: '3px solid' }}
                                >
                                  <p className="text-sm whitespace-pre-wrap leading-relaxed font-medium">
                                    {msg.content}
                                  </p>
                                  {/* Save Formula Button - STYLIST ONLY */}
                                  {userRole === 'stylist' &&
                                    idx === aiMessages.length - 1 &&
                                    typeof msg.content === 'string' &&
                                    msg.content
                                      .toLowerCase()
                                      .includes('formula') && (
                                      <button
                                        onClick={() => {
                                          setFormulaToSave(msg.content);
                                          setShowSaveDialog(true);
                                        }}
                                        className="mt-4 retro-button bg-gradient-to-r from-secondary to-accent text-secondary-foreground px-4 py-2 rounded-lg font-bold uppercase tracking-wide text-sm flex items-center gap-2"
                                      >
                                        <Save className="h-4 w-4" />
                                        Save Formula
                                      </button>
                                    )}

                                  {/* AI Feedback Prompt - Show after AI responses */}
                                  {idx === aiMessages.length - 1 && (
                                    <div className="mt-4">
                                      <AIFeedbackPrompt context="formula" />
                                    </div>
                                  )}
                                </div>
                              )}
                          </div>
                        ) : (
                          <div
                            className="max-w-[80%] rounded-2xl px-5 py-4 border-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground)_/_0.2)]"
                            style={{ border: '3px solid' }}
                          >
                            <p className="text-sm whitespace-pre-wrap leading-relaxed font-medium">
                              {msg.content}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}

                    {aiLoading && (
                      <div className="flex justify-start animate-fade-in">
                        <div
                          className="bg-muted/80 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-3 border-3 border-accent shadow-[3px_3px_0px_0px_hsl(var(--foreground)_/_0.1)]"
                          style={{ border: '3px solid' }}
                        >
                          <Loader2 className="h-5 w-5 animate-spin text-accent" />
                          <span className="text-sm font-medium text-foreground">
                            Crafting magic...
                          </span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input Form */}
              <form
                onSubmit={handleAiSubmit}
                className="p-3 md:p-4 bg-gradient-to-r from-muted/50 to-muted/30 border-t-4 border-foreground"
              >
                <div className="flex gap-2 md:gap-3">
                  <CameraCapture
                    variant="compact"
                    context="analysis"
                    onCapture={imageUrl => {
                      setUploadedImages([...uploadedImages, imageUrl]);
                      toast.success('Photo added for AI analysis');
                    }}
                  />
                  <VoiceControl
                    variant="minimal"
                    context="chat"
                    onTranscription={text => setAiInput(text)}
                    enableCommands={true}
                  />
                  <Input
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    placeholder="Ask me anything: formulas, techniques, corrections..."
                    disabled={aiLoading}
                    className="flex-1 border-3 border-foreground rounded-xl font-medium focus-visible:ring-primary/50 shadow-[2px_2px_0px_0px_hsl(var(--foreground)_/_0.1)] text-sm md:text-base"
                    style={{ border: '3px solid' }}
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !aiInput.trim()}
                    className="retro-button bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 md:px-6 rounded-xl font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm md:text-base touch-manipulation min-h-[44px]"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                    <span className="hidden md:inline">Send</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Save Formula Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Formula</DialogTitle>
              <DialogDescription>
                Give this formula a name to save it to your library
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="formula-name">Formula Name</Label>
                <Input
                  id="formula-name"
                  value={formulaName}
                  onChange={e => setFormulaName(e.target.value)}
                  placeholder="e.g., Warm Blonde Balayage"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveFormula}
                disabled={!formulaName.trim()}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Conversation History Dialog */}
        <ConversationSelector
          open={showConversations}
          onOpenChange={setShowConversations}
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={setCurrentConversationId}
          onNewConversation={startNewConversation}
          onConversationsChange={loadConversations}
        />

        {/* Client Selector Dialog - Stylist Only */}
        {userRole === 'stylist' && (
          <ClientSelectorDialog
            open={showClientSelector}
            onOpenChange={setShowClientSelector}
            clients={clientsList}
            selectedClientId={selectedClientId}
            onSelectClient={setSelectedClientId}
          />
        )}
      </main>
    </div>
  );
};

export default Knowledge;
