import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { format } from 'date-fns';

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
      <Card className="brutal-border brutal-shadow-xs animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-pixel">
            <Star className="h-5 w-5 text-warning" />
            Recent Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 px-6">
            <div className="inline-flex p-4 rounded-2xl bg-warning/10 mb-4 brutal-border brutal-shadow-xs">
              <Star className="h-10 w-10 text-warning" />
            </div>
            <h4 className="font-pixel font-semibold text-base mb-2">
              No Reviews Yet
            </h4>
            <p className="font-sans text-foreground/70 text-sm max-w-xs mx-auto">
              Your first client review will appear here once completed
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="brutal-border brutal-shadow-xs animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-pixel">
          <Star className="h-5 w-5 text-warning" />
          Recent Reviews ({reviews.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reviews.map((review, index) => (
          <div
            key={review.id}
            className="p-4 brutal-border rounded-lg bg-card hover:bg-card/90 transition-all animate-fade-in brutal-shadow-xs hover:brutal-shadow-sm hover:-translate-y-0.5"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-pixel font-semibold">
                {review.client?.user?.full_name || 'Anonymous'}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 transition-colors ${
                      i < review.rating
                        ? 'fill-warning text-warning'
                        : 'text-foreground/20'
                    }`}
                  />
                ))}
              </div>
            </div>
            {review.review_text && (
              <p className="text-sm text-foreground/70 mb-2 leading-relaxed">
                {review.review_text}
              </p>
            )}
            <p className="text-xs text-foreground/60 font-mono">
              {format(new Date(review.created_at), 'MMM d, yyyy')}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
