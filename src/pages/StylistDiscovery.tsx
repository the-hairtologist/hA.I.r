import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Star, Calendar } from "lucide-react";
import { toast } from "sonner";

interface StylistProfile {
  id: string;
  user_id: string;
  business_name: string;
  bio: string;
  specialty: string;
  location: string;
  years_experience: number;
  color_line: string;
  average_rating?: number;
  total_reviews?: number;
  is_available: boolean;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

const StylistDiscovery = () => {
  const navigate = useNavigate();
  const [stylists, setStylists] = useState<StylistProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");

  useEffect(() => {
    fetchStylists();
  }, []);

  const fetchStylists = async () => {
    try {
      const { data, error } = await supabase
        .from("stylist_profiles")
        .select(`
          *,
          profiles (full_name, avatar_url)
        `)
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStylists(data || []);
    } catch (error: any) {
      console.error("Error fetching stylists:", error);
      toast.error("Failed to load stylists");
    } finally {
      setLoading(false);
    }
  };

  const filteredStylists = stylists.filter((stylist) => {
    const matchesSearch = 
      stylist.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stylist.profiles.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stylist.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = locationFilter === "all" || stylist.location === locationFilter;
    const matchesSpecialty = specialtyFilter === "all" || stylist.specialty === specialtyFilter;

    return matchesSearch && matchesLocation && matchesSpecialty;
  });

  const uniqueLocations = Array.from(new Set(stylists.map(s => s.location).filter(Boolean)));
  const uniqueSpecialties = Array.from(new Set(stylists.map(s => s.specialty).filter(Boolean)));

  const handleBookAppointment = (stylistId: string) => {
    navigate(`/book-appointment?stylist=${stylistId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Discover Stylists</h1>
        <p className="text-muted-foreground">Find the perfect hair stylist for your needs</p>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {uniqueLocations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            {uniqueSpecialties.map((specialty) => (
              <SelectItem key={specialty} value={specialty}>
                {specialty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stylists Grid */}
      {filteredStylists.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No stylists found matching your criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStylists.map((stylist) => (
            <Card key={stylist.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl overflow-hidden">
                    {stylist.profiles.avatar_url ? (
                      <img 
                        src={stylist.profiles.avatar_url} 
                        alt={stylist.profiles.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      stylist.profiles.full_name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle>{stylist.business_name || stylist.profiles.full_name}</CardTitle>
                    <CardDescription>
                      {stylist.profiles.full_name}
                      {stylist.total_reviews > 0 && (
                        <span className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{stylist.average_rating?.toFixed(1)}</span>
                          <span className="text-xs">({stylist.total_reviews} reviews)</span>
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {stylist.specialty && (
                  <Badge variant="secondary">{stylist.specialty}</Badge>
                )}

                {stylist.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{stylist.bio}</p>
                )}

                <div className="space-y-2 text-sm">
                  {stylist.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{stylist.location}</span>
                    </div>
                  )}

                  {stylist.years_experience && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Star className="h-4 w-4" />
                      <span>{stylist.years_experience} years experience</span>
                    </div>
                  )}

                  {stylist.color_line && (
                    <div className="text-muted-foreground">
                      <strong>Color Line:</strong> {stylist.color_line}
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleBookAppointment(stylist.id)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StylistDiscovery;
