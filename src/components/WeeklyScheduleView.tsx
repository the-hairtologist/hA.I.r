import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, startOfWeek, addDays, addMinutes, isSameDay, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklyScheduleViewProps {
  appointments: any[];
  stylistSchedule?: any;
  onAppointmentClick?: (appointment: any) => void;
}

export const WeeklyScheduleView = ({ 
  appointments, 
  stylistSchedule,
  onAppointmentClick 
}: WeeklyScheduleViewProps) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Generate time slots from 6 AM to 10 PM in 15-minute intervals
  const timeSlots = Array.from({ length: 64 }, (_, i) => {
    const hour = Math.floor(i / 4) + 6;
    const minute = (i % 4) * 15;
    return { hour, minute, label: `${hour % 12 || 12}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}` };
  });

  const previousWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7));
  };

  const nextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };

  const getAppointmentsForDayAndTime = (day: Date, hour: number, minute: number) => {
    return appointments.filter(apt => {
      const aptDate = parseISO(apt.appointment_date);
      const aptHour = aptDate.getHours();
      const aptMinute = aptDate.getMinutes();
      
      return isSameDay(aptDate, day) && 
             aptHour === hour && 
             aptMinute === minute &&
             apt.status !== 'cancelled';
    });
  };

  const calculateAppointmentHeight = (durationMinutes: number) => {
    // Each 15-minute slot is 1 unit, so divide by 15
    return (durationMinutes / 15) * 60; // 60px per 15-minute slot
  };

  const isWorkingHours = (day: Date, hour: number, minute: number) => {
    const dayName = format(day, 'EEEE').toLowerCase();
    const schedule = stylistSchedule?.[dayName];
    
    if (!schedule?.enabled) return false;
    
    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
    
    const currentMinutes = hour * 60 + minute;
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  };

  const getServiceColor = (serviceType: string) => {
    const colors = {
      'Cut & Style': 'hsl(190 95% 55%)', // accent
      'Color': 'hsl(270 85% 60%)', // primary
      'Treatment': 'hsl(340 90% 65%)', // secondary
      'Consultation': 'hsl(40 95% 60%)', // warm yellow
    };
    return colors[serviceType as keyof typeof colors] || 'hsl(270 85% 60%)';
  };

  return (
    <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
      <CardHeader className="border-b-[2px] border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display">Weekly Schedule</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={previousWeek} className="border-[2px]">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={nextWeek} className="border-[2px]">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-[1400px]">
            {/* Header with days */}
            <div className="grid grid-cols-8 border-b-[2px] border-border sticky top-0 bg-card z-10">
              <div className="p-4 border-r-[2px] border-border text-sm font-semibold">
                Time
              </div>
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "p-4 border-r-[2px] border-border text-center",
                    isSameDay(day, new Date()) && "bg-primary/10"
                  )}
                >
                  <div className="font-semibold">{format(day, 'EEE')}</div>
                  <div className="text-sm text-muted-foreground">{format(day, 'M/d')}</div>
                </div>
              ))}
            </div>

            {/* Time slots grid */}
            <div className="relative">
              {timeSlots.map((slot, slotIndex) => (
                <div key={slotIndex} className="grid grid-cols-8 border-b border-border/50">
                  {/* Time label */}
                  <div className="p-2 border-r-[2px] border-border text-xs text-muted-foreground font-medium">
                    {slot.minute === 0 && slot.label}
                  </div>

                  {/* Day columns */}
                  {weekDays.map((day) => {
                    const isWorking = isWorkingHours(day, slot.hour, slot.minute);
                    const dayAppointments = getAppointmentsForDayAndTime(day, slot.hour, slot.minute);
                    
                    return (
                      <div
                        key={`${day.toISOString()}-${slotIndex}`}
                        className={cn(
                          "relative border-r border-border/50 h-[60px]",
                          !isWorking && "bg-muted/30",
                          slot.minute === 0 && "border-t-[2px] border-border"
                        )}
                      >
                        {!isWorking && slot.minute === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs text-muted-foreground font-semibold">OFF</span>
                          </div>
                        )}
                        
                        {dayAppointments.map((apt) => (
                          <div
                            key={apt.id}
                            className="absolute inset-x-1 top-1 rounded-lg p-2 cursor-pointer hover:opacity-90 transition-all hover:-translate-y-0.5 border-[2px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]"
                            style={{
                              backgroundColor: getServiceColor(apt.service_type),
                              height: `${calculateAppointmentHeight(apt.duration_minutes || 90) - 8}px`,
                              zIndex: 5,
                            }}
                            onClick={() => onAppointmentClick?.(apt)}
                          >
                            <div className="text-xs font-bold text-white truncate">
                              {apt.client?.user?.full_name}
                            </div>
                            <div className="text-xs text-white/90 truncate">
                              {apt.service_type}
                            </div>
                            <div className="text-xs text-white/80">
                              {format(parseISO(apt.appointment_date), 'h:mm a')}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 border-t-[2px] border-border bg-muted/20">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-[2px] border-foreground" style={{ backgroundColor: 'hsl(190 95% 55%)' }} />
              <span>Cut & Style</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-[2px] border-foreground" style={{ backgroundColor: 'hsl(270 85% 60%)' }} />
              <span>Color</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-[2px] border-foreground" style={{ backgroundColor: 'hsl(340 90% 65%)' }} />
              <span>Treatment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted/30 border-[2px] border-border" />
              <span>Off Hours</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
