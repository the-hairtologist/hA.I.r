import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Star, Calendar, Phone, Mail, Scissors } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface StylistProfile {
  id: string;
  business_name: string;
  bio: string;
  location: string;
  average_rating: number;
  total_reviews: number;
  user: {
    full_name: string;
    email: string;
    phone?: string;
  };
}

const StylistDiscovery = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [stylists, setStylists] = useState<StylistProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "reviews" | "name">("rating");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user) {
      loadStylists();
    }
  }, [authLoading, user]);

  const loadStylists = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("stylist_profiles")
        .select(`
          id,
          business_name,
          bio,
          location,
          average_rating,
          total_reviews,
          user:profiles!stylist_profiles_user_id_fkey (
            full_name,
            email,
            phone
          )
        `)
        .order("average_rating", { ascending: false });

      if (error) throw error;
      setStylists(data || []);
    } catch (error) {
      console.error("Error loading stylists:", error);
      toast.error("Failed to load stylists");
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedStylists = stylists
    .filter(stylist => 
      !searchQuery ||
      stylist.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stylist.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stylist.location?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "rating") return (b.average_rating || 0) - (a.average_rating || 0);
      if (sortBy === "reviews") return (b.total_reviews || 0) - (a.total_reviews || 0);
      return (a.business_name || a.user?.full_name || "").localeCompare(b.business_name || b.user?.full_name || "");
    });

  const handleContactStylist = (stylist: StylistProfile) => {
    navigate(`/messages`, { state: { partnerId: stylist.user } });
  };

  const handleViewProfile = (stylistId: string) => {
    navigate(`/stylist/${stylistId}`);
  };

  if (authLoading || loading) {
    return <LoadingSpinner message="Loading stylists..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <PageHeader
        title="Find Your Stylist"
        icon={<Search className="h-6 w-6" />}
        backTo="/dashboard"
      />

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Search and Filter Bar */}
        <Card className="mb-6 border-2 border-foreground shadow-brutal">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, business, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Found {filteredAndSortedStylists.length} stylist{filteredAndSortedStylists.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Stylists Grid */}
        {filteredAndSortedStylists.length === 0 ? (
          <Card className="border-2 border-foreground">
            <CardContent className="py-12 text-center">
              <Scissors className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No stylists found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAndSortedStylists.map((stylist) => (
              <Card 
                key={stylist.id} 
                className="border-2 border-foreground shadow-brutal hover:shadow-brutal-lg transition-all cursor-pointer"
                onClick={() => handleViewProfile(stylist.id)}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-foreground">
                      <AvatarFallback className="text-lg font-bold">
                        {(stylist.business_name || stylist.user?.full_name || "?").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {stylist.business_name || stylist.user?.full_name || "Stylist"}
                      </CardTitle>
                      {stylist.business_name && (
                        <CardDescription className="truncate">
                          {stylist.user?.full_name}
                        </CardDescription>
                      )}
                      {stylist.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{stylist.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Rating and Reviews */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-semibold">{stylist.average_rating?.toFixed(1) || "New"}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {stylist.total_reviews || 0} review{stylist.total_reviews !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Bio */}
                  {stylist.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {stylist.bio}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/book-appointment", { state: { stylistId: stylist.id } });
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-2 border-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContactStylist(stylist);
                      }}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StylistDiscovery;
