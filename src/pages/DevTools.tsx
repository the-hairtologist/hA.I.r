/**
 * Dev Tools Page
 * Test data seeding and development utilities
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { seedTestData } from "@/lib/testData";
import { logger } from "@/lib/logging/productionLogger";
import { Loader2, Database, Trash2, Users, Calendar, MessageSquare } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function DevTools() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleSeedClients = async () => {
    if (!user) return;
    setLoading(true);
    addLog("Starting client data generation...");
    
    try {
      const clients = await seedTestData.generateClients(user.id, 5);
      addLog(`✓ Generated ${clients.length} test clients`);
      success(`Created ${clients.length} test clients`);
      logger.info("Test clients seeded", { count: clients.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to seed clients";
      addLog(`✗ Error: ${message}`);
      showError(message);
      logger.error("Failed to seed test clients", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedAppointments = async () => {
    if (!user) return;
    setLoading(true);
    addLog("Starting appointment generation...");
    
    try {
      // Get stylist profile
      const { data: stylist } = await supabase
        .from("stylist_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      
      if (!stylist) {
        throw new Error("No stylist profile found");
      }

      // Get clients
      const { data: clients } = await supabase
        .from("client_profiles")
        .select("id")
        .limit(10);
      
      if (!clients?.length) {
        throw new Error("No clients found. Please seed clients first.");
      }

      const appointments = await seedTestData.generateAppointments(
        stylist.id,
        clients.map(c => c.id),
        10
      );
      
      addLog(`✓ Generated ${appointments.length} test appointments`);
      success(`Created ${appointments.length} test appointments`);
      logger.info("Test appointments seeded", { count: appointments.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to seed appointments";
      addLog(`✗ Error: ${message}`);
      showError(message);
      logger.error("Failed to seed test appointments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedFormulas = async () => {
    if (!user) return;
    setLoading(true);
    addLog("Starting formula generation...");
    
    try {
      // Get stylist profile
      const { data: stylist } = await supabase
        .from("stylist_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      
      if (!stylist) {
        throw new Error("No stylist profile found");
      }

      // Get clients
      const { data: clients } = await supabase
        .from("client_profiles")
        .select("id")
        .limit(5);
      
      if (!clients?.length) {
        throw new Error("No clients found. Please seed clients first.");
      }

      const formulas = await seedTestData.generateFormulas(
        stylist.id,
        clients.map(c => c.id),
        5
      );
      
      addLog(`✓ Generated ${formulas.length} test formulas`);
      success(`Created ${formulas.length} test formulas`);
      logger.info("Test formulas seeded", { count: formulas.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to seed formulas";
      addLog(`✗ Error: ${message}`);
      showError(message);
      logger.error("Failed to seed test formulas", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearTestData = async () => {
    if (!confirm("This will delete all test data. Continue?")) return;
    
    setLoading(true);
    addLog("Clearing test data...");
    
    try {
      await seedTestData.clearTestData();
      addLog("✓ Test data cleared");
      success("Test data cleared successfully");
      logger.info("Test data cleared");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to clear test data";
      addLog(`✗ Error: ${message}`);
      showError(message);
      logger.error("Failed to clear test data", err);
    } finally {
      setLoading(false);
    }
  };

  if (!import.meta.env.DEV) {
    return (
      <DashboardLayout>
        <Card>
          <CardHeader>
            <CardTitle>Dev Tools</CardTitle>
            <CardDescription>Only available in development mode</CardDescription>
          </CardHeader>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Development Tools
            </CardTitle>
            <CardDescription>
              Seed test data and manage development environment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Button
                onClick={handleSeedClients}
                disabled={loading}
                className="gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                Seed 5 Test Clients
              </Button>
              
              <Button
                onClick={handleSeedAppointments}
                disabled={loading}
                variant="outline"
                className="gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                Seed 10 Appointments
              </Button>
              
              <Button
                onClick={handleSeedFormulas}
                disabled={loading}
                variant="outline"
                className="gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                Seed 5 Formulas
              </Button>
              
              <Button
                onClick={handleClearTestData}
                disabled={loading}
                variant="destructive"
                className="gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Clear Test Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-muted p-4 font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
                {logs.map((log, i) => (
                  <div key={i} className="text-muted-foreground">
                    {log}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
