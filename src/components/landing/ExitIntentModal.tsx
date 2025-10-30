import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { analytics } from '@/lib/analytics';
import { Sparkles } from 'lucide-react';

interface ExitIntentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const content = {
  title: 'Wait! Get Your First Month Free',
  description:
    'Stop losing clients. Try hA.I.r risk-free for 30 days—no credit card required.',
  primaryCta: 'Start Free Trial',
  secondaryCta: 'Just browsing',
};

export const ExitIntentModal = ({
  open,
  onOpenChange,
}: ExitIntentModalProps) => {
  const navigate = useNavigate();
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = async () => {
    setIsConverting(true);
    analytics.track('exit_intent_converted');
    navigate('/auth');
  };

  const handleDismiss = () => {
    analytics.track('exit_intent_dismissed');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="brutal-border border-4 border-black max-w-md bg-background">
        <DialogHeader>
          <div className="w-16 h-16 mx-auto mb-4 brutal-border border-black bg-secondary flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-secondary-foreground" />
          </div>
          <DialogTitle className="font-pixel text-xl xs:text-2xl text-center uppercase tracking-wide">
            {content.title}
          </DialogTitle>
          <DialogDescription className="font-sans text-sm xs:text-base text-center text-muted-foreground pt-2">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-col gap-3 pt-4">
          <Button
            onClick={handleConvert}
            disabled={isConverting}
            className="w-full font-pixel text-sm uppercase bg-primary text-primary-foreground hover:bg-primary/90 brutal-border border-black brutal-shadow hover:brutal-shadow-md transition-all duration-300 rounded-none min-h-[52px]"
          >
            {content.primaryCta}
          </Button>
          <button
            onClick={handleDismiss}
            className="w-full font-sans text-sm text-muted-foreground hover:text-foreground transition-colors py-3"
          >
            {content.secondaryCta}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
