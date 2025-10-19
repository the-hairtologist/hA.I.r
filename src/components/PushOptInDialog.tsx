/**
 * Push Notification Opt-In Dialog - Phase 3: Engagement
 * User-friendly prompt with clear benefits and controls
 */

import { useState, useEffect } from "react";
import { Bell, BellOff, Clock, MessageSquare, Calendar, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { pushNotifications } from "@/lib/engagement/pushNotifications";
import { cn } from "@/lib/utils";

export const PushOptInDialog = () => {
  const [open, setOpen] = useState(false);
  const [deciding, setDeciding] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('show-push-opt-in', handler);
    return () => window.removeEventListener('show-push-opt-in', handler);
  }, []);

  const handleEnable = async () => {
    setDeciding(true);
    const success = await pushNotifications.requestPermission();
    setDeciding(false);
    
    if (success) {
      setOpen(false);
    }
  };

  const handleMaybeLater = () => {
    setOpen(false);
    // Show again in 7 days
    const nextPrompt = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('push_prompt_next', nextPrompt.toString());
  };

  const handleNever = () => {
    setOpen(false);
    localStorage.setItem('push_prompt_never', 'true');
  };

  if (!pushNotifications.isSupported()) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Bell className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Stay Updated with Notifications
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Get instant alerts for appointments, messages, and important updates. You're in control.
          </DialogDescription>
        </DialogHeader>

        {/* Benefits List */}
        <div className="space-y-3 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-sm">Never miss appointments</p>
              <p className="text-xs text-muted-foreground">Get reminders before every booking</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-sm">Instant messages</p>
              <p className="text-xs text-muted-foreground">Stay connected with your clients</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="font-medium text-sm">AI insights & tips</p>
              <p className="text-xs text-muted-foreground">Get personalized recommendations</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-sm">Quiet hours control</p>
              <p className="text-xs text-muted-foreground">No disturbances during your off time</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button 
            onClick={handleEnable}
            disabled={deciding}
            className="w-full"
            size="lg"
          >
            <Bell className="mr-2 h-4 w-4" />
            {deciding ? 'Enabling...' : 'Enable Notifications'}
          </Button>

          <div className="flex gap-2 w-full">
            <Button 
              onClick={handleMaybeLater}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              Maybe Later
            </Button>
            <Button 
              onClick={handleNever}
              variant="ghost"
              className="flex-1"
              size="sm"
            >
              <BellOff className="mr-2 h-3 w-3" />
              No Thanks
            </Button>
          </div>
        </DialogFooter>

        <p className="text-xs text-center text-muted-foreground pt-2">
          You can change these settings anytime in your preferences
        </p>
      </DialogContent>
    </Dialog>
  );
};
