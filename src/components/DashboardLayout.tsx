import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scissors, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Get user roles (may have multiple)
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      // Prioritize stylist role if user has both roles
      if (rolesData && rolesData.length > 0) {
        const stylistRole = rolesData.find(r => r.role === "stylist");
        const primaryRole = stylistRole ? "stylist" : rolesData[0].role;
        setUserRole(primaryRole);
      }
    } catch (error: any) {
      toast.error("Error loading user data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Scissors className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
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
          <header className="sticky top-0 z-40 border-b-4 border-foreground bg-white/95 backdrop-blur-sm shadow-[0_4px_0px_0px_hsl(var(--foreground))]">
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
                  <Badge variant="secondary" className="hidden sm:flex bg-yellow-300 border-2 border-foreground">
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
    </SidebarProvider>
  );
}
