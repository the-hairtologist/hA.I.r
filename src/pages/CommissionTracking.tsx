/**
 * Commission Tracking Page
 * Standalone page for detailed commission management
 */

import { DashboardLayout } from '@/components/DashboardLayout';
import { CommissionTrackerWidget } from '@/components/dashboard/CommissionTrackerWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

export default function CommissionTracking() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <PageHeader
        title="Commission Tracking"
        icon={<DollarSign className="h-6 w-6" />}
        backTo="/dashboard"
      />
      <div className="space-y-6 pb-8 px-4 py-6">

        {/* Commission Widget */}
        <CommissionTrackerWidget />

        {/* Additional Info */}
        <Card className="border-2 border-muted">
          <CardHeader>
            <CardTitle className="text-lg">About Commissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Track earnings from product recommendations and referral programs.
            </p>
            <p className="text-sm text-muted-foreground">
              Commissions are calculated based on your partnership agreements
              with brands.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/referrals')}
              className="mt-4"
            >
              View Referral Programs
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
