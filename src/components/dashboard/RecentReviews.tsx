import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { format } from "date-fns";

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  client: {
    user: {
      full_name: string;
    } | null;
  } | null;
}

interface RecentReviewsProps {
  reviews: Review[];
}

export const RecentReviews = ({ reviews }: RecentReviewsProps) => {
  if (reviews.length === 0) {
    return (
      <Card className="border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Recent Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No reviews yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Recent Reviews ({reviews.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-4 border-2 border-border rounded-lg bg-card hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">
                {review.client?.user?.full_name || "Anonymous"}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            {review.review_text && (
              <p className="text-sm text-muted-foreground mb-2">{review.review_text}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {format(new Date(review.created_at), "MMM d, yyyy")}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
