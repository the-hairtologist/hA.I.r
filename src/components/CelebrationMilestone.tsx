import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Gift, Copy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Confetti from "react-confetti";

interface CelebrationMilestoneProps {
  clientId: string;
  onClose?: () => void;
}

export const CelebrationMilestone = ({ clientId, onClose }: CelebrationMilestoneProps) => {
  const { toast } = useToast();
  const [milestone, setMilestone] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    checkForMilestone();
  }, [clientId]);

  const checkForMilestone = async () => {
    try {
      const { data } = await supabase
        .from("client_milestones")
        .select("*")
        .eq("client_id", clientId)
        .eq("celebrated", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setMilestone(data);
        setShowConfetti(true);
        
        // Auto-hide confetti after 5 seconds
        setTimeout(() => setShowConfetti(false), 5000);
      }
    } catch (error) {
      console.error("Error checking milestones:", error);
    }
  };

  const markAsCelebrated = async () => {
    if (!milestone) return;

    try {
      await supabase
        .from("client_milestones")
        .update({ celebrated: true })
        .eq("id", milestone.id);

      toast({
        title: "Milestone Celebrated! 🎉",
        description: "Your discount code has been saved",
      });

      if (onClose) onClose();
    } catch (error) {
      console.error("Error marking milestone:", error);
    }
  };

  const copyDiscountCode = () => {
    if (milestone?.discount_code) {
      navigator.clipboard.writeText(milestone.discount_code);
      toast({
        title: "Code Copied!",
        description: "Discount code copied to clipboard",
      });
    }
  };

  if (!milestone) return null;

  const getMilestoneEmoji = () => {
    if (milestone.milestone_type === "anniversary") return "🎂";
    if (milestone.milestone_value === 5) return "⭐";
    if (milestone.milestone_value === 10) return "💎";
    if (milestone.milestone_value >= 25) return "👑";
    return "🎉";
  };

  const getMilestoneMessage = () => {
    if (milestone.milestone_type === "anniversary") {
      return `${milestone.milestone_value} Year${milestone.milestone_value > 1 ? "s" : ""} Together!`;
    }
    return `${milestone.milestone_value} Appointments Complete!`;
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-modal-backdrop flex items-center justify-center p-4 animate-fade-in">
        <Card className="max-w-md w-full border-2 border-primary/20 shadow-2xl animate-scale-in">
          <CardContent className="p-8 text-center space-y-6">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={onClose}
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>

            {/* Animated emoji */}
            <div className="relative">
              <div className="text-8xl animate-bounce mb-4">{getMilestoneEmoji()}</div>
              <Sparkles className="absolute top-0 left-1/2 -translate-x-1/2 h-8 w-8 text-primary animate-pulse" />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Congratulations!
              </h2>
              <p className="text-xl font-semibold">{getMilestoneMessage()}</p>
              <p className="text-muted-foreground">
                You're an amazing client and we appreciate your loyalty!
              </p>
            </div>

            {/* Reward */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 rounded-xl space-y-4">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Gift className="h-6 w-6" />
                <span className="text-lg font-semibold">Special Reward</span>
              </div>

              <div className="space-y-3">
                <div className="text-3xl font-bold text-primary">
                  ${milestone.discount_amount} OFF
                </div>
                <p className="text-sm text-muted-foreground">Your next appointment</p>

                {/* Discount Code */}
                <div className="bg-background p-4 rounded-lg space-y-2">
                  <p className="text-xs text-muted-foreground">Your discount code:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono text-lg font-bold px-3 py-2 bg-muted rounded">
                      {milestone.discount_code}
                    </code>
                    <Button size="icon" variant="outline" onClick={copyDiscountCode}>
                      <Copy className="h-5 w-5 sm:h-6 sm:w-6" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-2">
              <Button onClick={markAsCelebrated} className="w-full" size="lg">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                Awesome, Thank You!
              </Button>
              <p className="text-xs text-muted-foreground">
                Your code has been saved and can be used anytime
              </p>
            </div>

            {/* Powered by */}
            <p className="text-xs text-muted-foreground pt-4">
              Powered by{" "}
              <span className="font-semibold text-primary">hA.I.r</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
