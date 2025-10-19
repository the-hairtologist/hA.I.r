/**
 * Scroll to Top Button
 * Appears when user scrolls down, provides quick navigation back to top
 */

import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSmoothScroll, useScrollThreshold } from "@/hooks/use-smooth-scroll";
import { cn } from "@/lib/utils";

export const ScrollToTopButton = () => {
  const { scrollToTop } = useSmoothScroll();
  const isVisible = useScrollThreshold(300);

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className={cn(
        "fixed bottom-6 right-6 z-50 rounded-full shadow-lg transition-all duration-300",
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-12 pointer-events-none"
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-4 w-4" />
    </Button>
  );
};