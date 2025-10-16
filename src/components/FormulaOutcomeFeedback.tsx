import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";

interface FormulaOutcomeFeedbackProps {
  formulaId: string;
  conversationMessageId?: string;
  clientId?: string;
  onComplete?: () => void;
}

export const FormulaOutcomeFeedback = ({
  formulaId,
  conversationMessageId,
  clientId,
  onComplete
}: FormulaOutcomeFeedbackProps) => {
  const [rating, setRating] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [whatWorked, setWhatWorked] = useState("");
  const [whatDidnt, setWhatDidnt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!rating) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('track-formula-outcome', {
        body: {
          formulaId,
          conversationMessageId,
          clientId,
          outcomeRating: rating,
          outcomeNotes: notes,
          whatWorked,
          whatDidntWork: whatDidnt,
          wouldUseAgain: rating === 'perfect' || rating === 'good'
        }
      });

      if (error) throw error;

      toast({ title: "Feedback submitted!", description: "Thank you for helping improve our AI" });
      onComplete?.();
    } catch (error) {
      toast({ title: "Failed to submit feedback", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratings = [
    { value: 'perfect', label: '✅ Perfect', color: 'bg-green-500' },
    { value: 'good', label: '👍 Good', color: 'bg-blue-500' },
    { value: 'okay', label: '😐 Okay', color: 'bg-yellow-500' },
    { value: 'poor', label: '👎 Poor', color: 'bg-red-500' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          How did this formula turn out?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {ratings.map(r => (
            <Button
              key={r.value}
              variant={rating === r.value ? 'default' : 'outline'}
              className={rating === r.value ? r.color : ''}
              onClick={() => setRating(r.value)}
            >
              {r.label}
            </Button>
          ))}
        </div>

        {rating && (
          <>
            <Textarea
              placeholder="What worked well?"
              value={whatWorked}
              onChange={(e) => setWhatWorked(e.target.value)}
            />
            <Textarea
              placeholder="What could be improved?"
              value={whatDidnt}
              onChange={(e) => setWhatDidnt(e.target.value)}
            />
            <Textarea
              placeholder="Additional notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};