/**
 * In-App Bug Reporter Widget
 * Allows users to report issues with automatic context capture
 */

import { useState } from 'react';
import { Bug, X, Send, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import html2canvas from 'html2canvas';

export function BugReporter() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const captureScreenshot = async () => {
    try {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        logging: false,
      });
      const dataUrl = canvas.toDataURL('image/png');
      setScreenshot(dataUrl);
      toast.success('Screenshot captured');
    } catch (error) {
      console.error('Screenshot error:', error);
      toast.error('Failed to capture screenshot');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Please provide both title and description');
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Get recent logs
      const logs = logger.getRecentLogs(50);

      // Upload screenshot if available
      let screenshotUrl = null;
      if (screenshot) {
        const blob = await (await fetch(screenshot)).blob();
        const filename = `bug-${Date.now()}.png`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('hair-photos')
          .upload(`bug-reports/${filename}`, blob);

        if (!uploadError && uploadData) {
          const {
            data: { publicUrl },
          } = supabase.storage
            .from('hair-photos')
            .getPublicUrl(uploadData.path);
          screenshotUrl = publicUrl;
        }
      }

      // Submit bug report
      const { error } = await supabase.from('bug_reports' as any).insert({
        user_id: user?.id || null,
        title: title.trim(),
        description: description.trim(),
        screenshot_url: screenshotUrl,
        logs: logs,
        user_agent: navigator.userAgent,
        page_url: window.location.href,
        status: 'open',
        priority: 'medium',
      });

      if (error) throw error;

      toast.success('Bug report submitted. Thank you!');

      // Reset form
      setTitle('');
      setDescription('');
      setScreenshot(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Bug report submission error:', error);
      toast.error('Failed to submit bug report');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        variant="outline"
        className="fixed bottom-4 left-4 z-50 shadow-lg"
      >
        <Bug className="w-4 h-4 mr-2" />
        Report Bug
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-96 bg-card border rounded-lg shadow-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-destructive" />
          <h3 className="font-semibold">Report a Bug</h3>
        </div>
        <Button onClick={() => setIsOpen(false)} size="sm" variant="ghost">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <Input
          placeholder="Brief title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={100}
        />

        <Textarea
          placeholder="Describe what happened..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
          maxLength={1000}
        />

        <div className="flex gap-2">
          <Button
            onClick={captureScreenshot}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            <Camera className="w-4 h-4 mr-2" />
            {screenshot ? 'Recapture' : 'Capture Screen'}
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !description.trim()}
            size="sm"
            className="flex-1"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Sending...' : 'Submit'}
          </Button>
        </div>

        {screenshot && (
          <div className="text-xs text-muted-foreground">
            ✓ Screenshot attached (will be included)
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Recent logs and page info will be automatically included
        </p>
      </div>
    </div>
  );
}
