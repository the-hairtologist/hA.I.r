import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

export const SingleTestimonial = () => {
  return (
    <div className="container mx-auto px-4">
      <Card className="max-w-2xl mx-auto p-8 bg-card border-border">
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-primary text-primary" />
          ))}
        </div>
        
        <p className="text-lg text-card-foreground mb-6 leading-relaxed">
          "This app changed everything. I used to spend hours on admin work. Now I focus on my clients and the app handles the rest. Game changer."
        </p>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-display font-bold text-lg">SM</span>
          </div>
          <div>
            <div className="font-bold text-card-foreground">Sarah Martinez</div>
            <div className="text-sm text-muted-foreground">Stylist • Miami, FL</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
