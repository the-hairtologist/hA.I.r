import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, User, Scissors, AlertTriangle, History, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIContextPanelProps {
  clientContext: any;
  stylistContext: any;
  onSelectClient?: () => void;
  showClientSelector?: boolean;
}

export const AIContextPanel = ({ 
  clientContext, 
  stylistContext,
  onSelectClient,
  showClientSelector = false
}: AIContextPanelProps) => {
  const hasContext = clientContext || stylistContext;

  if (!hasContext && !showClientSelector) return null;

  return (
    <Card className="brutal-border bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="text-xs sm:text-sm lg:text-base font-pixel flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          AI Context Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Client Context */}
        {clientContext ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-secondary" />
              <span className="text-xs sm:text-sm font-semibold">{clientContext.full_name}</span>
              <Badge variant="secondary" className="text-[11px] sm:text-xs">Client</Badge>
            </div>

            {clientContext.hair_type && (
              <div className="text-[11px] sm:text-xs">
                <span className="text-muted-foreground">Hair Type:</span>{" "}
                <span className="font-medium">{clientContext.hair_type}</span>
              </div>
            )}

            {clientContext.hair_goals && (
              <div className="text-[11px] sm:text-xs">
                <Target className="h-3 w-3 inline mr-1 text-accent" />
                <span className="text-muted-foreground">Goals:</span>{" "}
                <span className="font-medium">{clientContext.hair_goals}</span>
              </div>
            )}

            {clientContext.allergies && (
              <div className="text-[11px] sm:text-xs bg-destructive/10 p-2 rounded-lg border-2 border-destructive/20">
                <AlertTriangle className="h-3 w-3 inline mr-1 text-destructive" />
                <span className="text-destructive font-semibold">Allergies:</span>{" "}
                <span className="text-destructive">{clientContext.allergies}</span>
              </div>
            )}

            {clientContext.sensitivity_notes && (
              <div className="text-[11px] sm:text-xs">
                <span className="text-muted-foreground">Sensitivities:</span>{" "}
                <span className="font-medium">{clientContext.sensitivity_notes}</span>
              </div>
            )}

            {clientContext.recentFormulas?.length > 0 && (
              <div className="text-[11px] sm:text-xs space-y-1">
                <div className="flex items-center gap-1">
                  <History className="h-3 w-3 text-primary" />
                  <span className="font-semibold">Recent Formulas ({clientContext.recentFormulas.length})</span>
                </div>
                {clientContext.recentFormulas.slice(0, 2).map((f: any) => (
                  <div key={f.id || f.formula_name} className="text-muted-foreground pl-4">
                    • {f.formula_name}
                  </div>
                ))}
              </div>
            )}

            {clientContext.client_since && (
              <div className="text-[11px] sm:text-xs text-muted-foreground">
                Client since {new Date(clientContext.client_since).toLocaleDateString()}
              </div>
            )}
          </div>
        ) : showClientSelector && onSelectClient && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSelectClient}
            className="w-full"
          >
            <User className="h-4 w-4 mr-2" />
            Select Client for Context
          </Button>
        )}

        {/* Stylist Context */}
        {stylistContext && (
          <div className="space-y-3 pt-3 border-t-2 border-border">
            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4 text-primary" />
              <span className="text-xs sm:text-sm font-semibold">Your Profile</span>
            </div>

            {stylistContext.business_name && (
              <div className="text-[11px] sm:text-xs">
                <span className="text-muted-foreground">Business:</span>{" "}
                <span className="font-medium">{stylistContext.business_name}</span>
              </div>
            )}

            {stylistContext.color_line && (
              <div className="text-[11px] sm:text-xs">
                <span className="text-muted-foreground">Preferred Line:</span>{" "}
                <Badge variant="secondary" className="text-[11px] sm:text-xs">{stylistContext.color_line}</Badge>
              </div>
            )}

            {stylistContext.specialty && (
              <div className="text-[11px] sm:text-xs">
                <span className="text-muted-foreground">Specialty:</span>{" "}
                <span className="font-medium">{stylistContext.specialty}</span>
              </div>
            )}

            {stylistContext.years_experience && (
              <div className="text-[11px] sm:text-xs text-muted-foreground">
                {stylistContext.years_experience} years of experience
              </div>
            )}
          </div>
        )}

        {hasContext && (
          <div className="text-[11px] sm:text-xs text-muted-foreground pt-2 border-t border-border">
            <Brain className="h-3 w-3 inline mr-1" />
            AI will use this context to personalize all responses
          </div>
        )}
      </CardContent>
    </Card>
  );
};