/**
 * Shareable Demo Link Component
 * Generate and share custom demo links
 */

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Share2, Copy, CheckCircle } from 'lucide-react';

export function ShareableLink() {
  const [copied, setCopied] = useState(false);
  const demoUrl = `${window.location.origin}/showcase`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(demoUrl);
      setCopied(true);
      toast.success('Demo link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'hA.I.r - AI-Powered Salon Assistant',
          text: 'Check out this amazing salon management app!',
          url: demoUrl,
        });
        toast.success('Shared successfully!');
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Demo with Others
        </CardTitle>
        <CardDescription>
          Send this link to potential users to show them the value
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={demoUrl} readOnly className="font-mono text-sm" />
          <Button
            variant={copied ? 'default' : 'outline'}
            onClick={handleCopy}
            className="shrink-0 gap-2"
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>

        {'share' in navigator && (
          <Button className="w-full gap-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            Share Link
          </Button>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>✨ Interactive demo with realistic data</p>
          <p>📱 Works on all devices</p>
          <p>🎯 Highlights key selling points</p>
          <p>⚡ No signup required to view</p>
        </div>
      </CardContent>
    </Card>
  );
}
