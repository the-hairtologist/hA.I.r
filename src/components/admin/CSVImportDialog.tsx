/**
 * CSV Import Dialog
 * Bulk import clients from CSV
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

export function CSVImportDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);

  const downloadTemplate = () => {
    const template = `full_name,email,phone,birthday,hair_type,notes
Jane Doe,jane@example.com,(555) 123-4567,1990-05-15,wavy,Prefers morning appointments
John Smith,john@example.com,(555) 987-6543,1985-10-20,straight,Allergic to certain products`;
    
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "client_import_template.csv";
    a.click();
    toast.success("Template downloaded");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split("\n").filter(line => line.trim());
    const headers = lines[0].split(",").map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim());
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || null;
      });
      return obj;
    });
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setImporting(true);
    setProgress(0);
    
    try {
      // Get stylist profile
      const { data: stylistProfile } = await supabase
        .from("stylist_profiles")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (!stylistProfile) throw new Error("Stylist profile not found");

      // Read CSV file
      const text = await file.text();
      const clients = parseCSV(text);
      
      const total = clients.length;
      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      // Import clients one by one
      for (let i = 0; i < clients.length; i++) {
        const client = clients[i];
        setProgress(((i + 1) / total) * 100);

        try {
          // Validate required fields
          if (!client.full_name || !client.email) {
            throw new Error("Missing required fields: full_name or email");
          }

          // Insert client
          const { error } = await supabase
            .from("client_profiles")
            .insert({
              full_name: client.full_name,
              email: client.email,
              phone: client.phone || null,
              birthday: client.birthday || null,
              hair_type: client.hair_type || null,
              notes: client.notes || null,
              preferred_stylist_id: stylistProfile.id,
            });

          if (error) throw error;
          success++;
        } catch (error: any) {
          failed++;
          errors.push(`Row ${i + 2}: ${error.message}`);
        }
      }

      setResult({ total, success, failed, errors });
      
      if (failed === 0) {
        toast.success(`Successfully imported ${success} clients!`);
      } else {
        toast.warning(`Imported ${success} clients with ${failed} errors`);
      }
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(error.message || "Failed to import");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Clients from CSV</DialogTitle>
          <DialogDescription className="space-y-2">
            <span>Upload a CSV file to bulk import client data</span>
            <div className="text-xs bg-primary/10 border border-primary/20 rounded p-2 mt-2">
              <p className="font-medium mb-1">Required Fields:</p>
              <p className="text-muted-foreground">• full_name • email</p>
              <p className="font-medium mt-2 mb-1">Optional Fields:</p>
              <p className="text-muted-foreground">• phone • birthday • hair_type • notes</p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Download Template */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Need a template?</p>
              <p className="text-xs text-muted-foreground">
                Download our CSV template to get started
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
            >
              <Download className="mr-2 h-4 w-4" />
              Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload CSV File</label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
            {file && (
              <p className="text-xs text-muted-foreground">
                Selected: {file.name}
              </p>
            )}
          </div>

          {/* Progress */}
          {importing && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-center text-muted-foreground">
                Importing... {Math.round(progress)}%
              </p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-3 p-3 border rounded-lg">
              <h4 className="font-medium text-sm">Import Results</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Total: {result.total}
                  </Badge>
                  <Badge className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Success: {result.success}
                  </Badge>
                  {result.failed > 0 && (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Failed: {result.failed}
                    </Badge>
                  )}
                </div>

                {result.errors.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Errors:
                    </p>
                    <div className="max-h-[150px] overflow-y-auto space-y-1">
                      {result.errors.map((error, i) => (
                        <p key={i} className="text-xs text-red-500">
                          {error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={importing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || importing}
          >
            {importing ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
