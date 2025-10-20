import { useEffect } from "react";
import confetti from "canvas-confetti";

interface MilestoneConfettiProps {
  trigger: boolean;
  variant?: "celebration" | "subtle" | "epic";
}

export const MilestoneConfetti = ({ 
  trigger, 
  variant = "celebration" 
}: MilestoneConfettiProps) => {
  useEffect(() => {
    if (!trigger) return;

    if (variant === "subtle") {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
      });
    } else if (variant === "epic") {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    } else {
      // Default celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [trigger, variant]);

  return null;
};
