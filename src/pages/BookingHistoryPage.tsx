import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, DollarSign, Star, RotateCw, FileText } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const BookingHistoryPage = () => {
  // Mock data - will be replaced with actual data from Supabase
  const bookings = [
    {
      id: "1",
      date: "2024-09-15",
      time: "2:00 PM",
      stylist: {
        name: "Sarah Johnson",
        image: null
      },
      service: "Balayage & Cut",
      price: 150,
      status: "completed",
      canReview: true,
      canRebook: true
    },
    {
      id: "2",
      date: "2024-08-10",
      time: "10:30 AM",
      stylist: {
        name: "Sarah Johnson",
        image: null
      },
      service: "Hair Cut",
      price: 65,
      status: "completed",
      canReview: false,
      canRebook: true
    }
  ];

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
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={booking.stylist.image || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {booking.stylist.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{booking.service}</h3>
                        <p className="text-sm text-muted-foreground">with {booking.stylist.name}</p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(booking.date).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {booking.time}
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-foreground">
                        <DollarSign className="h-4 w-4" />
                        ${booking.price}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {booking.canRebook && (
                        <Button variant="default" size="sm">
                          <RotateCw className="h-4 w-4 mr-2" />
                          Book Again
                        </Button>
                      )}
                      {booking.canReview && (
                        <Button variant="outline" size="sm">
                          <Star className="h-4 w-4 mr-2" />
                          Write Review
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Receipt
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Stats Card */}
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
            <CardHeader>
              <CardTitle>Your Booking Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{bookings.length}</div>
                  <div className="text-sm text-muted-foreground">Total Bookings</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    ${bookings.reduce((sum, b) => sum + b.price, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Spent</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">1</div>
                  <div className="text-sm text-muted-foreground">Favorite Stylist</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">5.0</div>
                  <div className="text-sm text-muted-foreground">Avg Rating Given</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookingHistoryPage;
