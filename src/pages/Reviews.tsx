/**
 * Reviews Page
 * Allows clients to leave reviews and view their review history
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { format } from "date-fns";

export default function Reviews() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { isClient } = useUserRole(user?.id);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [stylistInfo, setStylistInfo] = useState<any>(null);
  
  const appointmentId = searchParams.get("appointment");
  const stylistId = searchParams.get("stylist");
  const isNewReview = !!appointmentId && !!stylistId;

  useEffect(() => {
    loadData();
  }, [user, isClient]);

  const loadData = async () => {
    if (!user) return;

    try {
      // Get client profile
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!clientProfile) {
        setLoading(false);
        return;
      }

      // Load existing reviews
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select(`
          *,
          stylist:stylist_profiles(
            id,
            business_name,
            user:profiles(full_name)
          )
        `)
        .eq("client_id", clientProfile.id)
        .order("created_at", { ascending: false });

      setReviews(reviewsData || []);

      // If creating new review, load stylist info
      if (isNewReview && stylistId) {
        const { data: stylist, error: stylistError } = await supabase
          .from("stylist_profiles")
          .select("*, user:profiles(full_name)")
          .eq("id", stylistId)
          .maybeSingle();

        if (stylistError || !stylist) {
          toast.error("Stylist not found");
        } else {
          setStylistInfo(stylist);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !appointmentId || !stylistId) {
      toast.error("Missing required information");
      return;
    }

    if (comment.length < 10) {
      toast.error("Please write at least 10 characters");
      return;
    }

    setSubmitting(true);

    try {
      // Get client profile
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!clientProfile) {
        toast.error("Client profile not found. Please complete your profile first.");
        return;
      }

      const { error } = await supabase
        .from("reviews")
        .insert({
          stylist_id: stylistId,
          client_id: clientProfile.id,
          appointment_id: appointmentId,
          rating,
          comment: comment.trim(),
        });

      if (error) throw error;

      toast.success("Thank you for your review!");
      navigate("/appointments");
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(error.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading reviews..." />;
  }

  if (!isClient) {
    return (
      <DashboardLayout>
        <Card>
          <CardHeader>
            <CardTitle>Client Feature</CardTitle>
            <CardDescription>
              Reviews are for clients only. Stylists can view their reviews in their profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Reviews</h1>
            <p className="text-muted-foreground">
              {isNewReview ? "Share your experience" : "Your review history"}
            </p>
          </div>
        </div>

        {/* New Review Form */}
        {isNewReview && stylistInfo && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle>Leave a Review</CardTitle>
              <CardDescription>
                Rate your experience with {stylistInfo.user?.full_name || stylistInfo.business_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Star Rating */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            star <= rating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <label htmlFor="comment" className="text-sm font-medium">
                    Your Review
                  </label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience... What did you love? What made it great?"
                    rows={5}
                    required
                    minLength={10}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground">
                    {comment.length}/1000 characters (minimum 10)
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting || comment.length < 10}>
                    {submitting ? "Submitting..." : "Submit Review"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/appointments")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Review History */}
        {!isNewReview && (
          <Card>
            <CardHeader>
              <CardTitle>Your Reviews ({reviews.length})</CardTitle>
              <CardDescription>
                All reviews you've left for stylists
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>You haven't left any reviews yet.</p>
                  <p className="text-sm mt-2">
                    After an appointment, you'll be able to review your experience.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-4 border-2 border-foreground rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">
                            {review.stylist?.user?.full_name || review.stylist?.business_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-primary text-primary"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {review.rating}/5
                            </Badge>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(review.created_at), "PP")}
                        </span>
                      </div>
                      <p className="text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
