/**
 * Admin Revenue Analytics Page
 * Deep-dive financial analytics for maximum profitability
 */

import { DashboardLayout } from '@/components/DashboardLayout';
import { AdminFinancialDashboard } from '@/components/admin/AdminFinancialDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, TrendingUp, DollarSign } from 'lucide-react';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';
import { mobileFirst, touchButton } from '@/lib/responsive/mobile-first-utils';

export default function AdminRevenue() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useEnhancedAuth();

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error('Admin access required');
      navigate('/dashboard');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className={cn(mobileFirst.text.sm, "text-muted-foreground break-words")}>
              Loading revenue analytics...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Revenue Analytics"
        icon={<DollarSign className="h-6 w-6" />}
        backTo="/dashboard"
        loading={loading}
        actions={
          <Button variant="outline" className={cn(touchButton.md, "gap-2")}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Report</span>
          </Button>
        }
      />
      <div className={cn("space-y-6 pb-8", mobileFirst.padding.md, "py-6")}>

        {/* Admin Notice */}
        <Card className="border-2 border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
          <CardContent className={mobileFirst.padding.md}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn(mobileFirst.text.base, "font-semibold break-words")}>Admin Financial Dashboard</p>
                <p className={cn(mobileFirst.text.sm, "text-muted-foreground break-words")}>
                  You have full access to platform revenue data, commission
                  tracking, and business metrics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Financial Dashboard */}
        <AdminFinancialDashboard />

        {/* Additional Revenue Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-2 border-primary">
            <CardHeader className={mobileFirst.padding.md}>
              <CardTitle className={cn(mobileFirst.text.lg, "break-words")}>Commission Management</CardTitle>
            </CardHeader>
            <CardContent className={mobileFirst.padding.md}>
              <p className={cn(mobileFirst.text.sm, "text-muted-foreground mb-4 break-words")}>
                Track and manage stylist commissions
              </p>
              <Button
                variant="outline"
                className={cn(touchButton.md, "w-full")}
                onClick={() => navigate('/commissions')}
              >
                View Commissions
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary">
            <CardHeader className={mobileFirst.padding.md}>
              <CardTitle className={cn(mobileFirst.text.lg, "break-words")}>Growth Analytics</CardTitle>
            </CardHeader>
            <CardContent className={mobileFirst.padding.md}>
              <p className={cn(mobileFirst.text.sm, "text-muted-foreground mb-4 break-words")}>
                Detailed platform growth metrics
              </p>
              <Button
                variant="outline"
                className={cn(touchButton.md, "w-full")}
                onClick={() => navigate('/analytics')}
              >
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
