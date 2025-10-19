import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Users } from 'lucide-react';
import { MetaTags } from '@/components/MetaTags';
import { format, startOfWeek, addDays } from 'date-fns';
import { TeamChat } from '@/components/TeamChat';

interface TeamAppointment {
  id: string;
  appointment_date: string;
  service_type: string;
  status: string;
  client_profiles?: {
    full_name: string;
  };
  stylist_profiles?: {
    business_name: string;
  };
}

export default function TeamSchedule() {
  const [appointments, setAppointments] = useState<TeamAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stylistId, setStylistId] = useState<string>('');
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));

  useEffect(() => {
    fetchStylistId();
  }, []);

  useEffect(() => {
    if (stylistId) {
      fetchTeamAppointments();
    }
  }, [stylistId, currentWeek]);

  const fetchStylistId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('stylist_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) setStylistId(data.id);
  };

  const fetchTeamAppointments = async () => {
    const weekStart = currentWeek;
    const weekEnd = addDays(currentWeek, 7);

    const { data } = await supabase
      .from('appointments')
      .select(`
        *,
        client_profiles(full_name),
        stylist_profiles(business_name)
      `)
      .gte('appointment_date', weekStart.toISOString())
      .lt('appointment_date', weekEnd.toISOString())
      .order('appointment_date', { ascending: true });
    
    if (data) setAppointments(data);
    setLoading(false);
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  return (
    <>
      <MetaTags 
        title="Team Schedule"
        description="View all team member schedules"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Team Schedule</h1>
              <p className="text-muted-foreground">Collaborative calendar view</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Schedule Grid */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    Week of {format(currentWeek, 'MMM d, yyyy')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {weekDays.map((day) => {
                        const dayAppointments = appointments.filter(
                          apt => format(new Date(apt.appointment_date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                        );

                        return (
                          <div key={day.toISOString()} className="border-l-4 border-primary/20 pl-4">
                            <h3 className="font-semibold mb-2">
                              {format(day, 'EEEE, MMM d')}
                            </h3>
                            {dayAppointments.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No appointments</p>
                            ) : (
                              <div className="space-y-2">
                                {dayAppointments.map((apt) => (
                                  <div key={apt.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                                    <span className="text-sm font-medium">
                                      {format(new Date(apt.appointment_date), 'h:mm a')}
                                    </span>
                                    <Badge variant="outline">{apt.stylist_profiles?.business_name}</Badge>
                                    <span className="text-sm">{apt.client_profiles?.full_name}</span>
                                    <Badge variant="secondary">{apt.service_type}</Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Team Chat */}
            <div>
              {stylistId && <TeamChat stylistId={stylistId} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
