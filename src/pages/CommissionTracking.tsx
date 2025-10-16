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

export default function CommissionTracking() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-emerald-500" />
              Commission Tracking
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your product commissions and earnings
            </p>
          </div>
        </div>

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
              Commissions are calculated based on your partnership agreements with brands.
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
