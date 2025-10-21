import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { haptic } from "@/platform/haptics";
import { logger } from "@/lib/productionLogger";
import { userJourney } from "@/lib/logging/userJourneyTracker";
import { trackInsert } from "@/lib/logging/supabaseTracker";

interface AIFeedbackPromptProps {
  context: "formula" | "recommendation" | "suggestion";
  contextId?: string;
  onDismiss?: () => void;
  className?: string;
}

export const AIFeedbackPrompt = ({
  context,
  contextId,
  onDismiss,
  className,
}: AIFeedbackPromptProps) => {
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleFeedback = (type: "positive" | "negative") => {
    haptic.tap();
    setFeedback(type);
    if (type === "negative") {
      setShowComment(true);
    } else {
      submitFeedback(type);
    }
  };

  const submitFeedback = async (feedbackType: "positive" | "negative", userComment?: string) => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        userJourney.trackAction(`AI Feedback: ${feedbackType}`, { context, feedbackType });
        
        await trackInsert(
          async () => await supabase.from("ai_feedback").insert({
            user_id: user.id,
            context_type: context,
            context_id: contextId,
            feedback_type: feedbackType,
            comment: userComment || null,
          }),
          'ai_feedback',
          'AIFeedbackPrompt'
        );
      }

      haptic.success();
      toast.success(
        feedbackType === "positive" 
          ? "Thanks! We're glad this helped! ✨"
          : "Thanks for your feedback! We'll keep improving."
      );
      
      setTimeout(() => {
        onDismiss?.();
      }, 1000);
    } catch (error) {
      logger.error('Error submitting AI feedback', error, { context: 'AIFeedbackPrompt', data: { context } });
      userJourney.trackError(error as Error, { action: 'submit-ai-feedback', context });
      haptic.error();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitComment = () => {
    if (!comment.trim()) {
      toast.error("Please tell us what could be better");
      return;
    }
    submitFeedback("negative", comment);
  };

  if (feedback && !showComment) return null;

  return (
    <Card
      className={cn(
        "brutal-border bg-gradient-to-br from-secondary/5 to-background",
        "animate-fade-in brutal-shadow-sm",
        className
      )}
    >
      <CardContent className="p-4">
        {!showComment ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-medium">Was this helpful?</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 -mr-2"
                onClick={() => onDismiss?.()}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedback("positive")}
                disabled={submitting}
                className="flex-1 gap-2 brutal-shadow-xs brutal-hover"
              >
                <ThumbsUp className="h-4 w-4" />
                Yes
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedback("negative")}
                disabled={submitting}
                className="flex-1 gap-2 brutal-shadow-xs brutal-hover"
              >
                <ThumbsDown className="h-4 w-4" />
                Not quite
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <p className="text-xs sm:text-sm font-medium">What could be better?</p>
            </div>
            
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Your feedback helps us improve..."
              className="min-h-[80px]"
            />
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowComment(false);
                  setFeedback(null);
                  setComment("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              
              <Button
                size="sm"
                onClick={handleSubmitComment}
                disabled={submitting}
                className="flex-1"
              >
                Submit Feedback
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
