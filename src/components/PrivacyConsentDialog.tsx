import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Camera, Mic, Shield, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrivacyConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'camera' | 'microphone' | 'both';
  onConsent: (granted: boolean) => void;
  context?: string;
}

const CONSENT_STORAGE_KEY = 'media_permissions_consent';

export const getStoredConsent = (type: 'camera' | 'microphone'): boolean => {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return false;
    const consent = JSON.parse(stored);
    return consent[type] === true;
  } catch {
    return false;
  }
};

export const setStoredConsent = (type: 'camera' | 'microphone', granted: boolean) => {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    const consent = stored ? JSON.parse(stored) : {};
    consent[type] = granted;
    consent[`${type}_timestamp`] = new Date().toISOString();
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
  } catch (error) {
    console.error('Failed to store consent:', error);
  }
};

export const PrivacyConsentDialog = ({
  open,
  onOpenChange,
  type,
  onConsent,
  context = "this feature"
}: PrivacyConsentDialogProps) => {
  const [understood, setUnderstood] = useState(false);
  const [dataRetention, setDataRetention] = useState(false);

  const handleGrant = () => {
    if (type === 'both') {
      setStoredConsent('camera', true);
      setStoredConsent('microphone', true);
    } else {
      setStoredConsent(type, true);
    }
    onConsent(true);
    onOpenChange(false);
  };

  const handleDeny = () => {
    onConsent(false);
    onOpenChange(false);
  };

  const permissionDetails = {
    camera: {
      icon: Camera,
      title: "Camera Access Required",
      description: "We need camera access to capture photos for your hair portfolio and analysis.",
      usage: [
        "Capture professional work photos",
        "Take client selfies for records",
        "Analyze hair condition with AI",
        "Store images securely in your account"
      ],
      protection: [
        "Photos are encrypted during transfer",
        "Only you and assigned stylists can view",
        "Stored securely on our servers",
        "You can delete photos anytime"
      ]
    },
    microphone: {
      icon: Mic,
      title: "Microphone Access Required",
      description: "We need microphone access to transcribe your voice notes and commands.",
      usage: [
        "Add voice notes to appointments",
        "Dictate formula instructions",
        "Use voice commands for navigation",
        "Send voice messages to clients"
      ],
      protection: [
        "Audio is transcribed then deleted",
        "No recordings are permanently stored",
        "Transcriptions are encrypted",
        "You control all voice data"
      ]
    },
    both: {
      icon: Shield,
      title: "Camera & Microphone Access",
      description: "We need both camera and microphone access for the complete experience.",
      usage: [
        "Capture photos with voice notes",
        "Full hands-free operation",
        "AI-powered hair analysis with voice",
        "Professional portfolio building"
      ],
      protection: [
        "All data encrypted in transit",
        "No permanent audio storage",
        "Complete privacy controls",
        "Delete data anytime"
      ]
    }
  };

  const details = permissionDetails[type];
  const Icon = details.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl">{details.title}</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {details.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* What we'll use it for */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              How we'll use {type === 'both' ? 'these features' : 'this'}:
            </h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {details.usage.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Privacy protection */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
              Your privacy is protected:
            </h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {details.protection.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Privacy notice */}
          <div className="p-3 rounded-lg bg-muted border border-border">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p>
                  Your browser will ask for permission separately. We'll only access {type === 'both' ? 'your camera and microphone' : `your ${type}`} when you explicitly use {type === 'both' ? 'these features' : 'this feature'}.
                </p>
                <p className="mt-2">
                  Read our full{" "}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Consent checkboxes */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="understand"
                checked={understood}
                onCheckedChange={(checked) => setUnderstood(checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="understand" className="text-sm font-normal leading-snug cursor-pointer">
                I understand how my {type === 'both' ? 'camera and microphone data' : `${type} data`} will be used and protected
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="retention"
                checked={dataRetention}
                onCheckedChange={(checked) => setDataRetention(checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="retention" className="text-sm font-normal leading-snug cursor-pointer">
                I acknowledge that I can revoke this permission and delete my data at any time in Settings
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleDeny}
            className="w-full sm:w-auto"
          >
            Deny Access
          </Button>
          <Button
            onClick={handleGrant}
            disabled={!understood || !dataRetention}
            className={cn(
              "w-full sm:w-auto",
              (!understood || !dataRetention) && "opacity-50"
            )}
          >
            Grant Permission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
