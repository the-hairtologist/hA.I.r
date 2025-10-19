/**
 * Dynamic Loading Messages
 * Adds personality to loading states
 */

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DynamicLoadingMessagesProps {
  context?: "appointments" | "clients" | "formulas" | "schedule" | "ai" | "saving" | "general";
  className?: string;
}

const messages = {
  appointments: [
    "Checking your schedule...",
    "Finding the perfect slot...",
    "Coordinating appointments...",
    "Organizing your day...",
    "Syncing calendar...",
  ],
  clients: [
    "Loading client profiles...",
    "Gathering client history...",
    "Fetching loyalty stats...",
    "Preparing client insights...",
    "Reviewing past visits...",
  ],
  formulas: [
    "Mixing formulas...",
    "Analyzing color blends...",
    "Consulting the style gods...",
    "Reviewing formula notes...",
    "Checking product inventory...",
  ],
  schedule: [
    "Mapping your week...",
    "Optimizing your schedule...",
    "Finding available times...",
    "Calculating appointments...",
    "Preparing your calendar...",
  ],
  ai: [
    "Thinking...",
    "Analyzing patterns...",
    "Consulting AI assistant...",
    "Generating insights...",
    "Processing recommendations...",
  ],
  saving: [
    "Saving changes...",
    "Updating records...",
    "Syncing data...",
    "Storing information...",
    "Finalizing updates...",
  ],
  general: [
    "Loading...",
    "Just a moment...",
    "Almost there...",
    "Preparing data...",
    "Getting things ready...",
  ],
};

export function DynamicLoadingMessages({
  context = "general",
  className,
}: DynamicLoadingMessagesProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const contextMessages = messages[context];

  useEffect(() => {
    // Rotate through messages every 2 seconds
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % contextMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [contextMessages.length]);

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      <p 
        className="text-sm font-medium text-muted-foreground animate-fade-in"
        key={messageIndex}
        role="status"
        aria-live="polite"
      >
        {contextMessages[messageIndex]}
      </p>
    </div>
  );
}

export function InlineLoadingMessage({
  context = "general",
  className,
}: DynamicLoadingMessagesProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const contextMessages = messages[context];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % contextMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [contextMessages.length]);

  return (
    <span className={cn("inline-flex items-center gap-2", className)} role="status">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      <span className="text-sm" key={messageIndex} aria-live="polite">
        {contextMessages[messageIndex]}
      </span>
    </span>
  );
}
