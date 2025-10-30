import { Button } from '@/components/ui/button';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmptyStateCard } from '@/components/ui/empty-state-card';
import { DashboardLayout } from '@/components/DashboardLayout';

const ComingSoon = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <EmptyStateCard
          icon={Sparkles}
          title="Coming Soon!"
          description="We're working on something amazing. This feature is currently under development."
          gradient="bg-gradient-purple-pink"
          action={
            <Button
              onClick={() => navigate('/dashboard')}
              className="gap-2"
              size="lg"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          }
        />
      </div>
    </DashboardLayout>
  );
};

export default ComingSoon;
