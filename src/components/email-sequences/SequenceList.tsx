import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/useToast";
import { Plus, Edit, Copy, Trash2, Play, Pause, Sparkles, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SequenceBuilder } from "./SequenceBuilder";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const SequenceList = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isAdmin } = useUserRole(user?.id);
  const [selectedSequence, setSelectedSequence] = useState<any>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  // Fetch sequences
  const { data: sequences, isLoading } = useQuery({
    queryKey: ["email_sequences"],
    queryFn: async () => {
      const { data: stylistProfile } = await supabase
        .from("stylist_profiles")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();

      let query = supabase
        .from("email_sequences")
        .select(`
          *,
          steps:email_sequence_steps(count),
          enrollments:email_sequence_enrollments(count)
        `)
        .order("created_at", { ascending: false });

      if (!isAdmin && stylistProfile) {
        // Stylists see their own + global templates
        query = query.or(`stylist_id.eq.${stylistProfile.id},is_global_template.eq.true`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async (sequence: any) => {
      const { error } = await supabase
        .from("email_sequences")
        .update({ is_active: !sequence.is_active })
        .eq("id", sequence.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["email_sequences"] });
    },
  });

  // Delete sequence
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("email_sequences")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Sequence deleted");
      queryClient.invalidateQueries({ queryKey: ["email_sequences"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete", error.message);
    },
  });

  // Copy global template to stylist's account
  const copyTemplateMutation = useMutation({
    mutationFn: async (sequence: any) => {
      const { data: stylistProfile } = await supabase
        .from("stylist_profiles")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (!stylistProfile) throw new Error("Stylist profile not found");

      // Copy sequence
      const { data: newSequence, error: seqError } = await supabase
        .from("email_sequences")
        .insert({
          name: `${sequence.name} (Copy)`,
          description: sequence.description,
          trigger_type: sequence.trigger_type,
          trigger_conditions: sequence.trigger_conditions,
          category: sequence.category,
          stylist_id: stylistProfile.id,
          is_active: false, // Start as inactive
        })
        .select()
        .maybeSingle();

      if (seqError) throw seqError;

      // Copy steps
      const { data: steps } = await supabase
        .from("email_sequence_steps")
        .select("*")
        .eq("sequence_id", sequence.id)
        .order("step_order");

      if (steps && steps.length > 0) {
        const newSteps = steps.map((step: any) => ({
          sequence_id: newSequence.id,
          step_order: step.step_order,
          name: step.name,
          subject: step.subject,
          body_html: step.body_html,
          delay_amount: step.delay_amount,
          delay_unit: step.delay_unit,
          send_time_preference: step.send_time_preference,
          stop_on_conditions: step.stop_on_conditions,
        }));

        const { error: stepsError } = await supabase
          .from("email_sequence_steps")
          .insert(newSteps);

        if (stepsError) throw stepsError;
      }
    },
    onSuccess: () => {
      toast.success("Template copied", "You can now customize it for your practice");
      queryClient.invalidateQueries({ queryKey: ["email_sequences"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to copy template", error.message);
    },
  });

  const getTriggerLabel = (trigger: string) => {
    const labels: Record<string, string> = {
      manual: "📝 Manual",
      new_client: "🆕 New Client",
      post_appointment: "✅ Post-Appointment",
      inactive_client: "💤 Inactive Client",
      birthday: "🎂 Birthday",
      anniversary: "🎉 Anniversary",
      pre_appointment: "⏰ Pre-Appointment",
    };
    return labels[trigger] || trigger;
  };

  return (
    <div className="space-y-6">
      {/* Create New Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Your Sequences</h2>
          <p className="text-sm text-muted-foreground">
            Create automated email campaigns for your clients
          </p>
        </div>
        <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedSequence(null)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Sequence
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>
                {selectedSequence ? "Edit Sequence" : "Create New Sequence"}
              </DialogTitle>
            </DialogHeader>
            <SequenceBuilder
              sequence={selectedSequence}
              onSuccess={() => {
                setIsBuilderOpen(false);
                setSelectedSequence(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-12 text-center border-2">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading sequences...</p>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && sequences?.length === 0 && (
        <Card className="p-12 text-center border-2 border-dashed">
          <Mail className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Sequences Yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first email sequence
          </p>
          <Button onClick={() => setIsBuilderOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Sequence
          </Button>
        </Card>
      )}

      {/* Sequence Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {sequences?.map((sequence: any) => (
          <Card key={sequence.id} className="p-6 border-2 hover:shadow-lg transition-all">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{sequence.name}</h3>
                    {sequence.is_global_template && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                        Global
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {sequence.description || "No description"}
                  </p>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {getTriggerLabel(sequence.trigger_type)}
                </Badge>
                {sequence.category && (
                  <Badge variant="outline" className="capitalize">
                    {sequence.category}
                  </Badge>
                )}
                <Badge variant={sequence.is_active ? "default" : "secondary"}>
                  {sequence.is_active ? "🟢 Active" : "⏸️ Paused"}
                </Badge>
              </div>

              {/* Stats */}
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Steps:</span>{" "}
                  <span className="font-semibold">{sequence.steps?.[0]?.count || 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Enrolled:</span>{" "}
                  <span className="font-semibold">{sequence.enrollments?.[0]?.count || 0}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                {sequence.is_global_template && !isAdmin ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyTemplateMutation.mutate(sequence)}
                    disabled={copyTemplateMutation.isPending}
                    className="gap-2 flex-1"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Template
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActiveMutation.mutate(sequence)}
                      disabled={toggleActiveMutation.isPending}
                      className="gap-2"
                    >
                      {sequence.is_active ? (
                        <><Pause className="h-4 w-4" /> Pause</>
                      ) : (
                        <><Play className="h-4 w-4" /> Activate</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSequence(sequence);
                        setIsBuilderOpen(true);
                      }}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Sequence?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove the sequence and all its steps. Active enrollments will be stopped.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(sequence.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
