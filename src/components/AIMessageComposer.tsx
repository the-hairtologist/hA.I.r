/**
 * AI Message Composer Component
 * Generates personalized client messages using AI
 */

import { useState } from 'react';
import { useMessageGenerator } from '@/hooks/useMessageGenerator';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Copy, Send } from 'lucide-react';
import { toast } from 'sonner';
import { sanitizeInput, rateLimiter, RATE_LIMITS } from '@/lib';

interface AIMessageComposerProps {
  clientName: string;
  stylistName: string;
  lastVisit?: string;
  favoriteServices?: string[];
  onSendMessage?: (message: string) => void;
}

export const AIMessageComposer = ({
  clientName,
  stylistName,
  lastVisit,
  favoriteServices,
  onSendMessage,
}: AIMessageComposerProps) => {
  const {
    generating,
    message: generatedMessage,
    generateMessage,
  } = useMessageGenerator();
  const [messageType, setMessageType] = useState<
    'retention' | 'followup' | 'birthday' | 'reengagement'
  >('retention');
  const [customNote, setCustomNote] = useState('');
  const [generatedText, setGeneratedText] = useState('');

  const handleGenerate = async () => {
    // Rate limiting for AI requests
    if (!rateLimiter.isAllowed('ai-message', RATE_LIMITS.AI)) {
      toast.error('Too many AI requests. Please wait a moment.');
      return;
    }

    // Sanitize inputs
    const sanitizedNote = customNote ? sanitizeInput(customNote) : undefined;

    const result = await generateMessage({
      messageType,
      clientName,
      stylistName,
      lastVisit,
      favoriteServices,
      customNote: sanitizedNote,
    });

    if (result) {
      setGeneratedText(result.body);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    toast.success('Message copied to clipboard');
  };

  const handleSend = () => {
    if (onSendMessage && generatedText) {
      onSendMessage(generatedText);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Message Composer
        </CardTitle>
        <CardDescription>
          Generate personalized messages for {clientName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Message Type Selector */}
        <div className="space-y-2">
          <Label htmlFor="message-type">Message Type</Label>
          <Select
            value={messageType}
            onValueChange={(value: any) => setMessageType(value)}
          >
            <SelectTrigger id="message-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="retention">Client Retention</SelectItem>
              <SelectItem value="followup">Post-Visit Follow-up</SelectItem>
              <SelectItem value="birthday">Birthday Greeting</SelectItem>
              <SelectItem value="reengagement">Re-engagement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Note */}
        <div className="space-y-2">
          <Label htmlFor="custom-note">Custom Note (Optional)</Label>
          <Textarea
            id="custom-note"
            placeholder="Add any specific details you want included in the message..."
            value={customNote}
            onChange={e => setCustomNote(e.target.value)}
            rows={3}
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating message...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Message
            </>
          )}
        </Button>

        {/* Generated Message Display */}
        {generatedText && (
          <div className="space-y-3 pt-4 border-t">
            <Label>Generated Message</Label>
            <Textarea
              value={generatedText}
              onChange={e => setGeneratedText(e.target.value)}
              rows={6}
              className="font-normal"
            />

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={handleCopy} variant="outline" className="flex-1">
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              {onSendMessage && (
                <Button onClick={handleSend} className="flex-1">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              )}
            </div>

            {/* Message Info */}
            {generatedMessage && (
              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                <p>
                  <strong>Subject:</strong> {generatedMessage.subject}
                </p>
                <p>
                  <strong>Tone:</strong> {generatedMessage.tone}
                </p>
                <p>
                  <strong>Call to Action:</strong>{' '}
                  {generatedMessage.call_to_action}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
