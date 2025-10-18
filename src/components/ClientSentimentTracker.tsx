/**
 * Client Sentiment Tracker
 * Analyzes client feedback, reviews, and interactions to detect sentiment trends
 */

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, ThumbsUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SentimentData {
  clientId: string;
  clientName: string;
  overallScore: number; // 0-100
  trend: "improving" | "declining" | "stable";
  recentReviews: Array<{
    rating: number;
    text: string;
    sentiment: "positive" | "neutral" | "negative";
    date: string;
  }>;
  riskLevel: "low" | "medium" | "high";
  lastAppointment: string;
}

interface ClientSentimentTrackerProps {
  stylistId?: string;
  clientId?: string;
}

export function ClientSentimentTracker({ stylistId, clientId }: ClientSentimentTrackerProps) {
  const [analyzedData, setAnalyzedData] = useState<SentimentData[]>([]);

  // Fetch reviews and appointment data
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["sentiment-data", stylistId, clientId],
    queryFn: async () => {
      let query = supabase
        .from("reviews")
        .select(`
          id,
          rating,
          review_text,
          created_at,
          client:client_profiles!inner(
            id,
            full_name,
            user:profiles(full_name)
          ),
          appointment:appointments(
            appointment_date
          )
        `)
        .order("created_at", { ascending: false });

      if (stylistId) {
        query = query.eq("stylist_id", stylistId);
      }
      
      if (clientId) {
        query = query.eq("client_id", clientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!stylistId || !!clientId,
  });

  useEffect(() => {
    if (!reviews || reviews.length === 0) return;

    // Analyze sentiment for each client
    const clientMap = new Map<string, any>();

    reviews.forEach((review: any) => {
      const clientId = review.client?.id;
      if (!clientId) return;

      if (!clientMap.has(clientId)) {
        clientMap.set(clientId, {
          clientId,
          clientName: review.client.full_name || review.client.user?.full_name || "Unknown",
          reviews: [],
          lastAppointment: review.appointment?.appointment_date || null,
        });
      }

      const sentiment = analyzeSentiment(review.rating, review.review_text);
      clientMap.get(clientId).reviews.push({
        rating: review.rating,
        text: review.review_text,
        sentiment,
        date: review.created_at,
      });
    });

    // Calculate overall scores and trends
    const analyzed: SentimentData[] = Array.from(clientMap.values()).map((client) => {
      const recentReviews = client.reviews.slice(0, 5);
      const overallScore = calculateOverallScore(client.reviews);
      const trend = calculateTrend(client.reviews);
      const riskLevel = determineRiskLevel(overallScore, trend);

      return {
        clientId: client.clientId,
        clientName: client.clientName,
        overallScore,
        trend,
        recentReviews,
        riskLevel,
        lastAppointment: client.lastAppointment,
      };
    });

    // Sort by risk level (high risk first)
    analyzed.sort((a, b) => {
      const riskOrder = { high: 0, medium: 1, low: 2 };
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    });

    setAnalyzedData(analyzed);

    // Alert for high-risk clients
    const highRiskClients = analyzed.filter((c) => c.riskLevel === "high");
    if (highRiskClients.length > 0) {
      toast.warning(
        `${highRiskClients.length} client${highRiskClients.length > 1 ? "s" : ""} showing negative sentiment trends`,
        {
          description: "Consider reaching out to improve their experience",
          duration: 8000,
        }
      );
    }
  }, [reviews]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (analyzedData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5" />
            Client Sentiment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No review data available yet. Sentiment analysis will appear after clients leave reviews.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5" />
            Client Sentiment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analyzedData.map((client) => (
            <div key={client.clientId} className="border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold">{client.clientName}</h4>
                  <p className="text-sm text-muted-foreground">
                    Last seen: {client.lastAppointment ? new Date(client.lastAppointment).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      client.riskLevel === "high"
                        ? "destructive"
                        : client.riskLevel === "medium"
                        ? "secondary"
                        : "default"
                    }
                  >
                    {client.riskLevel === "high" && <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />}
                    {client.riskLevel.toUpperCase()}
                  </Badge>
                  {client.trend === "improving" && (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  )}
                  {client.trend === "declining" && (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  {client.trend === "stable" && (
                    <Minus className="h-4 w-4 text-gray-500" />
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Sentiment Score</span>
                  <span className="font-medium">{client.overallScore}/100</span>
                </div>
                <Progress value={client.overallScore} className="h-2" />
              </div>

              {client.recentReviews.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-medium">Recent Feedback:</p>
                  {client.recentReviews.slice(0, 2).map((review, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground pl-4 border-l-2">
                      {review.text || `${review.rating}/5 stars`}
                      <span
                        className={`ml-2 ${
                          review.sentiment === "positive"
                            ? "text-green-600"
                            : review.sentiment === "negative"
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        ({review.sentiment})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions for sentiment analysis
function analyzeSentiment(rating: number, text: string | null): "positive" | "neutral" | "negative" {
  // Basic sentiment analysis based on rating and keywords
  if (rating >= 4) return "positive";
  if (rating <= 2) return "negative";

  if (!text) return "neutral";

  const lowerText = text.toLowerCase();
  const positiveWords = ["love", "amazing", "excellent", "great", "perfect", "wonderful", "fantastic"];
  const negativeWords = ["bad", "terrible", "awful", "disappointed", "poor", "horrible", "worst"];

  const positiveCount = positiveWords.filter((word) => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter((word) => lowerText.includes(word)).length;

  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
}

function calculateOverallScore(reviews: any[]): number {
  if (reviews.length === 0) return 50;

  const scores = reviews.map((r) => {
    const ratingScore = (r.rating / 5) * 100;
    const sentimentScore =
      r.sentiment === "positive" ? 100 : r.sentiment === "negative" ? 0 : 50;
    return (ratingScore + sentimentScore) / 2;
  });

  const recentWeight = 0.6; // Weight recent reviews more heavily
  const olderWeight = 0.4;

  const recentScores = scores.slice(0, 3);
  const olderScores = scores.slice(3);

  const recentAvg =
    recentScores.length > 0
      ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length
      : 50;
  const olderAvg =
    olderScores.length > 0 ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length : 50;

  return Math.round(recentAvg * recentWeight + olderAvg * olderWeight);
}

function calculateTrend(reviews: any[]): "improving" | "declining" | "stable" {
  if (reviews.length < 2) return "stable";

  const recent = reviews.slice(0, Math.ceil(reviews.length / 2));
  const older = reviews.slice(Math.ceil(reviews.length / 2));

  const recentAvg = recent.reduce((sum, r) => sum + r.rating, 0) / recent.length;
  const olderAvg = older.reduce((sum, r) => sum + r.rating, 0) / older.length;

  const difference = recentAvg - olderAvg;

  if (difference > 0.5) return "improving";
  if (difference < -0.5) return "declining";
  return "stable";
}

function determineRiskLevel(
  score: number,
  trend: "improving" | "declining" | "stable"
): "low" | "medium" | "high" {
  if (score < 40 || (score < 60 && trend === "declining")) return "high";
  if (score < 70 || trend === "declining") return "medium";
  return "low";
}
