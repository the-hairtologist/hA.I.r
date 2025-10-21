import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { BeforeAfterPhotoFlow } from '@/components/BeforeAfterPhotoFlow';

interface AppointmentPhotoButtonProps {
  appointmentId: string;
  clientId: string;
  stylistId: string;
  serviceType?: string;
}

export const AppointmentPhotoButton: React.FC<AppointmentPhotoButtonProps> = ({
  appointmentId,
  clientId,
  stylistId,
  serviceType
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="relative min-h-[44px]"
        >
          <Camera className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Progress Photos</span>
          <span className="sm:hidden">Photos</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Capture Progress Photos
          </DialogTitle>
        </DialogHeader>
        <BeforeAfterPhotoFlow
          clientId={clientId}
          appointmentId={appointmentId}
          serviceType={serviceType}
          onComplete={() => {
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
