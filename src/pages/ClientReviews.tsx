import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, TrendingUp, Users, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

const ClientReviews = () => {
  const { session } = useAuth();

  const { data: stylistProfile } = useQuery({
    queryKey: ['stylist-profile', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('stylist_profiles')
        .select('*')
        .eq('user_id', session?.user?.id)
        .maybeSingle();
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', stylistProfile?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('reviews')
        .select(`
          *,
          client_profiles!reviews_client_id_fkey (
            full_name,
            user_id
          )
        `)
        .eq('stylist_id', stylistProfile?.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!stylistProfile?.id,
  });

  const stats = {
    averageRating: stylistProfile?.average_rating || 0,
    totalReviews: stylistProfile?.total_reviews || 0,
    fiveStarCount: reviews.filter(r => r.rating === 5).length,
    recentTrend: "+12%",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Client Reviews</h1>
          <p className="text-muted-foreground">Manage and respond to client feedback</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Star className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalReviews}</p>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Star className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.fiveStarCount}</p>
                  <p className="text-sm text-muted-foreground">5-Star Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.recentTrend}</p>
                  <p className="text-sm text-muted-foreground">This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">
                <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No reviews yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Reviews will appear here after clients leave feedback
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="pb-6 border-b last:border-0">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {review.client_profiles?.full_name?.[0] || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">
                              {review.client_profiles?.full_name || "Anonymous"}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(review.created_at), "MMM d, yyyy")}
                              </span>
                            </div>
                          </div>
                        </div>
                        {review.review_text && (
                          <p className="mt-3 text-sm">{review.review_text}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientReviews;
