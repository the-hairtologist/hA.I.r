import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Calendar, Edit, Trash2 } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const ClientReviewsPage = () => {
  // Mock data - will be replaced with actual data from Supabase
  const reviews = [
    {
      id: "1",
      stylist: {
        name: "Sarah Johnson",
        image: null
      },
      rating: 5,
      date: "2024-09-15",
      comment: "Absolutely amazing! Sarah really understood what I wanted and delivered perfectly. My color looks stunning!",
      service: "Balayage & Cut"
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-amber-500 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs />
        <PageHeader title="My Reviews" />

        <div className="grid gap-4 md:gap-6">
          {/* Review Cards */}
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={review.stylist.image || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {review.stylist.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{review.stylist.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-0.5">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="mb-3">
                  {review.service}
                </Badge>
                <p className="text-muted-foreground">{review.comment}</p>
              </CardContent>
            </Card>
          ))}

          {/* Empty State */}
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Star className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                After your appointments, you can rate your experience and help other clients find amazing stylists
              </p>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                View Appointments
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientReviewsPage;
