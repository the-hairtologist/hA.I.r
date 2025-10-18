/**
 * Onboarding Test Page
 * Debug and test the first-time user experience
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, PlayCircle, CheckCircle, XCircle, Info } from "lucide-react";
import { toast } from "sonner";

interface OnboardingStatus {
  onboarding_completed: boolean;
  has_visited: boolean;
  session_count: number;
  quick_tips_dismissed: boolean;
  tour_completed: string[];
  tour_dismissed: string[];
}

export default function OnboardingTest() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);

  const checkStatus = () => {
    const onboarding_completed = localStorage.getItem("onboarding_completed") === "true";
    const has_visited = localStorage.getItem("has_visited") === "true";
    const session_count = parseInt(localStorage.getItem("session_count") || "0");
    const quick_tips_dismissed = localStorage.getItem("quick_tips_dismissed") === "true";
    
    let tour_completed: string[] = [];
    let tour_dismissed: string[] = [];
    
    try {
      tour_completed = JSON.parse(localStorage.getItem("hair-completed-tours") || "[]");
      tour_dismissed = JSON.parse(localStorage.getItem("hair-dismissed-tours") || "[]");
    } catch {
      tour_completed = [];
      tour_dismissed = [];
    }

    setStatus({
      onboarding_completed,
      has_visited,
      session_count,
      quick_tips_dismissed,
      tour_completed,
      tour_dismissed,
    });
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const resetAllOnboarding = () => {
    // Clear all onboarding-related localStorage
    localStorage.removeItem("onboarding_completed");
    localStorage.removeItem("onboarding_completed_at");
    localStorage.removeItem("has_visited");
    localStorage.removeItem("session_count");
    localStorage.removeItem("quick_tips_dismissed");
    localStorage.removeItem("tour_completed");
    localStorage.removeItem("has_seen_welcome");
    localStorage.removeItem("discovered_features");
    localStorage.removeItem("hair-completed-tours");
    localStorage.removeItem("hair-dismissed-tours");
    
    checkStatus();
    toast.success("Onboarding reset!", {
      description: "All flags cleared. Refresh to see onboarding.",
    });
  };

  const testOnboarding = () => {
    resetAllOnboarding();
    setTimeout(() => {
      navigate("/dashboard");
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }, 500);
  };

  const testQuickTips = () => {
    // Reset only quick tips
    localStorage.removeItem("quick_tips_dismissed");
    localStorage.setItem("session_count", "0");
    checkStatus();
    toast.success("Quick Tips reset!", {
      description: "Navigate to dashboard to see tips.",
    });
  };

  const StatusBadge = ({ value }: { value: boolean }) => (
    value ? (
      <Badge variant="default" className="gap-1">
        <CheckCircle className="h-3 w-3" />
        Yes
      </Badge>
    ) : (
      <Badge variant="secondary" className="gap-1">
        <XCircle className="h-3 w-3" />
        No
      </Badge>
    )
  );

  if (!status) return null;

  return (
    <div className="min-h-screen-safe bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Onboarding Test Center</h1>
            <p className="text-muted-foreground mt-1">
              Debug and test first-time user experience
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>

        {/* Current Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Current Onboarding Status
            </CardTitle>
            <CardDescription>
              These flags control what onboarding elements appear
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">Onboarding Completed</span>
                <StatusBadge value={status.onboarding_completed} />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">Has Visited Before</span>
                <StatusBadge value={status.has_visited} />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">Session Count</span>
                <Badge variant="outline">{status.session_count}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">Quick Tips Dismissed</span>
                <StatusBadge value={status.quick_tips_dismissed} />
              </div>
            </div>

            {status.tour_completed.length > 0 && (
              <div className="p-3 border rounded-lg">
                <span className="font-medium">Completed Tours:</span>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {status.tour_completed.map((tour) => (
                    <Badge key={tour} variant="default">
                      {tour}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {status.tour_dismissed.length > 0 && (
              <div className="p-3 border rounded-lg">
                <span className="font-medium">Dismissed Tours:</span>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {status.tour_dismissed.map((tour) => (
                    <Badge key={tour} variant="secondary">
                      {tour}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Test Actions
            </CardTitle>
            <CardDescription>
              Reset and trigger onboarding components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={testOnboarding} 
              className="w-full justify-start gap-2"
              size="lg"
            >
              <PlayCircle className="h-4 w-4" />
              Test Full Onboarding Flow
              <Badge variant="secondary" className="ml-auto">
                Reloads Dashboard
              </Badge>
            </Button>

            <Button 
              onClick={testQuickTips} 
              variant="outline"
              className="w-full justify-start gap-2"
              size="lg"
            >
              <Info className="h-4 w-4" />
              Test Quick Tips Only
              <Badge variant="secondary" className="ml-auto">
                Shows after 5s
              </Badge>
            </Button>

            <Button 
              onClick={resetAllOnboarding} 
              variant="outline"
              className="w-full justify-start gap-2"
              size="lg"
            >
              <RefreshCw className="h-4 w-4" />
              Reset All Flags (No Reload)
            </Button>

            <Button 
              onClick={checkStatus} 
              variant="ghost"
              className="w-full justify-start gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Status
            </Button>
          </CardContent>
        </Card>

        {/* Expected Behavior Card */}
        <Card>
          <CardHeader>
            <CardTitle>Expected Behavior</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">First-Time Onboarding:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Shows when <code>onboarding_completed</code> is false AND <code>has_visited</code> is false</li>
                <li>Appears after 1.5 seconds delay</li>
                <li>Guides through 3 steps: Schedule → Services → Clients</li>
                <li>Can be skipped or completed</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Quick Tips:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Shows when <code>session_count</code> &lt; 3 AND <code>quick_tips_dismissed</code> is false</li>
                <li>Appears after 5 seconds delay</li>
                <li>Shows 4 tips with progress dots</li>
                <li>Does NOT show on landing page (/), auth pages, or install page</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Guided Tours:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Auto-start on Dashboard, Clients, AI Assistant, Formulas pages</li>
                <li>Show when not completed or dismissed</li>
                <li>Appear after 1 second delay</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Test Checklist Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>✅ Test Checklist</CardTitle>
            <CardDescription>
              Verify these items work correctly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>First-time onboarding dialog appears after 1.5s</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Can navigate through all 3 onboarding steps</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Can skip individual steps</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Can skip entire tour with "Skip Tour" button</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Quick Tips appear after 5s on dashboard (for sessions 1-3)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Quick Tips show 4 tips with progress dots</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Quick Tips can be dismissed</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Onboarding doesn't show again after completion</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Guided tour works on Dashboard page</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Everything works on mobile device</span>
            </label>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
