import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MessageSquare, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface FavoriteStylistsProps {
  clientId: string;
}

interface Stylist {
  id: string;
  business_name: string;
  user: {
    full_name: string;
    avatar_url?: string;
  };
}

export function FavoriteStylists({ clientId }: FavoriteStylistsProps) {
  const navigate = useNavigate();
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavoriteStylists();
  }, [clientId]);

  const loadFavoriteStylists = async () => {
    try {
      // Get stylists the client has booked with most frequently
      const { data: appointments } = await supabase
        .from("appointments")
        .select(`
          stylist_id,
          stylist:stylist_profiles(
            id,
            business_name,
            user:profiles(full_name, avatar_url)
          )
        `)
        .eq("client_id", clientId)
        .eq("status", "completed");

      if (appointments) {
        const stylistCounts = new Map<string, { stylist: any; count: number }>();
        
        appointments.forEach((apt: any) => {
          if (apt.stylist) {
            const current = stylistCounts.get(apt.stylist_id) || { stylist: apt.stylist, count: 0 };
            stylistCounts.set(apt.stylist_id, {
              stylist: apt.stylist,
              count: current.count + 1,
            });
          }
        });

        const topStylists = Array.from(stylistCounts.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 3)
          .map(item => item.stylist);

        setStylists(topStylists);
      }
    } catch (error) {
      console.error("Error loading favorite stylists:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="brutal-border brutal-shadow-lg hover:brutal-shadow-xl transition-shadow bg-gradient-to-br from-card to-pink-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-display">
          <div className="p-2 rounded-lg bg-gradient-pink-rose">
            <Heart className="h-5 w-5 text-on-surface-primary" />
          </div>
          <span>Your Stylists</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : stylists.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              No favorite stylists yet. Complete some appointments to build your stylist connections!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {stylists.map((stylist) => (
              <div
                key={stylist.id}
                className="p-3 rounded-lg brutal-border bg-card/80 hover:bg-card transition-colors brutal-shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-12 w-12 brutal-border">
                    <AvatarImage src={stylist.user?.avatar_url} />
                    <AvatarFallback className="bg-gradient-purple-pink text-on-surface-primary font-bold">
                      {stylist.business_name?.[0]?.toUpperCase() || stylist.user?.full_name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs sm:text-sm truncate">
                      {stylist.business_name || stylist.user?.full_name}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">
                      Your go-to stylist
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1 h-8 text-[11px] sm:text-xs"
                    onClick={() => navigate(`/stylist/${stylist.id}`)}
                  >
                    <Calendar className="h-3 w-3" />
                    Book
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1 h-8 text-[11px] sm:text-xs"
                    onClick={() => navigate("/messages")}
                  >
                    <MessageSquare className="h-3 w-3" />
                    Message
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
