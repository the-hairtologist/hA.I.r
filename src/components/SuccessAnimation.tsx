import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface SuccessAnimationProps {
  message?: string;
  onComplete?: () => void;
  duration?: number;
}

export const SuccessAnimation = ({
  message = "Success!",
  onComplete,
  duration = 2000,
}: SuccessAnimationProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-emergency flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border-2 border-border rounded-lg p-8 shadow-lg animate-scale-in">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center animate-bounce-gentle">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <p className="text-lg font-semibold text-center">{message}</p>
        </div>
      </div>
    </div>
  );
};
