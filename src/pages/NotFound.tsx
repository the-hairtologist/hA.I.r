import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <div className="text-center max-w-md mx-auto p-8 bg-white border-[3px] border-foreground rounded-xl shadow-[8px_8px_0px_0px_hsl(var(--foreground))] animate-fade-in">
        <div className="text-6xl mb-4 animate-wiggle">✂️</div>
        <h1 className="mb-4 text-6xl font-bold font-display text-foreground">404</h1>
        <p className="mb-6 text-xl text-foreground/80 font-medium">Oops! This page got a bad haircut and disappeared.</p>
        <a 
          href="/" 
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg border-2 border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-semibold"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
