/**
 * Appointment Timer Widget
 * Track time during appointments
 */

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Square, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { logger } from '@/lib/logging/productionLogger';
import { userJourney } from '@/lib/logging/userJourneyTracker';
import { cn } from '@/lib/utils';
import { mobileFirst } from '@/lib/responsive/mobile-first-utils';
import {
  trackSelect,
  trackInsert,
  trackUpdate,
} from '@/lib/logging/supabaseTracker';

interface TimerSession {
  id: string;
  appointment_id: string;
  start_time: string;
  end_time?: string;
  duration_seconds: number;
  client_name?: string;
  service_type?: string;
}

export function AppointmentTimerWidget() {
  const [activeSession, setActiveSession] = useState<TimerSession | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    loadActiveSession();
  }, []);

  useEffect(() => {
    if (activeSession && !isPaused) {
      intervalRef.current = setInterval(() => {
        const start = new Date(activeSession.start_time).getTime();
        const now = Date.now();
        setElapsed(Math.floor((now - start) / 1000));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeSession, isPaused]);

  const loadActiveSession = async () => {
    try {
      const result = await trackSelect(
        async () =>
          await supabase
            .from('appointment_timers')
            .select('*')
            .is('end_time', null)
            .order('start_time', { ascending: false })
            .limit(1)
            .maybeSingle(),
        'appointment_timers',
        'AppointmentTimerWidget'
      );

      if (result.error && result.error.code !== 'PGRST116') throw result.error;
      if (result.data) {
        setActiveSession(result.data as TimerSession);
      }
    } catch (error) {
      logger.error('Error loading timer session', { component: 'AppointmentTimerWidget', error });
      userJourney.trackError(error as Error, { action: 'load-timer-session' });
    }
  };

  const startTimer = async (appointmentId: string) => {
    try {
      const result = await trackInsert(
        async () =>
          await supabase
            .from('appointment_timers')
            .insert({
              appointment_id: appointmentId,
              start_time: new Date().toISOString(),
              duration_seconds: 0,
            })
            .select()
            .maybeSingle(),
        'appointment_timers',
        'AppointmentTimerWidget',
        { appointmentId }
      );

      if (result.error) throw result.error;
      setActiveSession(result.data as TimerSession);
      setIsPaused(false);
      userJourney.trackAction('Timer Started', { appointmentId });
      toast.success('Timer started');
    } catch (error: any) {
      logger.error('Error starting timer', {
        component: 'AppointmentTimerWidget',
        appointmentId,
        error,
      });
      userJourney.trackError(error, { action: 'start-timer' });
      toast.error('Failed to start timer');
    }
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
    toast.info(isPaused ? 'Timer resumed' : 'Timer paused');
  };

  const stopTimer = async () => {
    if (!activeSession) return;

    try {
      const result = await trackUpdate(
        async () =>
          await supabase
            .from('appointment_timers')
            .update({
              end_time: new Date().toISOString(),
              duration_seconds: elapsed,
            })
            .eq('id', activeSession.id),
        'appointment_timers',
        'AppointmentTimerWidget',
        { timerId: activeSession.id, duration: elapsed }
      );

      if (result.error) throw result.error;

      userJourney.trackAction('Timer Stopped', {
        appointmentId: activeSession.appointment_id,
        duration: elapsed,
      });
      toast.success(`Session completed: ${formatTime(elapsed)}`);
      setActiveSession(null);
      setElapsed(0);
      setIsPaused(false);
    } catch (error: any) {
      logger.error('Error stopping timer', {
        component: 'AppointmentTimerWidget',
        timerId: activeSession.id,
        error,
      });
      userJourney.trackError(error, { action: 'stop-timer' });
      toast.error('Failed to stop timer');
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!activeSession) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Appointment Timer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={cn(mobileFirst.text.xs, "text-muted-foreground mb-3")}>
            Start tracking time when you begin an appointment
          </p>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => {
              toast.info(
                "Go to Appointments page and click 'Start Timer' on any active appointment"
              );
            }}
          >
            <Clock className="mr-2 h-4 w-4" />
            How to Start
          </Button>
          <p className={cn(mobileFirst.text.xs, "text-muted-foreground mt-2 text-center")}>
            Timer becomes active during appointments
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <CardTitle className="text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 animate-pulse" />
            Active Session
          </div>
          <Badge
            variant="outline"
            className={cn(mobileFirst.text.xs, "animate-pulse")}
          >
            Recording
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="text-center py-4">
          <div className="text-4xl font-bold font-mono tabular-nums">
            {formatTime(elapsed)}
          </div>
          {activeSession.client_name && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              {activeSession.client_name}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={pauseTimer}
            className="flex-1"
          >
            {isPaused ? (
              <>
                <Play className="mr-2 h-4 w-4" />
                Resume
              </>
            ) : (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={stopTimer}
            className="flex-1"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Complete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
