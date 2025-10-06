import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileJson, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const DataExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleExportData = async () => {
    if (!user) return;

    setIsExporting(true);
    try {
      // Call edge function to generate data export
      const { data, error } = await supabase.functions.invoke('export-user-data', {
        body: { userId: user.id }
      });

      if (error) throw error;

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hair-app-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Data Exported Successfully",
        description: "Your data has been downloaded as a JSON file.",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Failed",
        description: "Unable to export your data. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="p-6 brutal-border brutal-shadow-sm">
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <FileJson className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Export Your Data</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Download a complete copy of all your personal data stored in our system. 
              This includes your profile, appointments, messages, formulas, and more.
            </p>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <p className="text-sm font-medium">Your export will include:</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Profile information and settings</li>
            <li>Appointment history</li>
            <li>Hair formulas (stylists only)</li>
            <li>Messages and conversations</li>
            <li>Reviews and ratings</li>
            <li>Client/Stylist relationships</li>
            <li>Portfolio images (links)</li>
            <li>Payment history (transaction records)</li>
          </ul>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Format: JSON • Compliant with GDPR Article 20
          </p>
          <Button onClick={handleExportData} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download My Data
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
