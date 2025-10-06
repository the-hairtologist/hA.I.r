import { ReactNode, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MicroInteractionCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export const MicroInteractionCard = ({
  title,
  description,
  children,
  className,
  hoverable = true,
  clickable = false,
  onClick,
}: MicroInteractionCardProps) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        hoverable && "hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] hover:-translate-y-0.5",
        clickable && "cursor-pointer active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_hsl(var(--foreground))]",
        isPressed && "scale-[0.99]",
        "animate-fade-in",
        className
      )}
      onClick={onClick}
      onMouseDown={() => clickable && setIsPressed(true)}
      onMouseUp={() => clickable && setIsPressed(false)}
      onMouseLeave={() => clickable && setIsPressed(false)}
    >
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={!title && !description ? "p-6" : undefined}>
        {children}
      </CardContent>
    </Card>
  );
};
