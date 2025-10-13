import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Eye, 
  Save, 
  RotateCcw,
  Sparkles,
  Info
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const DEFAULT_EMAIL_SETTINGS = {
  rebooking_enabled: true,
  rebooking_subject: "✨ Time for a Touch-Up with {{stylist_name}}!",
  rebooking_headline: "Hi {{client_name}}! 👋",
  rebooking_opening: "It's been about 6 weeks since your last visit with {{stylist_name}} at {{business_name}}. Your hair is probably ready for some professional love! 💇",
  rebooking_cta_text: "📅 Book Your Appointment",
  rebooking_closing: "{{stylist_name}} is looking forward to seeing you again and help you maintain that fabulous look!",
  custom_message: "",
  show_business_logo: false,
  business_logo_url: "",
};

export default function EmailSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPreview, setShowPreview] = useState(false);

  // Fetch stylist profile
  const { data: stylistProfile } = useQuery({
    queryKey: ["stylist-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("stylist_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch email settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["email-settings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("email_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || { ...DEFAULT_EMAIL_SETTINGS, user_id: user.id };
    },
  });

  // Save settings mutation
  const saveMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("email_settings")
        .upsert({
          ...newSettings,
          user_id: user.id,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-settings"] });
      toast({
        title: "Settings Saved",
        description: "Your email customizations have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const [formData, setFormData] = useState(settings || DEFAULT_EMAIL_SETTINGS);

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handleReset = () => {
    setFormData(DEFAULT_EMAIL_SETTINGS);
  };

  const getPreviewHtml = () => {
    const clientName = "Sarah Johnson";
    const stylistName = stylistProfile?.business_name || "Your Stylist";
    const businessName = stylistProfile?.business_name || "Your Salon";

    const replacePlaceholders = (text: string) => {
      return text
        .replace(/\{\{client_name\}\}/g, clientName)
        .replace(/\{\{stylist_name\}\}/g, stylistName)
        .replace(/\{\{business_name\}\}/g, businessName);
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
                ${formData.show_business_logo && formData.business_logo_url ? `
                <tr>
                  <td style="padding: 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                    <img src="${formData.business_logo_url}" alt="Logo" style="max-width: 150px; height: auto;">
                  </td>
                </tr>
                ` : ''}
                
                <tr>
                  <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 40px 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">
                      ${replacePlaceholders(formData.rebooking_headline || DEFAULT_EMAIL_SETTINGS.rebooking_headline)}
                    </h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 40px;">
                    <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 0 0 20px;">
                      ${replacePlaceholders(formData.rebooking_opening || DEFAULT_EMAIL_SETTINGS.rebooking_opening)}
                    </p>
                    
                    ${formData.custom_message ? `
                    <div style="background-color: #f8f9fa; border-left: 4px solid #6366f1; padding: 20px; margin: 30px 0; border-radius: 8px;">
                      <p style="font-size: 15px; line-height: 1.6; color: #333; margin: 0;">
                        ${replacePlaceholders(formData.custom_message)}
                      </p>
                    </div>
                    ` : ''}
                    
                    <div style="text-align: center; margin: 40px 0;">
                      <a href="#" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(99,102,241,0.3);">
                        ${replacePlaceholders(formData.rebooking_cta_text || DEFAULT_EMAIL_SETTINGS.rebooking_cta_text)}
                      </a>
                    </div>
                    
                    <div style="background-color: #f8f9fa; border-left: 4px solid #6366f1; padding: 20px; margin: 30px 0; border-radius: 8px;">
                      <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 0;">
                        💡 <strong>Pro Tip:</strong> ${replacePlaceholders(formData.rebooking_closing || DEFAULT_EMAIL_SETTINGS.rebooking_closing)}
                      </p>
                    </div>
                  </td>
                </tr>
                
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
                    <p style="font-size: 12px; color: #999; line-height: 1.5; margin: 0 0 10px; text-align: center;">
                      You're receiving this because you had an appointment on <strong>June 1, 2025</strong>.
                      <br>Already rebooked? Great! You can ignore this reminder.
                    </p>
                    
                    <p style="font-size: 11px; color: #aaa; line-height: 1.5; margin: 15px 0 0; text-align: center;">
                      <a href="#" style="color: #6366f1; text-decoration: none;">Unsubscribe from rebooking reminders</a>
                      <br>
                      Powered by hA.I.r - Smart scheduling for stylists
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <p>Loading settings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Mail className="w-8 h-8" />
              Email Customization
            </h1>
            <p className="text-muted-foreground mt-1">
              Personalize your automated rebooking reminder emails
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? "Hide" : "Show"} Preview
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Default
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            <strong>Available placeholders:</strong> Use <code>{"{{client_name}}"}</code>, <code>{"{{stylist_name}}"}</code>, and <code>{"{{business_name}}"}</code> to personalize your emails. These will be automatically replaced with actual client and business information.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Settings Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Email Content
              </CardTitle>
              <CardDescription>
                Customize the content of your rebooking reminder emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable/Disable */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rebooking Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically send reminders after 6 weeks
                  </p>
                </div>
                <Switch
                  checked={formData.rebooking_enabled ?? true}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, rebooking_enabled: checked })
                  }
                />
              </div>

              {/* Subject Line */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={formData.rebooking_subject || ""}
                  onChange={(e) => 
                    setFormData({ ...formData, rebooking_subject: e.target.value })
                  }
                  placeholder="Time for a touch-up!"
                />
                <p className="text-xs text-muted-foreground">
                  The email subject clients will see in their inbox
                </p>
              </div>

              {/* Headline */}
              <div className="space-y-2">
                <Label htmlFor="headline">Email Headline</Label>
                <Input
                  id="headline"
                  value={formData.rebooking_headline || ""}
                  onChange={(e) => 
                    setFormData({ ...formData, rebooking_headline: e.target.value })
                  }
                  placeholder="Hi {{client_name}}!"
                />
              </div>

              {/* Opening Message */}
              <div className="space-y-2">
                <Label htmlFor="opening">Opening Message</Label>
                <Textarea
                  id="opening"
                  rows={3}
                  value={formData.rebooking_opening || ""}
                  onChange={(e) => 
                    setFormData({ ...formData, rebooking_opening: e.target.value })
                  }
                  placeholder="It's been about 6 weeks since your last visit..."
                />
              </div>

              {/* Custom Message */}
              <div className="space-y-2">
                <Label htmlFor="custom">Custom Message (Optional)</Label>
                <Textarea
                  id="custom"
                  rows={3}
                  value={formData.custom_message || ""}
                  onChange={(e) => 
                    setFormData({ ...formData, custom_message: e.target.value })
                  }
                  placeholder="Add a personal touch or special offer..."
                />
                <p className="text-xs text-muted-foreground">
                  This will appear in a highlighted box in the email
                </p>
              </div>

              {/* CTA Button */}
              <div className="space-y-2">
                <Label htmlFor="cta">Button Text</Label>
                <Input
                  id="cta"
                  value={formData.rebooking_cta_text || ""}
                  onChange={(e) => 
                    setFormData({ ...formData, rebooking_cta_text: e.target.value })
                  }
                  placeholder="Book Your Appointment"
                />
              </div>

              {/* Closing */}
              <div className="space-y-2">
                <Label htmlFor="closing">Closing Message</Label>
                <Textarea
                  id="closing"
                  rows={2}
                  value={formData.rebooking_closing || ""}
                  onChange={(e) => 
                    setFormData({ ...formData, rebooking_closing: e.target.value })
                  }
                  placeholder="Looking forward to seeing you..."
                />
              </div>

              {/* Business Logo */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Business Logo</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your logo at the top of emails
                    </p>
                  </div>
                  <Switch
                    checked={formData.show_business_logo ?? false}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, show_business_logo: checked })
                    }
                  />
                </div>

                {formData.show_business_logo && (
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo URL</Label>
                    <Input
                      id="logo"
                      type="url"
                      value={formData.business_logo_url || ""}
                      onChange={(e) => 
                        setFormData({ ...formData, business_logo_url: e.target.value })
                      }
                      placeholder="https://example.com/logo.png"
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload your logo to your website and paste the URL here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {showPreview && (
            <Card className="lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Live Preview
                </CardTitle>
                <CardDescription>
                  See how your email will look to clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-background">
                  <iframe
                    srcDoc={getPreviewHtml()}
                    className="w-full h-[600px]"
                    title="Email Preview"
                    sandbox="allow-same-origin"
                  />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="outline">Sample Data Used</Badge>
                  <p className="text-xs text-muted-foreground">
                    Client: Sarah Johnson | Business: {stylistProfile?.business_name || "Your Salon"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}