import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Clock, XCircle } from "lucide-react";

interface VerificationBannerProps {
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string | null;
}

export const VerificationBanner = ({ status, rejectionReason }: VerificationBannerProps) => {
  if (status === 'verified') {
    return null; // Don't show anything for verified stylists
  }

  if (status === 'rejected') {
    return (
      <Alert variant="destructive" className="mb-6">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Verification Rejected</AlertTitle>
        <AlertDescription>
          {rejectionReason || "Your license verification was rejected. Please contact support for more information."}
        </AlertDescription>
      </Alert>
    );
  }

  // Pending status
  return (
    <Alert className="mb-6 border-warning bg-warning/10">
      <Clock className="h-4 w-4 text-warning" />
      <AlertTitle className="text-warning">License Verification Pending</AlertTitle>
      <AlertDescription className="text-warning/90">
        Your professional license is currently being reviewed. This typically takes 24-48 hours. 
        You can explore the platform, but some features may be limited until verification is complete.
      </AlertDescription>
    </Alert>
  );
};
