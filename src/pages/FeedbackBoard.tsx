import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowUp, MessageSquare, Plus, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/DashboardLayout";
import { format } from "date-fns";

const FeedbackBoard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

  // Fetch feedback
  const { data: feedback, isLoading } = useQuery({
    queryKey: ["product_feedback", filterType, filterStatus],
    queryFn: async () => {
      let query = supabase
        .from("product_feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterType !== "all") {
        query = query.eq("feedback_type", filterType);
      }
      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
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
      new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      under_review: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      planned: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      in_progress: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
      wont_fix: "bg-gray-500/10 text-gray-500 border-gray-500/20",
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
      <div className="container max-w-6xl py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Feedback Board</h1>
            <p className="text-muted-foreground mt-2">
              Share your ideas and help us improve hA.I.r
            </p>
          </div>
          <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
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

        {/* Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="feature_request">Feature Request</SelectItem>
                <SelectItem value="bug_report">Bug Report</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Feedback List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Loading feedback...</p>
            </Card>
          ) : feedback?.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No feedback yet. Be the first to share!</p>
            </Card>
          ) : (
            feedback?.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex gap-4">
                  {/* Upvote Button */}
                  <div className="flex flex-col items-center gap-1">
                    <Button
                      variant={userUpvotes?.includes(item.id) ? "default" : "outline"}
                      size="sm"
                      className="h-10 w-10 p-0"
                      onClick={() => upvoteMutation.mutate(item.id)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-semibold">{item.upvotes}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getTypeIcon(item.feedback_type)}</span>
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {format(new Date(item.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                      <Badge className={getStatusColor(item.status)} variant="outline">
                        {item.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm leading-relaxed">{item.description}</p>
                    {item.category && (
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    )}
                    {item.admin_response && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">Team Response</span>
                        </div>
                        <p className="text-sm">{item.admin_response}</p>
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
  const { toast } = useToast();
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
      toast({ title: "Feedback submitted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["product_feedback"] });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Failed to submit feedback",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitMutation.mutate();
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label>Type</Label>
        <Select
          value={formData.feedback_type}
          onValueChange={(value) => setFormData({ ...formData, feedback_type: value })}
        >
          <SelectTrigger>
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
        <Label>Title</Label>
        <Input
          placeholder="Brief summary of your feedback"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          placeholder="Describe your idea or issue in detail..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={5}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Category (optional)</Label>
        <Input
          placeholder="e.g., Dashboard, Appointments, Formulas"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        />
      </div>

      <Button type="submit" className="w-full" disabled={submitMutation.isPending}>
        {submitMutation.isPending ? "Submitting..." : "Submit Feedback"}
      </Button>
    </form>
  );
};

export default FeedbackBoard;
