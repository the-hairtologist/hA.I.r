import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, DollarSign, Star, RotateCw, FileText } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const BookingHistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch completed appointments
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['booking-history', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          duration_minutes,
          status,
          service_type,
          service_id,
          services (name, price),
          stylist_id,
          stylist_profiles!appointments_stylist_id_fkey (
            id,
            business_name
          )
        `)
        .eq('client_id', user?.id)
        .in('status', ['completed', 'cancelled'])
        .order('appointment_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">Loading booking history...</div>
        </div>
      </DashboardLayout>
    );
  }

  const totalBookings = bookings?.length || 0;
  const totalSpent = bookings?.reduce((sum, b) => sum + ((b.services as any)?.price || 0), 0) || 0;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: "Completed", variant: "default" as const, className: "bg-green-500" },
      cancelled: { label: "Cancelled", variant: "destructive" as const, className: "" },
      noshow: { label: "No Show", variant: "destructive" as const, className: "" }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.completed;
    return <Badge variant={config.variant} className={config.className || ""}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs />
        <PageHeader title="Booking History" />

        <div className="grid gap-4 md:gap-6">
          {bookings && bookings.length > 0 ? (
            <>
              {bookings.map((booking: any) => {
                const stylist = booking.stylist_profiles;
                const service = booking.services;
                
                return (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {stylist?.business_name?.split(" ").map((n: string) => n[0]).join("") || "S"}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{service?.name || "Service"}</h3>
                              <p className="text-sm text-muted-foreground">with {stylist?.business_name}</p>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(booking.appointment_date).toLocaleDateString('en-US', { 
                                weekday: 'short',
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(booking.appointment_date).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </div>
                            {(booking.services as any)?.price && (
                              <div className="flex items-center gap-1 font-semibold text-foreground">
                                <DollarSign className="h-4 w-4" />
                                ${(booking.services as any).price}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 pt-2">
                            {booking.status === 'completed' && (
                              <>
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  onClick={() => navigate('/appointments')}
                                >
                                  <RotateCw className="h-4 w-4 mr-2" />
                                  Book Again
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigate('/client-reviews')}
                                >
                                  <Star className="h-4 w-4 mr-2" />
                                  Write Review
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Stats Card */}
              <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Your Booking Stats</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{totalBookings}</div>
                      <div className="text-sm text-muted-foreground">Total Bookings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">${totalSpent}</div>
                      <div className="text-sm text-muted-foreground">Total Spent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        {bookings.filter((b: any) => b.status === 'completed').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No booking history</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  Your completed appointments will appear here
                </p>
                <Button onClick={() => navigate('/appointments')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookingHistoryPage;
