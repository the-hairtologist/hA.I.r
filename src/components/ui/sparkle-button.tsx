import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SparkleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "outline";
}

export function SparkleButton({ children, variant = "primary", className, ...props }: SparkleButtonProps) {
  return (
    <button
      className={cn(
        "group relative overflow-hidden",
        variant === "primary" 
          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
          : "border-[3px] border-foreground bg-background text-foreground hover:bg-background/90 shadow-brutal hover:shadow-brutal-md hover:-translate-y-0.5",
        "transition-all duration-300 rounded-lg font-semibold",
        className
      )}
      {...props}
    >
      {/* Sparkle overlay */}
      <span className="absolute inset-0 overflow-hidden">
        <span className="absolute top-0 left-1/4 w-1 h-1 rounded-full animate-[ping_2s_ease-in-out_infinite] opacity-0 group-hover:opacity-100 bg-primary-foreground/60" style={{ animationDelay: '0s' }} />
        <span className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full animate-[ping_2.5s_ease-in-out_infinite] opacity-0 group-hover:opacity-100 bg-primary-foreground/40" style={{ animationDelay: '0.3s' }} />
        <span className="absolute bottom-1/4 left-1/3 w-1 h-1 rounded-full animate-[ping_2.2s_ease-in-out_infinite] opacity-0 group-hover:opacity-100 bg-primary-foreground/50" style={{ animationDelay: '0.6s' }} />
        <span className="absolute top-1/2 right-1/3 w-1 h-1 rounded-full animate-[ping_2.8s_ease-in-out_infinite] opacity-0 group-hover:opacity-100 bg-primary-foreground/60" style={{ animationDelay: '0.9s' }} />
      </span>
      
      {/* Shimmer effect */}
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
