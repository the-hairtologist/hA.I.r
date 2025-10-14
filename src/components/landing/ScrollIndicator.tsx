import { ChevronDown } from "lucide-react";

export const ScrollIndicator = () => {
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight - 100,
      behavior: "smooth"
    });
  };

  return (
    <button
      onClick={scrollToContent}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors group animate-bounce"
      aria-label="Scroll to content"
    >
      <span className="text-xs font-medium uppercase tracking-wider">Scroll to explore</span>
      <div className="h-8 w-5 rounded-full border-2 border-current flex items-start justify-center p-1">
        <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      </div>
      <ChevronDown className="h-5 w-5 animate-bounce" />
    </button>
  );
};
