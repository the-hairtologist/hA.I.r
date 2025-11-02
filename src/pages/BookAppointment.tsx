import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  DollarSign,
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { Badge } from '@/components/ui/badge';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stylistId = searchParams.get('stylist');
  const clientId = searchParams.get('clientId');
  const serviceType = searchParams.get('serviceType');

  return (
    <DashboardLayout>
      <SEOHead
        title="Book Appointment | hA.I.r"
        description="Book your next hair appointment with our AI-powered platform. Find stylists, choose services, and manage your bookings."
      />

      <div className="container mx-auto p-4 sm:p-6 max-w-5xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-pixel mb-2">
            Book Your Appointment
          </h1>
          <p className="font-sans text-muted-foreground text-sm sm:text-base lg:text-lg">
            Choose a service and find the perfect time for your next
            transformation
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <Card
            className="brutal-border brutal-shadow-sm hover:brutal-shadow-md transition-all cursor-pointer group"
            onClick={() => navigate('/client-discovery')}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Find a Stylist
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Browse our directory of talented stylists and book instantly
                  </CardDescription>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </CardHeader>
          </Card>

          <Card
            className="brutal-border brutal-shadow-sm hover:brutal-shadow-md transition-all cursor-pointer group"
            onClick={() => navigate('/appointments')}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-primary" />
                    View My Bookings
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Check your upcoming appointments and booking history
                  </CardDescription>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Popular Services */}
        <div className="mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-pixel mb-4">
            Popular Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: 'Color & Highlights',
                price: '$120+',
                duration: '2-3 hours',
                icon: Sparkles,
              },
              {
                name: 'Haircut & Style',
                price: '$60+',
                duration: '1 hour',
                icon: Calendar,
              },
              {
                name: 'Full Color Treatment',
                price: '$150+',
                duration: '3-4 hours',
                icon: DollarSign,
              },
            ].map(service => (
              <Card
                key={service.name}
                className="brutal-border brutal-shadow-xs hover:brutal-shadow-sm transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm sm:text-base mb-1">
                        {service.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Badge
                          variant="secondary"
                          className="text-[11px] sm:text-xs"
                        >
                          {service.price}
                        </Badge>
                        <span>•</span>
                        <span>{service.duration}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 brutal-border">
          <CardContent className="p-6 sm:p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-lg sm:text-xl lg:text-2xl font-pixel mb-2">
              Ready to Transform Your Look?
            </h3>
            <p className="text-xs sm:text-sm lg:text-base font-sans text-muted-foreground mb-6 max-w-2xl mx-auto">
              Browse our curated selection of expert stylists and book your
              appointment in seconds
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/client-discovery')}
              className="gap-2"
            >
              <Calendar className="h-5 w-5" />
              Browse Stylists
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BookAppointment;
