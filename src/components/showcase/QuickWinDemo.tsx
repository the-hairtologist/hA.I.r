/**
 * Quick Win Demo Component
 * 60-second value demonstration showing immediate benefits
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  Clock,
  DollarSign,
  CheckCircle2,
  TrendingUp,
  Zap,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickWin {
  icon: any;
  title: string;
  before: string;
  after: string;
  savings: string;
  color: string;
}

const quickWins: QuickWin[] = [
  {
    icon: Sparkles,
    title: "Generate Formula",
    before: "2-5 minutes guessing",
    after: "10 seconds AI-perfect",
    savings: "2-5 min saved",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Calendar,
    title: "Book Appointment",
    before: "Phone tag, voicemail",
    after: "30 seconds, instant",
    savings: "10+ min saved",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: Clock,
    title: "Check Schedule",
    before: "Open book, flip pages",
    after: "Glance at phone",
    savings: "30 sec saved",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: DollarSign,
    title: "Track Revenue",
    before: "Spreadsheets, calculator",
    after: "Real-time dashboard",
    savings: "15+ min saved",
    color: "from-amber-500 to-orange-500",
  },
];

export function QuickWinDemo() {
  const [currentWin, setCurrentWin] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    // Auto-cycle through wins
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCompleted((c) => [...c, currentWin]);
          setCurrentWin((w) => (w + 1) % quickWins.length);
          return 0;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentWin]);

  const win = quickWins[currentWin];
  const Icon = win.icon;
  const totalSaved = completed.length * 5; // Simplified calculation

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Badge className="mb-4" variant="secondary">
          <Zap className="h-3 w-3 mr-1" />
          60-Second Demo
        </Badge>
        <h2 className="text-3xl font-bold mb-2">See Immediate Value</h2>
        <p className="text-muted-foreground">
          Watch how hA.I.r saves time on everyday tasks
        </p>
      </div>

      {/* Main Demo Card */}
      <Card className="mb-6 overflow-hidden">
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-5",
          win.color
        )} />
        
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center",
                win.color
              )}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">{win.title}</CardTitle>
                <Badge variant="outline" className="mt-1">
                  {win.savings}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Progress</div>
              <div className="text-2xl font-bold">{completed.length}/4</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Progress value={progress} className="h-2" />

          {/* Before/After Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                ❌ Old Way
              </div>
              <p className="text-sm text-muted-foreground">{win.before}</p>
            </div>

            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
                ✅ With hA.I.r
              </div>
              <p className="text-sm text-muted-foreground">{win.after}</p>
            </div>
          </div>

          {/* Completed Wins */}
          {completed.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {completed.map((winIndex) => {
                const completedWin = quickWins[winIndex];
                const CompletedIcon = completedWin.icon;
                return (
                  <Badge key={winIndex} variant="secondary" className="gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    {completedWin.title}
                  </Badge>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Saved Summary */}
      {completed.length > 0 && (
        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Time Saved (Just These Tasks)
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  ~{totalSaved} minutes
                </div>
              </div>
              <TrendingUp className="h-12 w-12 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Imagine this across 10-20 clients per day. That's 2-3 hours saved daily.
            </p>
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      {completed.length === quickWins.length && (
        <div className="text-center mt-6 animate-fade-in">
          <Button size="lg" className="gap-2">
            <Sparkles className="h-5 w-5" />
            Start Saving Time Today
          </Button>
        </div>
      )}
    </div>
  );
}
