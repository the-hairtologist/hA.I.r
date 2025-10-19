/**
 * Public Stylist Directory
 * SEO-optimized public landing page for stylist discovery
 * Accessible without authentication
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Calendar, Scissors, Loader2, User, Award, Sparkles } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { TrustBadge } from "@/components/TrustBadge";

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
}

const PublicStylistDirectory = () => {
  const navigate = useNavigate();
  const [stylists, setStylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStylists();
  }, []);

  const fetchStylists = async () => {
    try {
      // Use the public directory view
      const { data, error } = await supabase
        .from("public_stylist_directory")
        .select("*")
        .order("average_rating", { ascending: false, nullsFirst: false })
        .order("total_reviews", { ascending: false, nullsFirst: false })
        .limit(50); // Top 50 stylists for public discovery

      if (error) throw error;
      setStylists(data || []);
    } catch (error: any) {
      console.error("Error fetching stylists:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStylists = stylists.filter((stylist) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      stylist.business_name?.toLowerCase().includes(term) ||
      stylist.specialty?.toLowerCase().includes(term) ||
      stylist.location?.toLowerCase().includes(term) ||
      stylist.bio?.toLowerCase().includes(term)
    );
  });

  return (
    <>
      <SEOHead 
        title="Find Professional Hair Stylists Near You | hA.I.r Directory"
        description="Browse our directory of certified hair stylists and color specialists. Read reviews, view portfolios, and book appointments with top-rated professionals in your area."
        keywords="hair stylist directory, find hair colorist, salon near me, hair color specialist, certified stylist, balayage expert, book hair appointment"
        url="/stylists"
      />
      
      <div className="min-h-screen bg-background">
        {/* Public Header */}
        <header className="border-b-4 border-foreground bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <h1 className="text-xl sm:text-2xl font-pixel">hA.I.r</h1>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate("/auth")}
                className="hidden sm:inline-flex"
              >
                Sign In
              </Button>
              <Button onClick={() => navigate("/auth")}>
                Join Free
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 sm:py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-pixel mb-4">
              Find Your Perfect Stylist
            </h1>
            <p className="text-lg sm:text-xl font-sans text-muted-foreground max-w-2xl mx-auto">
              Browse certified professionals. Read real reviews. Book instantly.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, specialty, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg"
              />
            </div>
          </div>

          {/* Results Count */}
          {!loading && (
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {filteredStylists.length} Professional{filteredStylists.length !== 1 ? 's' : ''} Found
              </h2>
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          )}

          {/* Stylists Grid */}
          {!loading && filteredStylists.length === 0 && (
            <Card className="border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] bg-yellow-300">
              <CardContent className="py-16 text-center">
                <Search className="h-16 w-16 mx-auto mb-4 text-foreground/60" />
                <h3 className="text-2xl font-bold mb-2">No stylists found</h3>
                <p className="text-foreground/80 mb-4">
                  {searchTerm ? "Try a different search term" : "Be the first to join hA.I.r!"}
                </p>
                <Button onClick={() => navigate("/auth")}>
                  Join as Stylist
                </Button>
              </CardContent>
            </Card>
          )}

          {!loading && filteredStylists.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStylists.map((stylist, idx) => (
                <Card 
                  key={stylist.id} 
                  className={`border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] hover:shadow-[7px_7px_0px_0px_hsl(var(--primary))] hover:-translate-y-1 transition-all cursor-pointer ${
                    idx % 4 === 0 ? 'bg-blue-400' :
                    idx % 4 === 1 ? 'bg-green-400' :
                    idx % 4 === 2 ? 'bg-yellow-300' : 'bg-purple-400'
                  }`}
                  onClick={() => navigate(`/stylist/${stylist.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-card border-2 border-foreground flex items-center justify-center text-2xl font-bold overflow-hidden shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
                        {stylist.business_name?.charAt(0).toUpperCase() || <User className="h-8 w-8" />}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="font-pixel text-foreground">
                          {stylist.business_name || 'Professional Stylist'}
                        </CardTitle>
                        {stylist.total_reviews > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                            <span className="font-bold text-foreground">
                              {stylist.average_rating?.toFixed(1)}
                            </span>
                            <span className="text-xs text-foreground/70">
                              ({stylist.total_reviews} reviews)
                            </span>
                          </div>
                        )}
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
                      <Badge variant="secondary" className="bg-card border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
                        {stylist.specialty}
                      </Badge>
                    )}

                    {stylist.bio && (
                      <p className="text-sm text-foreground/80 line-clamp-3 font-medium">
                        {stylist.bio}
                      </p>
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
                          <Award className="h-4 w-4" />
                          <span>{stylist.years_experience} years experience</span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-2">
                    <Button 
                      variant="outline"
                      className="flex-1" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/stylist/${stylist.id}`);
                      }}
                    >
                      View Profile
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/book-appointment?stylist=${stylist.id}`);
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* CTA Section */}
          {!loading && (
            <Card className="mt-12 border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] bg-gradient-to-br from-primary/20 to-accent/20">
              <CardContent className="py-12 text-center">
                <Sparkles className="h-16 w-16 mx-auto mb-4 text-primary" />
                <h2 className="text-3xl font-bold mb-2">Are You a Stylist?</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Join hA.I.r and get discovered by clients looking for your talent.
                </p>
                <Button size="lg" onClick={() => navigate("/auth")}>
                  Join Free Today
                </Button>
              </CardContent>
            </Card>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t-4 border-foreground mt-20 py-8 bg-muted">
          <div className="container mx-auto px-4 text-center">
            <p className="text-foreground/70 font-medium mb-4">
              © 2025 hA.I.r - AI-Powered Salon Assistant
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="link" onClick={() => navigate("/privacy")}>
                Privacy
              </Button>
              <Button variant="link" onClick={() => navigate("/terms")}>
                Terms
              </Button>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default PublicStylistDirectory;
