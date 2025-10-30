/**
 * Session Expiry Warning
 * Shows warning 5 minutes before session expires
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes in ms
const SESSION_DURATION = 60 * 60 * 1000; // 1 hour in ms

export function SessionExpiryWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [extending, setExtending] = useState(false);

  useEffect(() => {
    let warningTimer: NodeJS.Timeout;
    let countdownTimer: NodeJS.Timeout;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const expiresAt = session.expires_at
        ? session.expires_at * 1000
        : Date.now() + SESSION_DURATION;
      const timeUntilExpiry = expiresAt - Date.now();

      if (timeUntilExpiry <= SESSION_WARNING_TIME && timeUntilExpiry > 0) {
        setShowWarning(true);
        setTimeLeft(Math.floor(timeUntilExpiry / 1000));

        // Start countdown
        countdownTimer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(countdownTimer);
              setShowWarning(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else if (timeUntilExpiry > SESSION_WARNING_TIME) {
        // Set timer to show warning later
        warningTimer = setTimeout(() => {
          setShowWarning(true);
          checkSession();
        }, timeUntilExpiry - SESSION_WARNING_TIME);
      }
    };

    checkSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkSession();
    });

    return () => {
      clearTimeout(warningTimer);
      clearInterval(countdownTimer);
      subscription.unsubscribe();
    };
  }, []);

  const handleExtendSession = async () => {
    setExtending(true);
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession();
      if (error) throw error;

      if (session) {
        toast.success('Session extended successfully');
        setShowWarning(false);
      }
    } catch (error) {
      console.error('Error extending session:', error);
      toast.error('Failed to extend session', {
        description: 'Please sign in again',
      });
    } finally {
      setExtending(false);
    }
  };

  if (!showWarning) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-slide-in-bottom">
      <Alert className="brutal-border brutal-shadow-md bg-warning/10 border-warning">
        <Clock className="h-4 w-4 text-warning" />
        <AlertTitle className="font-pixel text-sm uppercase">
          Session Expiring Soon
        </AlertTitle>
        <AlertDescription className="space-y-3">
          <p className="text-sm">
            Your session will expire in{' '}
            <span className="font-bold">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
          </p>
          <Button
            onClick={handleExtendSession}
            disabled={extending}
            className="w-full brutal-border brutal-shadow-sm hover:brutal-shadow"
            size="sm"
          >
            {extending ? (
              <>
                <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                Extending...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-2" />
                Extend Session
              </>
            )}
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
