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
    <Card className="brutal-border brutal-shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs sm:text-sm font-semibold text-muted-foreground p-1 sm:p-2">
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
                  aspect-square border rounded p-1 sm:p-2 cursor-pointer transition-all hover:bg-accent/50
                  ${isToday(day) ? 'border-primary border-2 bg-primary/5' : 'border-border'}
                  ${!isSameMonth(day, currentMonth) ? 'opacity-50' : ''}
                `}
                onClick={() => {
                  onDateSelect?.(day);
                  if (hasAppointments && onAppointmentClick) {
                    onAppointmentClick(dayAppointments[0]);
                  }
                }}
              >
                <div className="flex flex-col h-full">
                  <span className={`text-xs sm:text-sm ${isToday(day) ? 'font-bold text-primary' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  {hasAppointments && (
                    <div className="mt-0.5 sm:mt-1 space-y-0.5 sm:space-y-1">
                      {dayAppointments.slice(0, 2).map((apt, idx) => (
                        <div
                          key={apt.id}
                          className="text-[11px] sm:text-xs truncate bg-primary/10 px-0.5 sm:px-1 rounded"
                        >
                          {format(new Date(apt.appointment_date), 'h:mm a')}
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <Badge variant="secondary" className="text-[11px] sm:text-xs h-3 sm:h-4 px-0.5 sm:px-1">
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