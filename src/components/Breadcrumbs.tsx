import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  clients: "Clients & Formulas",
  appointments: "Appointments",
  messages: "Messages",
  schedule: "Schedule",
  services: "Services",
  finance: "Finance",
  portfolio: "Portfolio",
  knowledge: "AI Assistant",
  integrations: "Integrations",
  settings: "Settings",
  resources: "Help & Support",
  stylists: "Find Stylists",
  "client-requests": "My Requests",
  "client-discovery": "Find Clients",
  formulas: "My Formulas",
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  if (pathSegments.length === 0 || pathSegments[0] === "dashboard") {
    return null;
  }

  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = routeLabels[segment] || segment;
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
            <Home className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </li>
        {breadcrumbs.map(({ path, label, isLast }) => (
          <li key={path} className="flex items-center gap-2">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
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
