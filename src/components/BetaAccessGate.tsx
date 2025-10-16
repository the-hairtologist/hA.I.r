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
          <div className="bg-card border border-border rounded-lg shadow-lg p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Beta Access
              </h1>
              <p className="text-sm text-muted-foreground">
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
                  onChange={(e) => setCode(e.target.value)}
                  className="text-center font-mono text-lg tracking-wider"
                  autoComplete="off"
                  autoFocus
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
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
