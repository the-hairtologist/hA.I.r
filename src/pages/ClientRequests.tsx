import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Search, Calendar, MapPin, DollarSign, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { TextareaWithCounter } from "@/components/ui/textarea-with-counter";

interface ClientPost {
  id: string;
  title: string;
  description: string;
  service_type: string;
  budget_range: string | null;
  location: string | null;
  preferred_date: string | null;
  status: string;
  created_at: string;
}

const ClientRequests = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: roleLoading } = useUserRole(user?.id);
  
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<ClientPost[]>([]);
  const [clientProfileId, setClientProfileId] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<ClientPost | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    service_type: "",
    budget_range: "",
    location: "",
    preferred_date: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !roleLoading && user && roles.length > 0) {
      const isClient = roles.includes('client');
      if (!isClient) {
        toast.error("Only clients can access this page");
        navigate("/dashboard");
        return;
      }
      checkUserAndLoadPosts(user);
    } else if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, roleLoading, user, roles]);

  const checkUserAndLoadPosts = async (sessionUser: any) => {
    try {
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", sessionUser.id)
        .maybeSingle();

      if (clientProfile) {
        setClientProfileId(clientProfile.id);
        await loadPosts(clientProfile.id);
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async (profileId: string) => {
    const { data, error } = await supabase
      .from("client_hair_posts")
      .select("*")
      .eq("client_id", profileId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading posts:", error);
      toast.error("Failed to load your posts");
    } else {
      setPosts(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) {
      return;
    }
    
    if (!clientProfileId) return;

    // Basic validation
    if (!formData.title.trim() || !formData.description.trim() || !formData.service_type.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.title.length > 100) {
      toast.error("Title must be less than 100 characters");
      return;
    }

    if (formData.description.length > 1000) {
      toast.error("Description must be less than 1000 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPost) {
        const { error } = await supabase
          .from("client_hair_posts")
          .update({
            title: formData.title.trim(),
            description: formData.description.trim(),
            service_type: formData.service_type.trim(),
            budget_range: formData.budget_range.trim() || null,
            location: formData.location.trim() || null,
            preferred_date: formData.preferred_date || null,
          })
          .eq("id", editingPost.id);

        if (error) throw error;
        toast.success("Post updated successfully!");
      } else {
        const { error } = await supabase
          .from("client_hair_posts")
          .insert({
            client_id: clientProfileId,
            title: formData.title.trim(),
            description: formData.description.trim(),
            service_type: formData.service_type.trim(),
            budget_range: formData.budget_range.trim() || null,
            location: formData.location.trim() || null,
            preferred_date: formData.preferred_date || null,
          });

        if (error) throw error;
        toast.success("Post created successfully!");
      }

      setShowDialog(false);
      setEditingPost(null);
      setFormData({
        title: "",
        description: "",
        service_type: "",
        budget_range: "",
        location: "",
        preferred_date: "",
      });
      await loadPosts(clientProfileId);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Failed to save post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (post: ClientPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      description: post.description,
      service_type: post.service_type,
      budget_range: post.budget_range || "",
      location: post.location || "",
      preferred_date: post.preferred_date || "",
    });
    setShowDialog(true);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const { error } = await supabase
        .from("client_hair_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
      toast.success("Post deleted successfully");
      if (clientProfileId) {
        await loadPosts(clientProfileId);
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Failed to delete post");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-accent";
      case "claimed": return "bg-secondary";
      case "completed": return "bg-primary";
      case "cancelled": return "bg-muted";
      default: return "bg-muted";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <PageHeader
        title="My Hair Requests"
        icon={<Search className="h-6 w-6" />}
        backTo="/dashboard"
      />

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6 flex justify-between items-center">
          <p className="text-muted-foreground">
            Post your hair goals and let stylists find you!
          </p>
          <Dialog open={showDialog} onOpenChange={(open) => {
            setShowDialog(open);
            if (!open) {
              setEditingPost(null);
              setFormData({
                title: "",
                description: "",
                service_type: "",
                budget_range: "",
                location: "",
                preferred_date: "",
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl gradient-text">
                    {editingPost ? "Edit Request" : "Create New Request"}
                  </DialogTitle>
                  <DialogDescription>
                    Tell stylists what you're looking for
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Looking for Balayage Specialist"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="service_type">Service Type *</Label>
                    <Input
                      id="service_type"
                      value={formData.service_type}
                      onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                      placeholder="e.g., Balayage, Color Correction, Haircut"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <TextareaWithCounter
                      id="description"
                      value={formData.description}
                      onValueChange={(value) => setFormData({ ...formData, description: value })}
                      placeholder="Describe your hair goals, current hair condition, and what you're hoping to achieve..."
                      maxLength={2000}
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget_range">Budget Range</Label>
                    <Input
                      id="budget_range"
                      value={formData.budget_range}
                      onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
                      placeholder="e.g., $150-$300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Brooklyn, NY"
                    />
                  </div>
                  <div>
                    <Label htmlFor="preferred_date">Preferred Date</Label>
                    <Input
                      id="preferred_date"
                      type="date"
                      value={formData.preferred_date}
                      onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingPost ? "Update Request" : "Post Request"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {posts.length === 0 ? (
          <Card className="border-primary/20">
            <CardContent className="py-12 text-center">
              <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-display font-bold mb-2">No requests yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first request to connect with stylists!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <Card key={post.id} className="border-primary/20 hover:border-primary/40 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="font-display">{post.title}</CardTitle>
                      <CardDescription className="mt-1">{post.service_type}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(post.status)}>
                      {post.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {post.description}
                  </p>
                  <div className="space-y-2 text-sm">
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
                        {format(new Date(post.preferred_date), "MMM d, yyyy")}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => handleEdit(post)}
                      className="gap-2 min-h-[44px]"
                      aria-label={`Edit ${post.title}`}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => handleDelete(post.id)}
                      className="gap-2 min-h-[44px] text-destructive hover:text-destructive"
                      aria-label={`Delete ${post.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientRequests;