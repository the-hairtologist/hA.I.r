import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, startOfWeek, addDays, addMinutes, isSameDay, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface WeeklyScheduleViewProps {
  appointments: any[];
  stylistSchedule?: any;
  onAppointmentClick?: (appointment: any) => void;
  onTimeSlotClick?: (date: Date, hour: number, minute: number) => void;
  stylistId?: string;
}

export const WeeklyScheduleView = ({ 
  appointments, 
  stylistSchedule,
  onAppointmentClick,
  onTimeSlotClick,
  stylistId
}: WeeklyScheduleViewProps) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [serviceColors, setServiceColors] = useState<Record<string, string>>({});

  // Load custom service colors
  useEffect(() => {
    if (stylistId) {
      loadServiceColors();
    }
  }, [stylistId]);

  const loadServiceColors = async () => {
    if (!stylistId) return;
    
    try {
      const { data, error } = await supabase
        .from("service_type_colors")
        .select("service_type, color")
        .eq("stylist_id", stylistId);

      if (error) throw error;

      const colorMap: Record<string, string> = {};
      data?.forEach(item => {
        colorMap[item.service_type] = item.color;
      });
      setServiceColors(colorMap);
    } catch (error) {
      console.error("Error loading service colors:", error);
    }
  };

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const allWeekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Filter to only show working days
  const workingDays = stylistSchedule 
    ? allWeekDays.filter(day => {
        const dayName = format(day, 'EEEE').toLowerCase();
        return stylistSchedule[dayName]?.enabled;
      })
    : allWeekDays;

  // Show only selected day or all working days
  const weekDays = selectedDay ? [selectedDay] : workingDays;

  // Find earliest start and latest end time from schedule
  const getScheduleBounds = () => {
    if (!stylistSchedule) return { start: 8, end: 18 };
    
    let earliestHour = 24;
    let latestHour = 0;
    
    Object.values(stylistSchedule).forEach((day: any) => {
      if (day?.enabled && day?.startTime && day?.endTime) {
        const [startHour] = day.startTime.split(':').map(Number);
        const [endHour] = day.endTime.split(':').map(Number);
        earliestHour = Math.min(earliestHour, startHour);
        latestHour = Math.max(latestHour, endHour);
      }
    });
    
    return earliestHour < 24 ? { start: earliestHour, end: latestHour } : { start: 8, end: 18 };
  };

  const { start: startHour, end: endHour } = getScheduleBounds();
  
  // Generate time slots based on working hours (30-minute intervals for compactness)
  const totalSlots = ((endHour - startHour) * 2);
  const timeSlots = Array.from({ length: totalSlots }, (_, i) => {
    const hour = Math.floor(i / 2) + startHour;
    const minute = (i % 2) * 30;
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

  // Check if a time slot is occupied by an ongoing appointment
  const isSlotOccupied = (day: Date, hour: number, minute: number) => {
    return appointments.some(apt => {
      if (apt.status === 'cancelled') return false;
      
      const aptDate = parseISO(apt.appointment_date);
      if (!isSameDay(aptDate, day)) return false;
      
      const aptStartMinutes = aptDate.getHours() * 60 + aptDate.getMinutes();
      const aptEndMinutes = aptStartMinutes + (apt.duration_minutes || 90);
      const slotMinutes = hour * 60 + minute;
      
      return slotMinutes >= aptStartMinutes && slotMinutes < aptEndMinutes;
    });
  };

  const calculateAppointmentHeight = (durationMinutes: number) => {
    // Each 30-minute slot is 24px, ensure we fill the entire space
    return Math.max((durationMinutes / 30) * 24, 24);
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
    // Use custom color if available, otherwise use defaults
    if (serviceColors[serviceType]) {
      return serviceColors[serviceType];
    }
    
    // Default colors as fallback
    const defaultColors: Record<string, string> = {
      'Cut & Style': 'hsl(190 95% 55%)',
      'Color': 'hsl(270 85% 60%)',
      'Treatment': 'hsl(340 90% 65%)',
    };
    
    return defaultColors[serviceType] || 'hsl(270 85% 60%)';
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="border-b-[2px] border-border px-2 py-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CardTitle className="font-display text-sm">
              {selectedDay ? format(selectedDay, 'EEEE, MMM d') : 'Your Weekly Schedule'}
            </CardTitle>
            {selectedDay && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => setSelectedDay(null)}
                className="h-5 text-[10px] px-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground border-[2px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                View Week
              </Button>
            )}
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={previousWeek} className="border-[2px] h-6 w-6 p-0">
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={nextWeek} className="border-[2px] h-6 w-6 p-0">
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-y-auto max-h-[50vh]">
          <div className="w-full">
            {/* Header with days */}
            <div 
              className="border-b-[2px] border-border sticky top-0 bg-card z-20"
              style={{
                display: 'grid',
                gridTemplateColumns: `60px repeat(${weekDays.length}, 1fr)`
              }}
            >
              <div className="p-1 border-r-[2px] border-border text-[10px] font-semibold">
                Time
              </div>
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "p-1 border-r-[2px] border-border text-center cursor-pointer hover:bg-primary/5 transition-colors",
                    isSameDay(day, new Date()) && "bg-primary/10",
                    selectedDay && isSameDay(day, selectedDay) && "bg-primary/20"
                  )}
                  onClick={() => {
                    if (!selectedDay || !isSameDay(selectedDay, day)) {
                      setSelectedDay(day);
                    }
                  }}
                >
                  <div className="font-semibold text-[10px]">{format(day, 'EEE')}</div>
                  <div className="text-[9px] text-muted-foreground">{format(day, 'M/d')}</div>
                </div>
              ))}
            </div>

            {/* Time slots grid */}
            <div className="relative">
              {timeSlots.map((slot, slotIndex) => (
                <div 
                  key={slotIndex} 
                  className="border-b border-border/30"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `60px repeat(${weekDays.length}, 1fr)`
                  }}
                >
                  {/* Time label */}
                  <div className="p-0.5 border-r-[2px] border-border text-[8px] text-muted-foreground font-medium flex items-center">
                    {slot.minute === 0 && <span className="font-semibold">{slot.label}</span>}
                  </div>

                  {/* Day columns */}
                  {weekDays.map((day) => {
                    const isWorking = isWorkingHours(day, slot.hour, slot.minute);
                    const dayAppointments = getAppointmentsForDayAndTime(day, slot.hour, slot.minute);
                    
                    return (
                      <div
                        key={`${day.toISOString()}-${slotIndex}`}
                        className={cn(
                          "relative border-r border-border/30 h-[24px]",
                          !isWorking && "bg-muted/20",
                          slot.minute === 0 && "border-t border-border",
                          isWorking && dayAppointments.length === 0 && "hover:bg-accent/10 cursor-pointer transition-colors"
                        )}
                        onClick={() => {
                          if (isWorking && dayAppointments.length === 0 && onTimeSlotClick) {
                            onTimeSlotClick(day, slot.hour, slot.minute);
                          }
                        }}
                      >
                        {!isWorking && slot.minute === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[8px] text-muted-foreground/60 font-medium">OFF</span>
                          </div>
                        )}
                        
                        {dayAppointments.map((apt) => (
                          <div
                            key={apt.id}
                            className="absolute inset-x-0 top-0 rounded-md p-1 cursor-pointer hover:opacity-90 transition-all hover:shadow-lg border border-border/20 group overflow-hidden"
                            style={{
                              backgroundColor: getServiceColor(apt.service_type),
                              height: `${calculateAppointmentHeight(apt.duration_minutes || 90)}px`,
                              zIndex: 5,
                            }}
                            onClick={() => onAppointmentClick?.(apt)}
                          >
                            <div className="text-[9px] font-bold text-primary-foreground truncate leading-tight">
                              {apt.client?.user?.full_name}
                            </div>
                            <div className="text-[8px] text-primary-foreground/90 truncate leading-tight">
                              {apt.service_type}
                            </div>
                            {apt.duration_minutes && apt.duration_minutes >= 60 && (
                              <div className="text-[7px] text-primary-foreground/70 leading-tight">
                                {format(parseISO(apt.appointment_date), 'h:mm a')}
                              </div>
                            )}
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
        <div className="p-1.5 border-t-[2px] border-border bg-muted/10">
          <div className="flex flex-wrap gap-1.5 text-[9px]">
            {Object.entries(serviceColors).length > 0 ? (
              Object.entries(serviceColors).map(([serviceType, color]) => (
                <div key={serviceType} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded border border-white/30" style={{ backgroundColor: color }} />
                  <span className="text-muted-foreground">{serviceType}</span>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-sm border-2 border-foreground bg-info" />
                  <span className="text-muted-foreground">Cut & Style</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-sm border-2 border-foreground bg-secondary" />
                  <span className="text-muted-foreground">Color</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-sm border-2 border-foreground bg-accent" />
                  <span className="text-muted-foreground">Treatment</span>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
