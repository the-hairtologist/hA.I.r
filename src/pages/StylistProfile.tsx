import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ReviewsList } from "@/components/reviews/ReviewsList";
import { ShareButtons } from "@/components/ShareButtons";
import { SEOHead } from "@/components/SEOHead";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Star, 
  Award,
  Sparkles,
  User,
  Loader2 
} from "lucide-react";
import { toast } from "sonner";

const StylistProfile = () => {
  const navigate = useNavigate();
  const { id: paramId, username } = useParams();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get("id");
  const stylistId = paramId || queryId;
  
  const [loading, setLoading] = useState(true);
  const [stylist, setStylist] = useState<any>(null);

  useEffect(() => {
    if (stylistId) {
      loadStylist();
    } else {
      toast.error("Stylist not found");
      navigate("/stylist-discovery");
    }
  }, [stylistId]);

  const loadStylist = async () => {
    try {
      // Use safe public view to prevent exposure of sensitive business data
      // View excludes: commission_rate, color_line, buffer_time_minutes, weekly_schedule
      const { data, error } = await supabase
        .from("public_stylist_directory")
        .select("*")
        .eq("id", stylistId)
        .maybeSingle();

      if (error) throw error;
      setStylist(data);
    } catch (error: any) {
      console.error("Error loading stylist:", error);
      toast.error("Failed to load stylist profile");
      navigate("/stylist-discovery");
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = () => {
    navigate(`/book-appointment?stylist=${stylistId}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!stylist) {
    return null;
  }

  return (
    <DashboardLayout>
      <SEOHead 
        title={`${stylist.business_name} - Hair Stylist in ${stylist.location} | hA.I.r`}
        description={stylist.bio || `Professional ${stylist.specialty} specialist with ${stylist.years_experience} years of experience. Book appointments online in ${stylist.location}.`}
        keywords={`${stylist.business_name}, ${stylist.specialty}, hair stylist ${stylist.location}, salon ${stylist.location}, hair color specialist, book stylist online`}
        url={`/stylist/${stylistId}`}
        type="profile"
      />
      <div className="container mx-auto p-6 max-w-5xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/stylist-discovery")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Stylists
        </Button>

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-5xl overflow-hidden border-4 border-background shadow-lg">
                {stylist.business_name?.charAt(0).toUpperCase() || (
                  <User className="h-16 w-16 text-primary" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {stylist.business_name}
                </h1>

                {/* Rating */}
                {stylist.total_reviews > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(stylist.average_rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold">{stylist.average_rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">
                      ({stylist.total_reviews} {stylist.total_reviews === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                )}

                {/* Details */}
                <div className="space-y-2 mb-6">
                  {stylist.specialty && (
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <Badge variant="secondary">{stylist.specialty}</Badge>
                    </div>
                  )}

                  {stylist.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{stylist.location}</span>
                    </div>
                  )}

                  {stylist.years_experience && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Award className="h-4 w-4" />
                      <span>{stylist.years_experience} years of experience</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleBookAppointment} size="lg" className="flex-1 md:flex-initial">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                  
                  <ShareButtons 
                    url={`/stylist/${stylistId}`}
                    title={`Check out ${stylist.business_name} on hA.I.r`}
                    description={stylist.bio || `${stylist.specialty} specialist with ${stylist.years_experience} years of experience`}
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            {stylist.bio && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="text-lg font-semibold mb-3">About</h3>
                  <p className="text-muted-foreground leading-relaxed">{stylist.bio}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card>
          <CardHeader>
            <CardTitle>Client Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewsList stylistId={stylistId!} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StylistProfile;
