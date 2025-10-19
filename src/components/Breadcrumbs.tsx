import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEnhancedAuth } from "@/contexts/EnhancedAuthContext";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  clients: "Clients",
  appointments: "Appointments",
  messages: "Messages",
  schedule: "Availability",
  services: "Services & Pricing",
  finance: "Finance",
  products: "Product Inventory",
  portfolio: "Portfolio",
  reviews: "Reviews",
  knowledge: "Knowledge Base",
  "ai-assistant": "AI Assistant",
  integrations: "Integrations",
  settings: "Settings",
  profile: "My Profile",
  notifications: "Notifications",
  resources: "Help & Support",
  stylists: "Find Stylists",
  "client-requests": "My Requests",
  formulas: "Formulas",
  referrals: "Referrals",
  "booking-page": "My Booking Page",
  admin: "Admin",
  command: "Command Center",
  users: "User Management",
  "access-codes": "Access Codes",
  "system-health": "System Health",
  "app-directory": "App Directory",
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const { roles } = useEnhancedAuth();
  const userRole = roles.includes('stylist') ? 'stylist' : (roles.includes('client') ? 'client' : roles[0]);
  const pathSegments = location.pathname.split("/").filter(Boolean);

  if (pathSegments.length === 0 || pathSegments[0] === "dashboard") {
    return null;
  }

  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    
    // Role-specific labels
    let label = routeLabels[segment] || segment;
    if (segment === "client-discovery") {
      label = userRole === "client" ? "Find Stylists" : "Find Clients";
    }
    if (segment === "reviews" && userRole === "stylist") {
      label = "Client Reviews";
    }
    
    const isLast = index === pathSegments.length - 1;

    return { path, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-4 animate-fade-in">
      <ol className="flex items-center gap-2 text-sm">
        <li>
          <Link
            to="/dashboard"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </li>
        {breadcrumbs.map(({ path, label, isLast }) => (
          <li key={path} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link
                to={path}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
