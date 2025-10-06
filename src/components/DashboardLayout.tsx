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
import { Scissors, User, LogOut, HelpCircle, Crown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FloatingActionButton } from "@/components/FloatingActionButton";
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

  // Listen for keyboard shortcuts (stylist only)
  useEffect(() => {
    if (userRole !== 'stylist') return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Show shortcuts dialog with Shift+?
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        setShowShortcuts(true);
        return;
      }

      // Cmd/Ctrl+K for search - dispatch custom event
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Dispatch event that search inputs can listen for
        window.dispatchEvent(new CustomEvent('global-search-focus'));
        return;
      }

      // Navigation shortcuts with 'G' key
      if (e.key === 'g' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const handleSecondKey = (e2: KeyboardEvent) => {
          e2.preventDefault();
          window.removeEventListener('keydown', handleSecondKey);
          
          switch(e2.key.toLowerCase()) {
            case 'd': navigate('/dashboard'); break;
            case 'c': navigate('/clients'); break;
            case 'a': navigate('/appointments'); break;
            case 'm': navigate('/messages'); break;
          }
        };
        window.addEventListener('keydown', handleSecondKey);
        setTimeout(() => window.removeEventListener('keydown', handleSecondKey), 2000);
      }

      // Cmd+N - New appointment (navigate to booking page)
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        navigate('/book-appointment');
      }

      // Cmd+Shift+C - Add new client
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        // Dispatch custom event to open add client dialog
        window.dispatchEvent(new CustomEvent('open-add-client-dialog'));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [userRole, navigate]);

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
      <div className="min-h-screen flex items-center justify-center bg-[image:var(--gradient-bg-main)]">
        <div className="text-center bg-card p-8 rounded-xl brutal-border shadow-brutal-2xl animate-fade-in-fast">
          <div className="relative mb-4">
            <Scissors className="h-12 w-12 text-primary animate-pulse mx-auto" aria-hidden="true" />
            <div className="absolute inset-0 h-12 w-12 mx-auto rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
          <p className="text-muted-foreground font-medium" role="status" aria-live="polite">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-[image:var(--gradient-bg-main)]">
        <AppSidebar userRole={userRole || undefined} />
        
        <div className="flex-1 min-w-0 flex flex-col">
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
                {roles.includes('admin') && (
                  <Badge className="bg-warning text-warning-foreground border-2 border-foreground animate-pulse">
                    <Crown className="h-3 w-3 mr-1" />
                    ADMIN
                  </Badge>
                )}
                
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
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
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
        <div className="container mx-auto p-4 sm:p-6 animate-fade-in-fast max-w-full">
          <Breadcrumbs />
          {children}
        </div>
      </main>
        </div>
        
        <MobileNav userRole={userRole || undefined} />
        <FloatingActionButton userRole={userRole || "client"} />
      </div>
      
      <KeyboardShortcutsDialog 
        open={showShortcuts} 
        onOpenChange={setShowShortcuts}
        userRole={userRole}
      />
    </SidebarProvider>
  );
}
