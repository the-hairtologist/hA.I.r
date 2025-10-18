import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layout, Sparkles, Copy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const EmailTemplates = () => {
  const { user } = useAuth();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["email_templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("is_global", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Email Templates</h2>
        <p className="text-sm text-muted-foreground">
          Pre-built email templates you can use in your sequences
        </p>
      </div>

      {isLoading ? (
        <Card className="p-12 text-center border-2">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        </Card>
      ) : templates?.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed">
          <Layout className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Templates Available</h3>
          <p className="text-muted-foreground">
            Templates will appear here once they're added by admins
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {templates?.map((template: any) => (
            <Card key={template.id} className="p-6 border-2 hover:shadow-lg transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{template.name}</h3>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                        Global
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {template.description || "No description"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {template.category}
                  </Badge>
                  {template.variables && (
                    <Badge variant="outline" className="text-xs">
                      {JSON.parse(template.variables).length} variables
                    </Badge>
                  )}
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">SUBJECT:</p>
                  <p className="text-sm">{template.subject_template}</p>
                </div>

                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Copy className="h-4 w-4" />
                  Use Template
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
