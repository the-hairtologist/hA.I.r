import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Sparkles, Share2, Download, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TimelineEvent {
  id: string;
  date: string;
  type: "appointment" | "milestone";
  title: string;
  description: string;
  serviceType?: string;
  milestone?: string;
}

interface HairMemoryTimelineProps {
  clientId: string;
}

export const HairMemoryTimeline = ({ clientId }: HairMemoryTimelineProps) => {
  const { toast } = useToast();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientInfo, setClientInfo] = useState<any>(null);

  useEffect(() => {
    loadTimeline();
  }, [clientId]);

  const loadTimeline = async () => {
    try {
      // Get client info
      const { data: client } = await supabase
        .from("client_profiles")
        .select("*")
        .eq("id", clientId)
        .single();

      setClientInfo(client);

      // Get appointments
      const { data: appointments } = await supabase
        .from("appointments")
        .select("*")
        .eq("client_id", clientId)
        .order("appointment_date", { ascending: false });

      // Get milestones
      const { data: milestones } = await supabase
        .from("client_milestones")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      // Combine all events
      const timeline: TimelineEvent[] = [];

      appointments?.forEach((apt) => {
        timeline.push({
          id: apt.id,
          date: apt.appointment_date,
          type: "appointment",
          title: apt.service_type || "Appointment",
          description: apt.notes || "",
          serviceType: apt.service_type,
        });
      });

      milestones?.forEach((milestone) => {
        timeline.push({
          id: milestone.id,
          date: milestone.created_at,
          type: "milestone",
          title: `${milestone.milestone_value} ${milestone.milestone_type} Milestone! 🎉`,
          description: `Celebrated ${milestone.milestone_value} ${milestone.milestone_type}`,
          milestone: `$${milestone.discount_amount} off`,
        });
      });

      // Sort by date
      timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setEvents(timeline);
    } catch (error) {
      console.error("Error loading timeline:", error);
    } finally {
      setLoading(false);
    }
  };

  const shareTimeline = async () => {
    const shareText = `✨ My Hair Journey with hA.I.r\n\n${events.length} appointments • Beautiful transformations • Powered by hA.I.r`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Hair Journey",
          text: shareText,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied!",
        description: "Timeline text copied to clipboard",
      });
    }
  };

  const downloadTimeline = () => {
    toast({
      title: "PDF Export",
      description: "Timeline export functionality will be available in a future update",
      duration: 3000,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="h-6 w-6 text-primary" />
                Hair Journey Timeline
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Every appointment and transformation in one beautiful story
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={shareTimeline} variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share Journey
            </Button>
            <Button onClick={downloadTimeline} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-8">
        {events.map((event, index) => (
          <div key={event.id} className="relative">
            {/* Timeline line */}
            {index < events.length - 1 && (
              <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 to-transparent" />
            )}

            {/* Event Card */}
            <div className="flex gap-4">
              {/* Timeline dot */}
              <div
                className={cn(
                  "relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-4 border-background",
                  event.type === "appointment" && "bg-primary",
                  event.type === "milestone" && "bg-gradient-to-br from-primary to-accent animate-pulse"
                )}
              >
                {event.type === "appointment" && <Calendar className="h-5 w-5 text-on-surface-primary" />}
                {event.type === "milestone" && <span className="text-xl">🎉</span>}
              </div>

              {/* Content */}
              <Card className={cn("flex-1", event.type === "milestone" && "border-primary/50")}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(event.date), "MMMM d, yyyy")}
                      </p>
                    </div>
                    <Badge
                      variant={event.type === "appointment" ? "default" : "outline"}
                    >
                      {event.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}

                  {/* Milestone Reward */}
                  {event.milestone && (
                    <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg text-center">
                      <div className="text-lg font-bold text-primary">{event.milestone}</div>
                      <p className="text-sm text-muted-foreground mt-1">Reward unlocked!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {events.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Journey Yet</h3>
            <p className="text-muted-foreground">
              Start booking appointments to build your hair transformation story
            </p>
          </CardContent>
        </Card>
      )}

      {/* Powered by hA.I.r */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Powered by{" "}
          <span className="font-semibold text-primary cursor-pointer hover:underline">
            hA.I.r
          </span>{" "}
          - AI-Powered Salon Assistant
        </p>
      </div>
    </div>
  );
};
