import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/useToast";
import { Plus, Trash2, GripVertical, Save, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Step {
  id?: string;
  step_order: number;
  name: string;
  subject: string;
  body_html: string;
  delay_amount: number;
  delay_unit: string;
  send_time_preference: string;
}

interface SequenceBuilderProps {
  sequence?: any;
  onSuccess: () => void;
}

export const SequenceBuilder = ({ sequence, onSuccess }: SequenceBuilderProps) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    trigger_type: "manual",
    category: "onboarding",
    is_active: true,
  });

  const [steps, setSteps] = useState<Step[]>([
    {
      step_order: 1,
      name: "Email 1",
      subject: "",
      body_html: "",
      delay_amount: 0,
      delay_unit: "days",
      send_time_preference: "any_time",
    },
  ]);

  // Load existing sequence data
  useEffect(() => {
    if (sequence) {
      setFormData({
        name: sequence.name,
        description: sequence.description || "",
        trigger_type: sequence.trigger_type,
        category: sequence.category || "onboarding",
        is_active: sequence.is_active,
      });

      // Load steps
      loadSteps(sequence.id);
    }
  }, [sequence]);

  const loadSteps = async (sequenceId: string) => {
    const { data } = await supabase
      .from("email_sequence_steps")
      .select("*")
      .eq("sequence_id", sequenceId)
      .order("step_order");

    if (data && data.length > 0) {
      setSteps(data);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Get stylist profile
      const { data: stylistProfile } = await supabase
        .from("stylist_profiles")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (!stylistProfile) throw new Error("Stylist profile not found");

      let sequenceId: string;

      if (sequence) {
        // Update existing
        const { error } = await supabase
          .from("email_sequences")
          .update(formData)
          .eq("id", sequence.id);

        if (error) throw error;
        sequenceId = sequence.id;

        // Delete old steps
        await supabase
          .from("email_sequence_steps")
          .delete()
          .eq("sequence_id", sequenceId);
      } else {
        // Create new
        const { data, error } = await supabase
          .from("email_sequences")
          .insert({
            ...formData,
            stylist_id: stylistProfile.id,
          })
          .select()
          .single();

        if (error) throw error;
        sequenceId = data.id;
      }

      // Insert steps
      const stepsToInsert = steps.map((step) => ({
        sequence_id: sequenceId,
        ...step,
      }));

      const { error: stepsError } = await supabase
        .from("email_sequence_steps")
        .insert(stepsToInsert);

      if (stepsError) throw stepsError;
    },
    onSuccess: () => {
      toast.success("Sequence saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["email_sequences"] });
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error("Failed to save sequence", error.message);
    },
  });

  const addStep = () => {
    setSteps([
      ...steps,
      {
        step_order: steps.length + 1,
        name: `Email ${steps.length + 1}`,
        subject: "",
        body_html: "",
        delay_amount: 1,
        delay_unit: "days",
        send_time_preference: "any_time",
      },
    ]);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // Reorder
    newSteps.forEach((step, i) => {
      step.step_order = i + 1;
      step.name = `Email ${i + 1}`;
    });
    setSteps(newSteps);
  };

  const updateStep = (index: number, field: string, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  // Preview email with sample data
  const generatePreviewHtml = (step: Step) => {
    let preview = step.body_html;
    
    // Replace variables with sample data
    preview = preview.replace(/\{\{client_name\}\}/g, "Sarah Johnson");
    preview = preview.replace(/\{\{stylist_name\}\}/g, "Emily Smith");
    preview = preview.replace(/\{\{business_name\}\}/g, "Glamour Hair Studio");
    preview = preview.replace(/\{\{appointment_date\}\}/g, "Tuesday, October 15, 2025 at 2:00 PM");
    preview = preview.replace(/\{\{appointment_time\}\}/g, "2:00 PM");
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            h1, h2, h3 { color: #7c3aed; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          ${preview}
          <div class="footer">
            <p><strong>Sample Preview</strong> - Variables replaced with example data</p>
            <p>Unsubscribe link will be automatically added to live emails</p>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        saveMutation.mutate();
      }}
      className="space-y-6"
    >
      {/* Sequence Details */}
      <Card className="p-6 border-2 space-y-4">
        <h3 className="font-bold text-lg">Sequence Details</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Sequence Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., New Client Welcome Series"
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trigger">Trigger Type *</Label>
            <Select
              value={formData.trigger_type}
              onValueChange={(value) => setFormData({ ...formData, trigger_type: value })}
            >
              <SelectTrigger id="trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">📝 Manual</SelectItem>
                <SelectItem value="new_client">🆕 New Client</SelectItem>
                <SelectItem value="post_appointment">✅ Post-Appointment</SelectItem>
                <SelectItem value="inactive_client">💤 Inactive Client</SelectItem>
                <SelectItem value="birthday">🎂 Birthday</SelectItem>
                <SelectItem value="anniversary">🎉 Anniversary</SelectItem>
                <SelectItem value="pre_appointment">⏰ Pre-Appointment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="retention">Retention</SelectItem>
                <SelectItem value="promotional">Promotional</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 flex items-center justify-between">
            <Label htmlFor="active">Active</Label>
            <Switch
              id="active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the purpose of this sequence..."
            rows={3}
            maxLength={500}
          />
        </div>
      </Card>

      {/* Email Steps */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Email Steps</h3>
          <Button type="button" variant="outline" size="sm" onClick={addStep} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Step
          </Button>
        </div>

        {steps.map((step, index) => (
          <Card key={index} className="p-6 border-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">Step {index + 1}</span>
              </div>
              {steps.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStep(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Email Subject *</Label>
                <Input
                  value={step.subject}
                  onChange={(e) => updateStep(index, "subject", e.target.value)}
                  placeholder="e.g., Welcome to {{stylist_name}}'s salon!"
                  required
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  Use variables: &#123;&#123;client_name&#125;&#125;, &#123;&#123;stylist_name&#125;&#125;, &#123;&#123;appointment_date&#125;&#125;
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <Label>Email Body (HTML) *</Label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        disabled={!step.body_html}
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] w-[95vw] sm:w-full">
                      <DialogHeader>
                        <DialogTitle>Email Preview - {step.subject || "Untitled"}</DialogTitle>
                      </DialogHeader>
                      <div className="border rounded-lg overflow-auto max-h-[60vh]">
                        <iframe
                          srcDoc={generatePreviewHtml(step)}
                          className="w-full h-[500px]"
                          title="Email Preview"
                          sandbox="allow-same-origin"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Textarea
                  value={step.body_html}
                  onChange={(e) => updateStep(index, "body_html", e.target.value)}
                  placeholder="Enter your email content here..."
                  rows={8}
                  required
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label>Delay {index === 0 ? "Before Sending" : "After Previous Email"}</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={step.delay_amount}
                    onChange={(e) => updateStep(index, "delay_amount", parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-24"
                  />
                  <Select
                    value={step.delay_unit}
                    onValueChange={(value) => updateStep(index, "delay_unit", value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Send Time Preference</Label>
                <Select
                  value={step.send_time_preference}
                  onValueChange={(value) => updateStep(index, "send_time_preference", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any_time">Any Time</SelectItem>
                    <SelectItem value="morning">Morning (8-11 AM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12-4 PM)</SelectItem>
                    <SelectItem value="evening">Evening (5-8 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={saveMutation.isPending}
          className="flex-1 gap-2"
          size="lg"
        >
          {saveMutation.isPending ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {sequence ? "Update Sequence" : "Create Sequence"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
