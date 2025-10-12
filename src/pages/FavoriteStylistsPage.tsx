import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, Calendar, MessageSquare, MapPin, Search } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const FavoriteStylistsPage = () => {
  // Mock data - will be replaced with actual data from Supabase
  const favoriteStylist = {
    name: "Sarah Johnson",
    specialty: "Color Specialist",
    rating: 4.9,
    reviews: 127,
    location: "Downtown Salon",
    image: null,
    lastVisit: "2 weeks ago",
    nextAvailable: "Tomorrow at 2 PM"
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs />
        <PageHeader title="Favorite Stylists" />

        <div className="grid gap-4 md:gap-6">
          {/* Example Favorite Stylist Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={favoriteStylist.image || undefined} />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {favoriteStylist.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{favoriteStylist.name}</h3>
                      <p className="text-sm text-muted-foreground">{favoriteStylist.specialty}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Heart className="h-5 w-5 fill-current" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500 fill-current" />
                      <span className="font-medium">{favoriteStylist.rating}</span>
                      <span className="text-muted-foreground">({favoriteStylist.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {favoriteStylist.location}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Last visit: {favoriteStylist.lastVisit}</Badge>
                    <Badge variant="outline" className="border-green-500 text-green-600">
                      Next available: {favoriteStylist.nextAvailable}
                    </Badge>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1 sm:flex-none">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Now
                    </Button>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Empty State */}
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Heart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                When you find stylists you love, add them to your favorites for quick access
              </p>
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Find a Stylist
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FavoriteStylistsPage;
