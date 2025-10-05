import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scissors, User, LogOut, HelpCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";
import { useState, useEffect } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: roleLoading } = useUserRole(user?.id);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Prioritize stylist role if user has both roles
  const userRole = roles.includes('stylist') ? 'stylist' : roles[0] || 'client';
  const loading = authLoading || roleLoading || (user && roles.length === 0);

  // Listen for '?' key press to show keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Redirect if not authenticated
  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
        <div className="text-center bg-card p-8 rounded-xl border-[3px] border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))] animate-fade-in">
          <div className="relative mb-4">
            <Scissors className="h-12 w-12 text-primary animate-pulse mx-auto" aria-hidden="true" />
            <div className="absolute inset-0 h-12 w-12 mx-auto rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
          <p className="text-muted-foreground font-medium" role="status" aria-live="polite">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
        <AppSidebar userRole={userRole || undefined} />
        
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="sticky top-0 z-40 border-b-4 border-foreground bg-background/95 backdrop-blur-sm shadow-[0_4px_0px_0px_hsl(var(--foreground))]">
            <div className="flex h-16 items-center gap-4 px-4">
              <SidebarTrigger className="-ml-1 border-2 border-foreground" />
              
              <button 
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Scissors className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold font-display hidden sm:block">hA.I.r</h1>
              </button>

              <div className="ml-auto flex items-center gap-3">
                {userRole && (
                  <Badge variant="secondary" className="hidden sm:flex bg-warning text-warning-foreground border-2 border-foreground">
                    {userRole === "stylist" ? "✂️ Stylist" : "👤 Client"}
                  </Badge>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 border-2 border-foreground">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {user?.user_metadata?.full_name || "Account"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      localStorage.removeItem('onboarding_complete');
                      window.location.reload();
                    }}>
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Restart Tutorial
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto pb-16 md:pb-0">
            {children}
          </main>
        </div>
        
        <MobileNav userRole={userRole || undefined} />
      </div>
      
      <KeyboardShortcutsDialog 
        open={showShortcuts} 
        onOpenChange={setShowShortcuts} 
      />
    </SidebarProvider>
  );
}
