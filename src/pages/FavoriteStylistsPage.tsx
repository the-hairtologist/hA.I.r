import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, Calendar, MessageSquare, MapPin, Search } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const FavoriteStylistsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch favorite stylists
  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorite-stylists', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('favorite_stylists')
        .select(`
          id,
          created_at,
          stylist_profile_id,
          stylist_profiles (
            id,
            business_name,
            specialties,
            location,
            rating,
            total_reviews
          )
        `)
        .eq('client_id', user?.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (favoriteId: string) => {
      const { error } = await supabase
        .from('favorite_stylists')
        .delete()
        .eq('id', favoriteId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-stylists'] });
      toast({
        title: "Removed from favorites",
        description: "Stylist has been removed from your favorites"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove favorite",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">Loading favorites...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs />
        <PageHeader title="Favorite Stylists" />

        <div className="grid gap-4 md:gap-6">
          {favorites && favorites.length > 0 ? (
            favorites.map((favorite: any) => {
              const stylist = favorite.stylist_profiles;
              if (!stylist) return null;
              
              return (
                <Card key={favorite.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarFallback className="text-lg bg-primary/10 text-primary">
                          {stylist.business_name?.split(" ").map((n: string) => n[0]).join("") || "S"}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold">{stylist.business_name}</h3>
                            <p className="text-sm text-muted-foreground">{stylist.specialties?.[0] || "Hair Specialist"}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => removeFavoriteMutation.mutate(favorite.id)}
                          >
                            <Heart className="h-5 w-5 fill-current" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-amber-500 fill-current" />
                            <span className="font-medium">{stylist.rating || "5.0"}</span>
                            <span className="text-muted-foreground">({stylist.total_reviews || 0} reviews)</span>
                          </div>
                          {stylist.location && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {stylist.location}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button 
                            className="flex-1 sm:flex-none"
                            onClick={() => navigate(`/stylist/${stylist.id}`)}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Book Now
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => navigate('/messages')}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  When you find stylists you love, add them to your favorites for quick access
                </p>
                <Button onClick={() => navigate('/stylist-discovery')}>
                  <Search className="h-4 w-4 mr-2" />
                  Find a Stylist
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FavoriteStylistsPage;
