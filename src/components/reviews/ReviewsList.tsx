import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ReviewCard } from "./ReviewCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  client_id: string;
}

interface ReviewsListProps {
  stylistId: string;
  limit?: number;
}

export const ReviewsList = ({ stylistId, limit }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    loadReviews();
  }, [stylistId]);

  const loadReviews = async () => {
    try {
      setLoading(true);

      // Get stylist profile for rating stats
      const { data: stylistData } = await supabase
        .from("stylist_profiles")
        .select("average_rating, total_reviews")
        .eq("id", stylistId)
        .maybeSingle();

      if (stylistData) {
        setAverageRating(stylistData.average_rating || 0);
        setTotalReviews(stylistData.total_reviews || 0);
      }

      // Get reviews
      let query = supabase
        .from("reviews")
        .select(`
          *,
          client_profiles!inner(
            user_id
          )
        `)
        .eq("stylist_id", stylistId)
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data: reviewsData, error } = await query;

      if (error) throw error;

      if (reviewsData) {
        // Get client profile info
        const reviewsWithProfiles = await Promise.all(
          reviewsData.map(async (review) => {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, avatar_url")
              .eq("id", review.client_profiles.user_id)
              .maybeSingle();

            return {
              ...review,
              clientName: profile?.full_name || "Anonymous",
              clientAvatar: profile?.avatar_url,
            };
          })
        );

        setReviews(reviewsWithProfiles as any);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {totalReviews > 0 && (
        <div className="flex items-center gap-6 p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border animate-fade-in">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">{averageRating.toFixed(1)}</div>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="border-l pl-6">
            <p className="text-2xl font-semibold">{totalReviews}</p>
            <p className="text-sm text-muted-foreground">
              {totalReviews === 1 ? "Review" : "Reviews"}
            </p>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No reviews yet</p>
          </div>
        ) : (
          reviews.map((review: any) => (
            <ReviewCard
              key={review.id}
              clientName={review.clientName}
              clientAvatar={review.clientAvatar}
              rating={review.rating}
              reviewText={review.review_text}
              createdAt={review.created_at}
            />
          ))
        )}
      </div>
    </div>
  );
};
