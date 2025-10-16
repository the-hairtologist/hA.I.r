import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/useToast";
import { ArrowUp, MessageSquare, Plus, Filter, TrendingUp, ArrowUpDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/DashboardLayout";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { AdminFeedbackActions } from "@/components/feedback/AdminFeedbackActions";

const FeedbackBoard = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isAdmin } = useUserRole(user?.id);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

  // Real-time subscription for feedback updates
  useEffect(() => {
    const channel = supabase
      .channel('feedback-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_feedback'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["product_feedback"] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feedback_upvotes'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["product_feedback"] });
          queryClient.invalidateQueries({ queryKey: ["user_upvotes"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fetch feedback with sorting
  const { data: feedback, isLoading } = useQuery({
    queryKey: ["product_feedback", filterType, filterStatus, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("product_feedback")
        .select("*");

      if (filterType !== "all") {
        query = query.eq("feedback_type", filterType);
      }
      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      // Apply sorting
      switch (sortBy) {
        case "upvotes":
          query = query.order("upvotes", { ascending: false });
          break;
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        case "recent":
        default:
          query = query.order("created_at", { ascending: false });
          break;
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch user's upvotes
  const { data: userUpvotes } = useQuery({
    queryKey: ["user_upvotes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("feedback_upvotes")
        .select("feedback_id")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map(v => v.feedback_id);
    },
  });

  // Toggle upvote mutation
  const upvoteMutation = useMutation({
    mutationFn: async (feedbackId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const hasUpvoted = userUpvotes?.includes(feedbackId);

      if (hasUpvoted) {
        const { error } = await supabase
          .from("feedback_upvotes")
          .delete()
          .eq("feedback_id", feedbackId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("feedback_upvotes")
          .insert({ feedback_id: feedbackId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product_feedback"] });
      queryClient.invalidateQueries({ queryKey: ["user_upvotes"] });
    },
  });

  const getStatusColor = (status: string) => {
    const colors = {
      new: "bg-info/10 text-info border-info/20",
      under_review: "bg-warning/10 text-warning-foreground border-warning/20",
      planned: "bg-primary/10 text-primary border-primary/20",
      in_progress: "bg-accent/10 text-accent border-accent/20",
      completed: "bg-success/10 text-success border-success/20",
      wont_fix: "bg-muted text-muted-foreground border-border",
    };
    return colors[status as keyof typeof colors] || "";
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      feature_request: "✨",
      bug_report: "🐛",
      improvement: "📈",
      other: "💡",
    };
    return icons[type as keyof typeof icons] || "💬";
  };

  return (
    <DashboardLayout>
      <div className="container max-w-6xl py-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold font-pixel bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Feedback Board
            </h1>
            <p className="font-sans text-muted-foreground">
              💡 Share your ideas and help us improve hA.I.r
            </p>
          </div>
          <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg hover:shadow-xl transition-all">
                <Plus className="h-4 w-4" />
                Submit Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Submit Feedback</DialogTitle>
              </DialogHeader>
              <FeedbackForm onSuccess={() => setIsSubmitDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters & Sort */}
        <Card className="p-4 border-2 shadow-md">
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="h-5 w-5 text-primary" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px] border-2">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="feature_request">✨ Feature Request</SelectItem>
                <SelectItem value="bug_report">🐛 Bug Report</SelectItem>
                <SelectItem value="improvement">📈 Improvement</SelectItem>
                <SelectItem value="other">💡 Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px] border-2">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">🆕 New</SelectItem>
                <SelectItem value="under_review">👀 Under Review</SelectItem>
                <SelectItem value="planned">📋 Planned</SelectItem>
                <SelectItem value="in_progress">⚡ In Progress</SelectItem>
                <SelectItem value="completed">✅ Completed</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 ml-auto">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="upvotes">Most Upvoted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(filterType !== "all" || filterStatus !== "all" || sortBy !== "recent") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterType("all");
                  setFilterStatus("all");
                  setSortBy("recent");
                }}
                className="text-xs"
              >
                Reset
              </Button>
            )}
          </div>
        </Card>

        {/* Feedback List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card className="p-12 text-center border-2">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground">Loading feedback...</p>
              </div>
            </Card>
          ) : feedback?.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed">
              <div className="flex flex-col items-center gap-3">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
                <div>
                  <p className="font-semibold text-lg mb-1">No feedback yet</p>
                  <p className="text-muted-foreground text-sm">Be the first to share your ideas!</p>
                </div>
                <Button onClick={() => setIsSubmitDialogOpen(true)} className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Feedback
                </Button>
              </div>
            </Card>
          ) : (
            feedback?.map((item) => (
              <Card key={item.id} className="p-6 border-2 hover:shadow-lg transition-shadow group">
                <div className="flex gap-4">
                  {/* Upvote Button */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <Button
                      variant={userUpvotes?.includes(item.id) ? "default" : "outline"}
                      size="sm"
                      className={`h-12 w-12 p-0 border-2 transition-all ${
                        userUpvotes?.includes(item.id) 
                          ? "shadow-md" 
                          : "hover:border-primary hover:shadow-md"
                      }`}
                      onClick={() => upvoteMutation.mutate(item.id)}
                      disabled={upvoteMutation.isPending}
                    >
                      <ArrowUp className={`h-5 w-5 ${userUpvotes?.includes(item.id) ? "animate-bounce-gentle" : ""}`} />
                    </Button>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-bold text-foreground">{item.upvotes}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-2xl">{getTypeIcon(item.feedback_type)}</span>
                          <h3 className="font-bold text-lg font-pixel">{item.title}</h3>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {format(new Date(item.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${getStatusColor(item.status)} font-semibold uppercase text-xs`} variant="outline">
                          {item.status.replace("_", " ")}
                        </Badge>
                        {isAdmin && (
                          <AdminFeedbackActions
                            feedbackId={item.id}
                            currentStatus={item.status}
                            currentPriority={item.priority || "medium"}
                            currentAdminResponse={item.admin_response}
                          />
                        )}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90">{item.description}</p>
                    {item.category && (
                      <Badge variant="secondary" className="text-xs font-semibold">
                        🏷️ {item.category}
                      </Badge>
                    )}
                    {item.admin_response && (
                      <div className="mt-4 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <span className="font-bold text-sm text-primary">Team Response</span>
                        </div>
                        <p className="text-sm leading-relaxed">{item.admin_response}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

const FeedbackForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    feedback_type: "feature_request",
    title: "",
    description: "",
    category: "",
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("product_feedback").insert({
        user_id: user.id,
        ...formData,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Feedback submitted successfully!", "Thank you for helping us improve!");
      queryClient.invalidateQueries({ queryKey: ["product_feedback"] });
      setFormData({
        feedback_type: "feature_request",
        title: "",
        description: "",
        category: "",
      });
      onSuccess();
    },
    onError: (error) => {
      toast.error("Failed to submit feedback", error.message);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.description.trim()) {
          toast.error("Missing fields", "Please fill in all required fields");
          return;
        }
        submitMutation.mutate();
      }}
      className="space-y-5"
    >
      <div className="space-y-2">
        <Label htmlFor="feedback-type" className="text-base">Type *</Label>
        <Select
          value={formData.feedback_type}
          onValueChange={(value) => setFormData({ ...formData, feedback_type: value })}
        >
          <SelectTrigger id="feedback-type" className="border-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="feature_request">✨ Feature Request</SelectItem>
            <SelectItem value="bug_report">🐛 Bug Report</SelectItem>
            <SelectItem value="improvement">📈 Improvement</SelectItem>
            <SelectItem value="other">💡 Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="feedback-title" className="text-base">Title *</Label>
        <Input
          id="feedback-title"
          placeholder="Brief summary of your feedback"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          maxLength={100}
          className="border-2"
        />
        <p className="text-xs text-muted-foreground">{formData.title.length}/100</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="feedback-description" className="text-base">Description *</Label>
        <Textarea
          id="feedback-description"
          placeholder="Describe your idea or issue in detail..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={6}
          required
          maxLength={1000}
          className="border-2 resize-none"
        />
        <p className="text-xs text-muted-foreground">{formData.description.length}/1000</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="feedback-category" className="text-base">Category <span className="text-muted-foreground">(optional)</span></Label>
        <Input
          id="feedback-category"
          placeholder="e.g., Dashboard, Appointments, Formulas"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          maxLength={50}
          className="border-2"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full shadow-lg hover:shadow-xl transition-all" 
        disabled={submitMutation.isPending}
        size="lg"
      >
        {submitMutation.isPending ? (
          <>
            <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
            Submitting...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Submit Feedback
          </>
        )}
      </Button>
    </form>
  );
};

export default FeedbackBoard;
