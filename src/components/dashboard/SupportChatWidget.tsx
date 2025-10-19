import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SupportChatWidget() {
  const navigate = useNavigate();

  return (
    <Card className="brutal-border bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 border-2 border-primary/20">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-pixel">Need Help?</CardTitle>
              <CardDescription className="text-xs">AI Support is available 24/7</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Get instant answers about appointments, services, pricing, and more from our AI assistant.
        </p>
        <Button 
          onClick={() => navigate("/support-chat")}
          className="w-full gap-2 group"
        >
          <MessageSquare className="h-4 w-4" />
          Open AI Support
          <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
}
