import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isValidPhoneNumber } from "@/lib/smsUtils";

interface PhoneNumberWarningProps {
  phoneNumber?: string | null;
  className?: string;
}

export const PhoneNumberWarning = ({ phoneNumber, className }: PhoneNumberWarningProps) => {
  const navigate = useNavigate();

  if (isValidPhoneNumber(phoneNumber)) {
    return null;
  }

  return (
    <Alert className={className}>
      <Phone className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-sm">
          📱 Add your phone number to receive SMS appointment reminders and updates!
        </span>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => navigate("/settings")}
        >
          Add Phone
        </Button>
      </AlertDescription>
    </Alert>
  );
};
