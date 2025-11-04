/**
 * Commission Tracking Page
 * Standalone page for detailed commission management
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { CommissionTrackerWidget } from '@/components/dashboard/CommissionTrackerWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';
import { mobileFirst, touchButton } from '@/lib/responsive/mobile-first-utils';

export default function CommissionTracking() {
  const navigate = useNavigate();
  const [loading] = useState(false);

  return (
    <DashboardLayout>
      <PageHeader
        title="Commission Tracking"
        icon={<DollarSign className="h-6 w-6" />}
        backTo="/dashboard"
        loading={loading}
      />
      <div className={cn("space-y-6 pb-8", mobileFirst.padding.md, "py-6")}>

        {/* Commission Widget */}
        <CommissionTrackerWidget />

        {/* Additional Info */}
        <Card className="border-2 border-muted">
          <CardHeader className={mobileFirst.padding.md}>
            <CardTitle className={cn(mobileFirst.text.lg, "break-words")}>About Commissions</CardTitle>
          </CardHeader>
          <CardContent className={cn(mobileFirst.padding.md, "space-y-2")}>
            <p className={cn(mobileFirst.text.sm, "text-muted-foreground break-words")}>
              Track earnings from product recommendations and referral programs.
            </p>
            <p className={cn(mobileFirst.text.sm, "text-muted-foreground break-words")}>
              Commissions are calculated based on your partnership agreements
              with brands.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/referrals')}
              className={cn(touchButton.md, "mt-4")}
            >
              View Referral Programs
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
