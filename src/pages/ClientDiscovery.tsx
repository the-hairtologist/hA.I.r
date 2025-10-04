import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Calendar, MapPin, DollarSign, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ClientPost {
  id: string;
  title: string;
  description: string;
  service_type: string;
  budget_range: string | null;
  location: string | null;
  preferred_date: string | null;
  created_at: string;
  client_profiles: {
    full_name: string | null;
  } | null;
}

const ClientDiscovery = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isStylist, roles, loading: roleLoading } = useUserRole(user?.id);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<ClientPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<ClientPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stylistProfileId, setStylistProfileId] = useState<string | null>(null);

  useEffect(() => {
    filterPosts();
  }, [searchQuery, posts]);

  useEffect(() => {
    const checkAccess = async () => {
      // Only run checks after both auth and roles are fully loaded
      if (authLoading || roleLoading) {
        console.log("ClientDiscovery: Still loading", { authLoading, roleLoading, hasUser: !!user, rolesLength: roles.length });
        return;
      }

      // Additional safety check: if we have a user but no roles yet, keep waiting
      if (user && roles.length === 0) {
        console.log("ClientDiscovery: User exists but roles not loaded yet, waiting...");
        return;
      }

      console.log("ClientDiscovery: Access check", { 
        user: user?.id, 
        isStylist, 
        roles,
        authLoading, 
        roleLoading 
      });

      if (!user) {
        console.log("ClientDiscovery: No user, redirecting to auth");
        navigate("/auth");
        return;
      }

      // Check roles array directly for stylist role
      const hasStylistRole = roles.includes('stylist');
      
      if (!hasStylistRole) {
        console.error("ClientDiscovery: Access denied - not a stylist", { 
          isStylist, 
          hasStylistRole,
          roles, 
          userId: user?.id 
        });
        toast.error("Only stylists can access this page");
        navigate("/dashboard");
        return;
      }

      console.log("ClientDiscovery: Access granted, loading posts");
      // If we get here, user is authenticated and is a stylist
      await checkUserAndLoadPosts();
    };

    checkAccess();
  }, [authLoading, roleLoading, user, roles, navigate]);

  const checkUserAndLoadPosts = async () => {
    try {

      if (!user?.id) return;

      const { data: stylistProfile } = await supabase
        .from("stylist_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (stylistProfile) {
        setStylistProfileId(stylistProfile.id);
      }

      await loadPosts();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from("client_hair_posts")
      .select(`
        *,
        client_profiles (
          full_name
        )
      `)
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading posts:", error);
      toast.error("Failed to load client requests");
    } else {
      setPosts(data || []);
      setFilteredPosts(data || []);
    }
  };

  const filterPosts = () => {
    if (!searchQuery.trim()) {
      setFilteredPosts(posts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        post.service_type.toLowerCase().includes(query) ||
        post.location?.toLowerCase().includes(query)
    );
    setFilteredPosts(filtered);
  };

  const handleContactClient = async (post: ClientPost) => {
    // In a real app, this would initiate a conversation with the client
    toast.success("Contact feature coming soon! For now, the client will be notified of your interest.");
  };

  if (loading || roleLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <PageHeader
        title="Find New Clients"
        icon={<Search className="h-6 w-6" />}
        backTo="/dashboard"
      />

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <p className="text-muted-foreground mb-4">
            Browse client requests and grow your business
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by service type, location, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <Card className="border-primary/20">
            <CardContent className="py-12 text-center">
              <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-display font-bold mb-2">
                {searchQuery ? "No matching requests" : "No active requests"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Check back later for new client requests!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="font-display">{post.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {post.service_type}
                      </CardDescription>
                    </div>
                    <Badge className="bg-accent">New</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {post.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    {post.client_profiles?.full_name && (
                      <div className="font-medium">
                        Client: {post.client_profiles.full_name}
                      </div>
                    )}
                    {post.budget_range && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        {post.budget_range}
                      </div>
                    )}
                    {post.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {post.location}
                      </div>
                    )}
                    {post.preferred_date && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Preferred: {format(new Date(post.preferred_date), "MMM d, yyyy")}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Posted {format(new Date(post.created_at), "MMM d, yyyy")}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleContactClient(post)}
                    className="w-full gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Contact Client
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDiscovery;