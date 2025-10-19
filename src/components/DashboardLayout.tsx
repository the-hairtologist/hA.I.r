import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEnhancedAuth } from "@/contexts/EnhancedAuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileSidebarOverlay } from "@/components/MobileSidebarOverlay";
import { DemoModeIndicator } from "@/components/demo/DemoMode";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Scissors, User, LogOut, HelpCircle, Crown, ChevronDown, Moon, Sun, Monitor, Download, FileJson } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";
import { Breadcrumbs } from "@/components/Breadcrumbs";

import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user, loading, roles, isAdmin, isStylist, isClient } = useEnhancedAuth();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { unreadCount } = useRealtimeNotifications(user?.id);
  const { theme, setTheme } = useTheme();
  
  // Determine user role - admin gets full access, no role switching needed
  const userRole = isStylist ? 'stylist' : isClient ? 'client' : 'admin';

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

      // Note: Ctrl+K is handled by global CommandPalette in App.tsx

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
  if (!loading && !user) {
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
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      <div className="min-h-screen w-full max-w-[100vw] flex overflow-x-hidden bg-[image:var(--gradient-bg-main)]">
        <AppSidebar />
        <MobileSidebarOverlay />
        <DemoModeIndicator />
        
        <div className="flex-1 min-w-0 max-w-full flex flex-col overflow-x-hidden">
          {/* Mobile Header */}
          <MobileHeader 
            notificationCount={unreadCount}
          />

          {/* Desktop Header */}
          <header className={`hidden lg:flex sticky top-0 z-40 border-b-4 ${isAdmin ? 'border-amber-500/50' : 'border-foreground'} bg-background/95 backdrop-blur-sm shadow-[0_4px_0px_0px_hsl(var(--foreground))]`}>
            <div className="flex h-16 items-center gap-4 px-4 w-full">
              {/* CRITICAL: Always-visible sidebar trigger */}
              <SidebarTrigger className="h-9 w-9" />
              
              <button 
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Scissors className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold font-pixel">hA.I.r</h1>
              </button>

              <div className="ml-auto flex items-center gap-2 md:gap-3">
                <TooltipProvider>
                  {isAdmin && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="bg-amber-500 text-on-surface-primary border border-amber-600 hover:bg-amber-600 transition-colors cursor-help">
                          <Crown className="h-3 w-3 mr-1" />
                          🛡️ ADMIN - FULL ACCESS
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-xs">Administrator with full platform access</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  
                  {!isAdmin && userRole && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                      {userRole === "stylist" ? (
                        <><Scissors className="h-3 w-3 mr-1" /> Stylist</>
                      ) : (
                        <><User className="h-3 w-3 mr-1" /> Client</>
                      )}
                    </Badge>
                  )}
                  
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-2 border border-border hover:bg-muted px-2 md:px-3 transition-all">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {(user?.user_metadata?.full_name || user?.email || "U")
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="hidden sm:inline truncate max-w-[100px] text-sm">
                              {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Account"}
                            </span>
                            <ChevronDown className="h-3 w-3 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-xs">Account settings and preferences</p>
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="end" className="w-56 z-50 bg-popover">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user?.user_metadata?.full_name || "User"}</p>
                          <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/profile")}>
                        <User className="h-4 w-4 mr-2" />
                        My Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/settings")}>
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/install")}>
                        <Download className="h-4 w-4 mr-2" />
                        Install App
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/settings?tab=privacy")}>
                        <FileJson className="h-4 w-4 mr-2" />
                        Download My Data
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs text-muted-foreground">Theme</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setTheme("light")}>
                        <Sun className="h-4 w-4 mr-2" />
                        Light
                        {theme === "light" && <Badge variant="secondary" className="ml-auto text-[11px]">Active</Badge>}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("dark")}>
                        <Moon className="h-4 w-4 mr-2" />
                        Dark
                        {theme === "dark" && <Badge variant="secondary" className="ml-auto text-[11px]">Active</Badge>}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("system")}>
                        <Monitor className="h-4 w-4 mr-2" />
                        System
                        {theme === "system" && <Badge variant="secondary" className="ml-auto text-[11px]">Active</Badge>}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => {
                        localStorage.removeItem('onboarding_complete');
                        window.location.reload();
                      }}>
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Restart Tutorial
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipProvider>
              </div>
            </div>
          </header>

          {/* Main Content - CRITICAL: Prevent overflow */}
          <main
            id="main-content"
            className="flex-1 w-full max-w-full overflow-y-auto overflow-x-hidden pb-20 lg:pb-0"
            role="main"
            aria-label="Main content"
          >
            <div className="container mx-auto p-4 sm:p-6 animate-fade-in-fast w-full max-w-full">
              <Breadcrumbs />
              {children}
            </div>
          </main>
        </div>
        
        <MobileBottomNav />
      </div>
      
      <KeyboardShortcutsDialog 
        open={showShortcuts} 
        onOpenChange={setShowShortcuts}
        userRole={userRole}
      />
    </SidebarProvider>
  );
}
