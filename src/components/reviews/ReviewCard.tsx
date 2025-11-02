import { Star, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface ReviewCardProps {
  clientName: string;
  clientAvatar?: string;
  rating: number;
  reviewText?: string;
  createdAt: string;
}

export const ReviewCard = ({
  clientName,
  clientAvatar,
  rating,
  reviewText,
  createdAt,
}: ReviewCardProps) => {
  return (
    <Card className="hover:brutal-shadow-sm transition-all duration-300 animate-fade-in">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 brutal-border border-primary/10">
            <AvatarImage src={clientAvatar} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
              <User className="h-6 w-6 text-primary" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">{clientName}</h4>
              <span className="text-xs text-muted-foreground">
                {format(new Date(createdAt), 'MMM d, yyyy')}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground/30'
                  } transition-all duration-200`}
                />
              ))}
              <span className="ml-2 text-sm font-medium text-muted-foreground">
                {rating.toFixed(1)}
              </span>
            </div>

            {reviewText && (
              <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                {reviewText}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
