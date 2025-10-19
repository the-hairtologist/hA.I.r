import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Scissors, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <SEOHead 
        title="Page Not Found - hA.I.r"
        description="The page you're looking for doesn't exist."
      />
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4">
        <div className="text-center max-w-md mx-auto p-8 bg-card border-[3px] border-foreground rounded-xl shadow-[8px_8px_0px_0px_hsl(var(--foreground))] animate-fade-in">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <Scissors className="h-24 w-24 text-primary animate-wiggle" />
              <div className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full h-12 w-12 flex items-center justify-center font-bold text-lg border-2 border-foreground">
                404
              </div>
            </div>
          </div>
          
          <h1 className="mb-4 text-4xl font-bold font-pixel text-foreground">
            Oops! Page Not Found
          </h1>
          
          <p className="mb-8 text-lg font-sans text-muted-foreground">
            Looks like this page got a bad haircut and disappeared. Let's get you back on track!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => window.history.back()}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            
            <Button 
              asChild
              className="gap-2"
            >
              <Link to="/">
                <Home className="h-4 w-4" />
                Return Home
              </Link>
            </Button>
          </div>
          
          <p className="mt-6 text-sm text-muted-foreground">
            If you think this is an error, please contact support.
          </p>
        </div>
      </div>
    </>
  );
};

export default NotFound;
