import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ComingSoon = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <PageHeader
        title="Coming Soon"
        icon={<Sparkles className="h-6 w-6" />}
        backTo="/dashboard"
      />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="border-[3px] border-primary shadow-[8px_8px_0px_0px_hsl(var(--primary))] bg-gradient-to-br from-purple-400 to-pink-400">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-background border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] flex items-center justify-center mb-4">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-display text-foreground">
              Coming Soon!
            </CardTitle>
            <CardDescription className="text-foreground/80 text-lg font-medium pt-2">
              We're working on something amazing
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-background/90 rounded-xl p-6 border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
              <p className="text-center text-foreground font-medium">
                This feature is currently under development. We're building something special for you!
              </p>
            </div>

            <div className="text-center space-y-4 pt-2">
              <Button 
                onClick={() => navigate("/dashboard")}
                className="gap-2 border-[3px] border-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ComingSoon;
