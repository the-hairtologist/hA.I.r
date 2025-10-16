import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Zap, Loader2 } from "lucide-react";
import { StructuredFormulaDisplay } from "@/components/StructuredFormulaDisplay";
import { FormulaSafetyBadge } from "@/components/FormulaSafetyBadge";

export default function QuickFormula() {
  const [currentLevel, setCurrentLevel] = useState<string>("");
  const [targetLevel, setTargetLevel] = useState<string>("");
  const [tone, setTone] = useState<string>("");
  const [condition, setCondition] = useState<string>("");
  const [formula, setFormula] = useState<any>(null);
  const [validation, setValidation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!currentLevel || !targetLevel || !tone || !condition) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('quick-formula', {
        body: {
          currentLevel: parseInt(currentLevel),
          targetLevel: parseInt(targetLevel),
          tone,
          condition
        }
      });

      if (error) throw error;
      setFormula(data.formula);

      // Validate formula
      const { data: validationData } = await supabase.functions.invoke('validate-formula', {
        body: { formula: data.formula }
      });
      setValidation(validationData);

      toast({ 
        title: data.cached ? "⚡ Retrieved from cache" : "✅ Formula generated",
        description: data.cached ? "Instant result!" : "New formula created"
      });
    } catch (error: any) {
      toast({ title: "Failed to generate formula", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Quick Formula Generator
            <span className="text-sm text-muted-foreground ml-auto">⚡ 2-second results</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Level</label>
              <Select value={currentLevel} onValueChange={setCurrentLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7,8,9,10].map(l => (
                    <SelectItem key={l} value={l.toString()}>Level {l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Level</label>
              <Select value={targetLevel} onValueChange={setTargetLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7,8,9,10].map(l => (
                    <SelectItem key={l} value={l.toString()}>Level {l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Desired Tone</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cool">Cool/Ash</SelectItem>
                  <SelectItem value="warm">Warm/Golden</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="fashion">Fashion Colors</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hair Condition</label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">Healthy/Virgin</SelectItem>
                  <SelectItem value="damaged">Damaged/Compromised</SelectItem>
                  <SelectItem value="previously_colored">Previously Colored</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Generate Formula
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {formula && (
        <div className="space-y-4">
          <FormulaSafetyBadge validation={validation} />
          <StructuredFormulaDisplay data={formula} />
        </div>
      )}
    </div>
  );
}