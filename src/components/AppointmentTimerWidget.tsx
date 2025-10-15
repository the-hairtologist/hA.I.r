/**
 * Appointment Timer Widget
 * Track time during appointments
 */

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

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
  const intervalRef = useRef<NodeJS.Timeout>();

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
      const { data, error } = await supabase
        .from("appointment_timers")
        .select("*")
        .is("end_time", null)
        .order("start_time", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setActiveSession(data as TimerSession);
      }
    } catch (error) {
      console.error("Error loading timer session:", error);
    }
  };

  const startTimer = async (appointmentId: string) => {
    try {
      const { data, error } = await supabase
        .from("appointment_timers")
        .insert({
          appointment_id: appointmentId,
          start_time: new Date().toISOString(),
          duration_seconds: 0,
        })
        .select()
        .single();

      if (error) throw error;
      setActiveSession(data as TimerSession);
      setIsPaused(false);
      toast.success("Timer started");
    } catch (error: any) {
      console.error("Error starting timer:", error);
      toast.error("Failed to start timer");
    }
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
    toast.info(isPaused ? "Timer resumed" : "Timer paused");
  };

  const stopTimer = async () => {
    if (!activeSession) return;

    try {
      const { error } = await supabase
        .from("appointment_timers")
        .update({
          end_time: new Date().toISOString(),
          duration_seconds: elapsed,
        })
        .eq("id", activeSession.id);

      if (error) throw error;

      toast.success(`Session completed: ${formatTime(elapsed)}`);
      setActiveSession(null);
      setElapsed(0);
      setIsPaused(false);
    } catch (error: any) {
      console.error("Error stopping timer:", error);
      toast.error("Failed to stop timer");
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!activeSession) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Appointment Timer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Start tracking time when you begin an appointment
          </p>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => {
              toast.info("Go to Appointments page and click 'Start Timer' on any active appointment");
            }}
          >
            <Clock className="mr-2 h-4 w-4" />
            How to Start
          </Button>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Timer becomes active during appointments
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 animate-pulse" />
            Active Session
          </div>
          <Badge variant="outline" className="animate-pulse">
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
            <p className="text-sm text-muted-foreground mt-2">
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
