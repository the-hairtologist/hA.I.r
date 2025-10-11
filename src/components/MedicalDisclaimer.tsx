/**
 * Medical Disclaimer Component
 * LEGAL PROTECTION: Limits liability for health-related data
 */

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MedicalDisclaimerProps {
  context?: "allergies" | "health" | "products" | "general";
  className?: string;
}

export const MedicalDisclaimer = ({ context = "general", className = "" }: MedicalDisclaimerProps) => {
  const disclaimers = {
    allergies: {
      title: "Medical Information Disclaimer",
      description: "The allergy and health information you provide is for stylist reference only. This platform is not a substitute for professional medical advice. If you have severe allergies or health concerns, consult your physician before any hair treatment. Stylists should independently verify all product ingredients and conduct patch tests as needed."
    },
    health: {
      title: "Health Data Notice",
      description: "Information shared about your health conditions is for styling consultation purposes only. This is not medical advice. Always consult a healthcare professional before using products that may interact with your health conditions or medications."
    },
    products: {
      title: "Product Safety Disclaimer",
      description: "Product recommendations are based on general information and user preferences. Individual reactions may vary. Always review product ingredients, perform patch tests, and consult professionals if you have sensitivities or concerns. We are not liable for allergic reactions or adverse effects."
    },
    general: {
      title: "Important Health Disclaimer",
      description: "This platform provides styling services and product information for convenience. It is not intended to diagnose, treat, cure, or prevent any medical condition. Always seek professional medical advice for health concerns. Individual results may vary."
    }
  };

  const { title, description } = disclaimers[context];

  return (
    <Alert variant="default" className={`border-warning/50 bg-warning/5 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-warning" />
      <AlertTitle className="text-warning font-semibold">{title}</AlertTitle>
      <AlertDescription className="text-muted-foreground text-sm mt-2">
        {description}
      </AlertDescription>
    </Alert>
  );
};
