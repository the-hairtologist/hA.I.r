import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import {
  Share2,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  QrCode,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

export const ShareButtons = ({
  url,
  title,
  description,
}: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const fullUrl = url.startsWith('http')
    ? url
    : `${window.location.origin}${url}`;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  };

  const openShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  const generateQRCode = () => {
    // Using a free QR code API
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUrl}`;
  };

  // Native share API for mobile
  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: fullUrl,
        });
      } catch (err) {
        logger.debug('Share cancelled');
      }
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={copyToClipboard}>
            {copied ? (
              <Check className="h-4 w-4 mr-2 text-success" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {copied ? 'Copied!' : 'Copy Link'}
          </DropdownMenuItem>

          {navigator.share && (
            <>
              <DropdownMenuItem onClick={nativeShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share via...
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem onClick={() => openShare('facebook')}>
            <Facebook className="h-4 w-4 mr-2" />
            Facebook
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => openShare('twitter')}>
            <Twitter className="h-4 w-4 mr-2" />
            Twitter
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => openShare('linkedin')}>
            <Linkedin className="h-4 w-4 mr-2" />
            LinkedIn
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => openShare('email')}>
            <Mail className="h-4 w-4 mr-2" />
            Email
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowQR(true)}>
            <QrCode className="h-4 w-4 mr-2" />
            Show QR Code
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share via QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code to visit the profile
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <img
              src={generateQRCode()}
              alt="QR Code"
              className="w-64 h-64 border-4 border-foreground rounded-lg"
            />
            <p className="text-sm text-muted-foreground text-center">
              {fullUrl}
            </p>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="w-full"
            >
              {copied ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
