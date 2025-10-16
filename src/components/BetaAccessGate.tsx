import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BETA_ACCESS_CODE = "HAIR2025"; // Change this to your desired code
const STORAGE_KEY = "beta_access_granted";

const accessCodeSchema = z.string()
  .trim()
  .nonempty({ message: "Access code is required" })
  .max(50, { message: "Access code is too long" });

interface BetaAccessGateProps {
  children: React.ReactNode;
}

export const BetaAccessGate = ({ children }: BetaAccessGateProps) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [code, setCode] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user already has access
    const granted = localStorage.getItem(STORAGE_KEY);
    if (granted === "true") {
      setHasAccess(true);
    }
    setIsChecking(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedCode = accessCodeSchema.parse(code);
      
      if (validatedCode === BETA_ACCESS_CODE) {
        localStorage.setItem(STORAGE_KEY, "true");
        setHasAccess(true);
        toast({
          title: "Welcome to the beta!",
          description: "You now have access to the platform.",
        });
      } else {
        toast({
          title: "Invalid access code",
          description: "Please check your code and try again.",
          variant: "destructive",
        });
        setCode("");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid input",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    }
  };

  // Show loading state briefly
  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show access gate if no access
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border-[3px] border-foreground rounded-2xl shadow-brutal-lg p-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl border-[3px] border-foreground flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-display font-bold text-foreground">
                Beta Access
              </h1>
              <p className="text-base text-muted-foreground">
                Enter your access code to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="access-code">Access Code</Label>
                <Input
                  id="access-code"
                  type="text"
                  placeholder="Enter code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="text-center font-mono text-lg tracking-wider border-[3px] border-foreground focus:ring-primary focus:ring-2"
                  autoComplete="off"
                  autoFocus
                  maxLength={50}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] transition-all" 
                size="lg"
                disabled={!code.trim()}
              >
                Access Beta
              </Button>
            </form>

            <div className="text-center text-xs text-muted-foreground">
              Don't have an access code?<br />
              Contact us for early access.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User has access, show children
  return <>{children}</>;
};
