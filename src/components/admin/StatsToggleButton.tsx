/**
 * Stats Toggle Button
 * Quick hide/show KPI cards
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export function StatsToggleButton() {
  const [statsVisible, setStatsVisible] = useState(() => {
    const saved = localStorage.getItem("dashboard_stats_visible");
    return saved !== "false"; // Default to visible
  });

  useEffect(() => {
    localStorage.setItem("dashboard_stats_visible", String(statsVisible));
    
    // Dispatch event for dashboard to listen to
    window.dispatchEvent(
      new CustomEvent("dashboard:toggle-stats", { detail: { visible: statsVisible } })
    );
  }, [statsVisible]);

  const toggleStats = () => {
    setStatsVisible(!statsVisible);
    toast.info(statsVisible ? "Stats hidden" : "Stats shown");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleStats}
      title={statsVisible ? "Hide statistics" : "Show statistics"}
      className="h-9"
    >
      {statsVisible ? (
        <>
          <EyeOff className="h-4 w-4 mr-2" />
          Hide Stats
        </>
      ) : (
        <>
          <Eye className="h-4 w-4 mr-2" />
          Show Stats
        </>
      )}
    </Button>
  );
}
