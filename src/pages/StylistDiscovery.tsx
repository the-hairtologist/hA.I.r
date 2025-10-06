import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Star, Calendar, Globe, ExternalLink, Award, Loader2 } from "lucide-react";
import { TrustBadge } from "@/components/TrustBadge";
import { ShareButtons } from "@/components/ShareButtons";
import { SEOHead } from "@/components/SEOHead";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface StylistProfile {
  id: string;
  user_id: string;
  business_name: string;
  bio: string;
  specialty: string;
  location: string;
  years_experience: number;
  average_rating?: number;
  total_reviews?: number;
  is_available: boolean;
  created_at?: string;
}

interface DiscoveredStylist {
  name: string;
  businessName: string;
  location: string;
  specialty: string;
  certifications?: string[];
  rating?: string;
  reviewCount?: string;
  portfolio?: string;
  contact?: string;
  bio?: string;
  source?: string;
}

const StylistDiscovery = () => {
  const navigate = useNavigate();
  const [stylists, setStylists] = useState<StylistProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [discoveredStylists, setDiscoveredStylists] = useState<DiscoveredStylist[]>([]);
  const [discoveringStylists, setDiscoveringStylists] = useState(false);
  const [showDiscovered, setShowDiscovered] = useState(false);

  useEffect(() => {
    fetchStylists();
  }, []);

  const discoverMoreStylists = async () => {
    setDiscoveringStylists(true);
    try {
      console.log('🔍 Starting stylist discovery...');
      const { data, error } = await supabase.functions.invoke('search-stylists', {
        body: {
          location: locationFilter !== "all" ? locationFilter : "",
          specialty: specialtyFilter !== "all" ? specialtyFilter : "",
          colorLine: "",
        },
      });

      console.log('📊 Discovery response:', { data, error });

      if (error) {
        console.error('❌ Discovery error:', error);
        throw error;
      }
      
      console.log('✅ Found stylists:', data?.stylists?.length || 0);
      setDiscoveredStylists(data?.stylists || []);
      
      if (data?.stylists?.length > 0) {
        toast.success(`Discovered ${data.stylists.length} stylists from the web`);
      } else {
        toast.info("No stylists found at this time. Try adjusting your filters.");
      }
    } catch (error: any) {
      console.error("❌ Error discovering stylists:", error);
      toast.error(error.message || "Failed to discover more stylists");
    } finally {
      setDiscoveringStylists(false);
    }
  };

  const fetchStylists = async () => {
    try {
      // Use public view for discovery - only exposes safe columns
      // Authenticated users will see additional details through RLS
      const { data, error } = await supabase
        .from("public_stylist_profiles")
        .select("*")
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
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <SEOHead 
        title="Find Professional Hair Stylists Near You | hA.I.r"
        description="Discover certified hair stylists and color specialists. Browse portfolios, read authentic reviews, and book appointments instantly. Find your perfect stylist today."
        keywords="find hair stylist, hair colorist near me, balayage specialist, color correction expert, salon appointments, hair stylist reviews, certified colorist"
        url="/stylists"
      />
      <DashboardLayout>
        <div className="container mx-auto p-6 max-w-7xl animate-fade-in">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find Your Perfect Stylist</h1>
          <p className="text-muted-foreground">Browse stylists and discover the right match for your hair goals</p>
        </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, specialty, or expertise"
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

      {/* Local Stylists Grid */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Available Stylists</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Stylists on hA.I.r ready to accept bookings
            </p>
          </div>
          {filteredStylists.length > 0 && (
            <Badge variant="secondary" className="text-sm">
              {filteredStylists.length} available
            </Badge>
          )}
        </div>
        {filteredStylists.length === 0 ? (
          <Card className="border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] bg-yellow-300">
            <CardContent className="pt-6 pb-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-card flex items-center justify-center">
                <Search className="h-8 w-8 text-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">No stylists found</h3>
              <p className="text-foreground/80 font-medium mb-4">
                {searchTerm || locationFilter !== "all" || specialtyFilter !== "all"
                  ? "Try adjusting your search criteria or clearing filters"
                  : "No stylists have joined hA.I.r yet in this area"}
              </p>
              {(searchTerm || locationFilter !== "all" || specialtyFilter !== "all") && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setLocationFilter("all");
                    setSpecialtyFilter("all");
                  }}
                  className="border-2 border-foreground"
                >
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStylists.map((stylist, idx) => (
              <Card key={stylist.id} className={`border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] hover:shadow-[7px_7px_0px_0px_hsl(var(--primary))] hover:-translate-y-1 transition-all ${
                idx % 4 === 0 ? 'bg-blue-400' :
                idx % 4 === 1 ? 'bg-green-400' :
                idx % 4 === 2 ? 'bg-yellow-300' : 'bg-purple-400'
              }`}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-card border-2 border-foreground flex items-center justify-center text-2xl overflow-hidden shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
                      {stylist.business_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="font-display text-foreground">{stylist.business_name || 'Unnamed Stylist'}</CardTitle>
                      <CardDescription className="text-foreground/80 font-medium">
                        {stylist.total_reviews > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            <span className="font-bold text-foreground">{stylist.average_rating?.toFixed(1)}</span>
                            <span className="text-xs text-foreground/70">({stylist.total_reviews} reviews)</span>
                          </div>
                        )}
                      </CardDescription>
                      {/* Trust badges */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        <TrustBadge type="verified" />
                        {stylist.average_rating >= 4.5 && stylist.total_reviews >= 5 && (
                          <TrustBadge type="top-rated" />
                        )}
                        {stylist.years_experience >= 5 && (
                          <TrustBadge type="experienced" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {stylist.specialty && (
                    <Badge variant="secondary" className="bg-card border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">{stylist.specialty}</Badge>
                  )}

                  {stylist.bio && (
                    <p className="text-sm text-foreground/80 line-clamp-2 font-medium">{stylist.bio}</p>
                  )}

                  <div className="space-y-2 text-sm">
                    {stylist.location && (
                      <div className="flex items-center gap-2 text-foreground/80 font-medium">
                        <MapPin className="h-4 w-4" />
                        <span>{stylist.location}</span>
                      </div>
                    )}

                    {stylist.years_experience && (
                      <div className="flex items-center gap-2 text-foreground/80 font-medium">
                        <Star className="h-4 w-4" />
                        <span>{stylist.years_experience} years experience</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Button 
                    variant="outline"
                    className="flex-1" 
                    onClick={() => navigate(`/stylist/${stylist.id}`)}
                  >
                    View Profile
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={() => handleBookAppointment(stylist.id)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book
                  </Button>
                  <ShareButtons 
                    url={`/stylist/${stylist.id}`}
                    title={`Check out ${stylist.business_name} on hA.I.r`}
                    description={stylist.bio || `${stylist.specialty} specialist`}
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Discover More Section */}
      <Separator className="my-8" />
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              Discover More Stylists
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Find certified professionals from brand directories and top-rated platforms
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              if (!showDiscovered && discoveredStylists.length === 0) {
                discoverMoreStylists();
              }
              setShowDiscovered(!showDiscovered);
            }}
            disabled={discoveringStylists}
          >
            {discoveringStylists ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Discovering...
              </>
            ) : showDiscovered ? (
              "Hide Results"
            ) : (
              `Discover Stylists Online${discoveredStylists.length > 0 ? ` (${discoveredStylists.length})` : ''}`
            )}
          </Button>
        </div>

        {showDiscovered && (
          <>
            {discoveredStylists.length === 0 && !discoveringStylists ? (
              <Card className="border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] bg-red-400">
                <CardContent className="pt-6 text-center">
                  <p className="text-foreground/80 font-medium">No discovered stylists yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {discoveredStylists.map((stylist, index) => (
                  <Card key={index} className={`border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] hover:shadow-[7px_7px_0px_0px_hsl(var(--primary))] hover:-translate-y-1 transition-all ${
                    index % 4 === 0 ? 'bg-red-400' :
                    index % 4 === 1 ? 'bg-blue-400' :
                    index % 4 === 2 ? 'bg-green-400' : 'bg-yellow-300'
                  }`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-display text-foreground">{stylist.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1 text-foreground/80 font-medium">
                            {stylist.businessName}
                            {stylist.source && (
                              <Badge variant="outline" className="ml-2 text-xs bg-card border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
                                <Globe className="h-3 w-3 mr-1" />
                                {stylist.source}
                              </Badge>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {stylist.specialty && (
                        <Badge variant="secondary" className="bg-card border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">{stylist.specialty}</Badge>
                      )}

                      {stylist.certifications && stylist.certifications.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Award className="h-4 w-4 text-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex flex-wrap gap-1">
                            {stylist.certifications.map((cert, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-card border-2 border-foreground">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {stylist.bio && (
                        <p className="text-sm text-foreground/80 line-clamp-2 font-medium">{stylist.bio}</p>
                      )}

                      <div className="space-y-2 text-sm">
                        {stylist.location && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{stylist.location}</span>
                          </div>
                        )}

                        {stylist.rating && (
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{stylist.rating}</span>
                            {stylist.reviewCount && (
                              <span className="text-muted-foreground">({stylist.reviewCount} reviews)</span>
                            )}
                          </div>
                        )}

                        {stylist.portfolio && (
                          <div className="flex items-center gap-2 text-primary">
                            <ExternalLink className="h-4 w-4" />
                            <a 
                              href={stylist.portfolio.startsWith('http') ? stylist.portfolio : `https://instagram.com/${stylist.portfolio}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              View Portfolio
                            </a>
                          </div>
                        )}

                        {stylist.contact && (
                          <div className="text-muted-foreground">
                            <strong>Contact:</strong> {stylist.contact}
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <a 
                          href={stylist.portfolio?.startsWith('http') ? stylist.portfolio : '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Learn More
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
        </div>
      </div>
      </DashboardLayout>
    </>
  );
};

export default StylistDiscovery;
