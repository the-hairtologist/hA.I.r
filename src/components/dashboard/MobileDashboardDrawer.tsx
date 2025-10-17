import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import { DashboardSection } from "@/hooks/useDashboardLayout";

interface MobileDashboardDrawerProps {
  sections: DashboardSection[];
  renderSection: (section: DashboardSection) => React.ReactNode;
}

export const MobileDashboardDrawer = ({ sections, renderSection }: MobileDashboardDrawerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full mt-4 border-2 border-primary hover:bg-primary/10"
          size="lg"
        >
          <ChevronUp className="mr-2 h-5 w-5" />
          Show More Stats ({sections.length})
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="font-pixel text-lg">Additional Statistics</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-8 space-y-4">
          {sections.map(renderSection)}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
