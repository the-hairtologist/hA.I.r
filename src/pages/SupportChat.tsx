import { DashboardLayout } from "@/components/DashboardLayout";
import { SEOHead } from "@/components/SEOHead";
import { AISupportChatbot } from "@/components/support/AISupportChatbot";
import { MessageSquare } from "lucide-react";

const SupportChat = () => {
  return (
    <DashboardLayout>
      <SEOHead 
        title="AI Support | hA.I.r"
        description="24/7 automated client support for appointments and services"
      />
      
      <div className="container mx-auto p-4 sm:p-6 max-w-5xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-pixel mb-2 flex items-center gap-3">
            <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            AI Support Chat
          </h1>
          <p className="font-sans text-muted-foreground text-sm sm:text-base lg:text-lg">
            24/7 automated support for your clients
          </p>
        </div>

        <AISupportChatbot />
      </div>
    </DashboardLayout>
  );
};

export default SupportChat;
