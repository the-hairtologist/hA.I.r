import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PrerequisiteCheckProps {
  type: "services" | "clients";
  onDismiss?: () => void;
}

export const PrerequisiteCheck = ({ type, onDismiss }: PrerequisiteCheckProps) => {
  const navigate = useNavigate();

  const config = {
    services: {
      title: "Services Required",
      description: "You need to add at least one service before creating appointments. This helps clients know what to book and sets clear pricing.",
      buttonText: "Add Services",
      route: "/services",
    },
    clients: {
      title: "Clients Required",
      description: "You need to add at least one client before creating formulas. Formulas are always associated with a specific client.",
      buttonText: "Add Client",
      route: "/clients",
    },
  };

  const { title, description, buttonText, route } = config[type];

  return (
    <Alert variant="default" className="border-primary/50 bg-primary/5">
      <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
      <AlertTitle className="text-foreground">{title}</AlertTitle>
      <AlertDescription className="text-muted-foreground">
        {description}
      </AlertDescription>
      <div className="flex gap-2 mt-3">
        <Button
          size="sm"
          onClick={() => navigate(route)}
          className="gap-2"
        >
          {buttonText}
        </Button>
        {onDismiss && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
          >
            Dismiss
          </Button>
        )}
      </div>
    </Alert>
  );
};
