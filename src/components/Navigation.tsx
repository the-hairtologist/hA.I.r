import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Scissors, User, Settings, LogOut, Menu, Calendar, MessageSquare, BookOpen, Sparkles, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NavigationProps {
  userRole?: string;
  userName?: string;
}

export const Navigation = ({ userRole, userName }: NavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const stylistLinks = [
    { path: "/dashboard", label: "Dashboard", icon: Scissors },
    { path: "/appointments", label: "Appointments", icon: Calendar },
    { path: "/messages", label: "Messages", icon: MessageSquare },
    { path: "/formulas", label: "Formulas", icon: Sparkles },
    { path: "/knowledge", label: "Knowledge", icon: BookOpen },
  ];

  const clientLinks = [
    { path: "/dashboard", label: "Dashboard", icon: Scissors },
    { path: "/stylists", label: "Find Stylists", icon: User },
    { path: "/my-appointments", label: "My Appointments", icon: Calendar },
    { path: "/messages", label: "Messages", icon: MessageSquare },
    { path: "/my-formulas", label: "My Formulas", icon: Sparkles },
  ];

  const links = userRole === "stylist" ? stylistLinks : clientLinks;

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Scissors className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">hA.I.r</h1>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Button
                  key={link.path}
                  variant={isActive(link.path) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(link.path)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Button>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {userRole && (
              <Badge variant="secondary" className="hidden sm:flex">
                {userRole === "stylist" ? "Stylist" : "Client"}
              </Badge>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{userName || "Account"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Mobile Navigation Links */}
                <div className="md:hidden">
                  {links.map((link) => {
                    const Icon = link.icon;
                    return (
                      <DropdownMenuItem
                        key={link.path}
                        onClick={() => navigate(link.path)}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {link.label}
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                </div>

                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
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
      </div>
    </nav>
  );
};
