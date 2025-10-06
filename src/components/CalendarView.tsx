import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CalendarViewProps {
  appointments: any[];
  onDateSelect?: (date: Date) => void;
  onAppointmentClick?: (appointment: any) => void;
}

export const CalendarView = ({ appointments, onDateSelect, onAppointmentClick }: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(apt => 
      isSameDay(new Date(apt.appointment_date), date) && apt.status !== 'cancelled'
    );
  };

  const startDayOfWeek = monthStart.getDay();
  const emptyDays = Array(startDayOfWeek).fill(null);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg sm:text-xl">{format(currentMonth, 'MMMM yyyy')}</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={previousMonth}
              className="h-9 w-9 sm:h-10 sm:w-10 border-[2px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={nextMonth}
              className="h-9 w-9 sm:h-10 sm:w-10 border-[2px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
              {day}
            </div>
          ))}
          
          {emptyDays.map((_, idx) => (
            <div key={`empty-${idx}`} className="aspect-square" />
          ))}
          
          {daysInMonth.map(day => {
            const dayAppointments = getAppointmentsForDay(day);
            const hasAppointments = dayAppointments.length > 0;
            
            return (
              <div
                key={day.toISOString()}
          className={`
            aspect-square border-2 border-foreground rounded-lg p-2 cursor-pointer transition-all hover:bg-accent/50 hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))]
            ${isToday(day) ? 'border-primary border-[3px] bg-primary/10 shadow-[2px_2px_0px_0px_hsl(var(--primary))]' : 'border-border'}
            ${!isSameMonth(day, currentMonth) ? 'opacity-60' : ''}
          `}
                onClick={() => {
                  onDateSelect?.(day);
                  if (hasAppointments && onAppointmentClick) {
                    onAppointmentClick(dayAppointments[0]);
                  }
                }}
              >
                <div className="flex flex-col h-full">
                  <span className={`text-sm ${isToday(day) ? 'font-bold text-primary' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  {hasAppointments && (
                    <div className="mt-1 space-y-1">
                      {dayAppointments.slice(0, 2).map((apt, idx) => (
                        <div
                          key={apt.id}
                          className="text-xs truncate bg-primary/10 px-1 rounded"
                        >
                          {format(new Date(apt.appointment_date), 'h:mm a')}
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <Badge variant="secondary" className="text-xs h-4 px-1">
                          +{dayAppointments.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};