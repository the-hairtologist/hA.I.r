import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/brutalismUtils";

interface BrutalHeaderProps {
  children: ReactNode;
  size?: "xl" | "lg" | "md" | "sm";
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4";
}

/**
 * BrutalHeader - Press Start 2P pixelated headers
 * Use for all page titles, section headers, and card titles
 */
export const BrutalHeader = ({ 
  children, 
  size = "lg",
  className,
  as: Component = "h2"
}: BrutalHeaderProps) => {
  const sizeClasses = {
    xl: typography.headerXL,
    lg: typography.headerLG,
    md: typography.headerMD,
    sm: typography.headerSM,
  };

  return (
    <Component className={cn(sizeClasses[size], className)}>
      {children}
    </Component>
  );
};
