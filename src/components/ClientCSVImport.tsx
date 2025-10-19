/**
 * Client CSV Import Component
 * Allows stylists to bulk import clients from CSV
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ClientCSVImportProps {
  stylistId: string;
  onImportComplete: () => void;
}

export function ClientCSVImport({ stylistId, onImportComplete }: ClientCSVImportProps) {
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  const downloadTemplate = () => {
    const template = "full_name,email,phone,hair_type,allergies,notes\nJane Doe,jane@example.com,555-0100,Curly Type 3C,None,Prefers warm tones\nJohn Smith,john@example.com,555-0200,Straight Fine,PPD sensitive,Low maintenance";
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'client_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success("Template downloaded!");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setResults(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error("CSV file is empty or invalid");
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const requiredHeaders = ['full_name'];
      
      if (!requiredHeaders.every(h => headers.includes(h))) {
        toast.error("CSV must include 'full_name' column");
        return;
      }

      const clients = [];
      const errors: string[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const client: any = {};
        
        headers.forEach((header, index) => {
          if (values[index]) {
            client[header] = values[index];
          }
        });

        if (!client.full_name) {
          errors.push(`Row ${i + 1}: Missing full_name`);
          continue;
        }

        if (client.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) {
          errors.push(`Row ${i + 1}: Invalid email format`);
          continue;
        }

        clients.push({
          preferred_stylist_id: stylistId,
          full_name: client.full_name,
          email: client.email || null,
          phone: client.phone || null,
          hair_type: client.hair_type || null,
          allergies: client.allergies || null,
          notes: client.notes || null,
        });
      }

      let successCount = 0;
      
      for (const client of clients) {
        try {
          const { error } = await supabase
            .from("client_profiles")
            .insert(client);
          
          if (error) {
            errors.push(`Failed to import ${client.full_name}: ${error.message}`);
          } else {
            successCount++;
          }
        } catch (err) {
          errors.push(`Failed to import ${client.full_name}: ${err}`);
        }
      }

      setResults({
        success: successCount,
        failed: errors.length,
        errors,
      });

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} client${successCount !== 1 ? 's' : ''}!`);
        onImportComplete();
      }
    } catch (error) {
      console.error("Error importing CSV:", error);
      toast.error("Failed to process CSV file");
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  return (
    <Card className="border-2 border-foreground shadow-brutal">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Import Clients
        </CardTitle>
        <CardDescription>
          Import multiple clients from a CSV file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>
          
          <Button
            variant="default"
            onClick={() => document.getElementById('csv-upload')?.click()}
            disabled={importing}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {importing ? "Importing..." : "Upload CSV"}
          </Button>
          
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {results && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Import Results:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>✓ Successfully imported: {results.success}</li>
                {results.failed > 0 && (
                  <li className="text-destructive">✗ Failed: {results.failed}</li>
                )}
              </ul>
              {results.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium">
                    View Errors ({results.errors.length})
                  </summary>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground max-h-40 overflow-y-auto">
                    {results.errors.map((error, idx) => (
                      <li key={`error-${idx}-${error.substring(0, 20)}`}>{error}</li>
                    ))}
                  </ul>
                </details>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>CSV Format:</strong> Include columns: full_name (required), email, phone, hair_type, allergies, notes
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
