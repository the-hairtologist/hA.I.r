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
            <p className="text-muted-foreground">Loading revenue analytics...</p>
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
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
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
                Revenue Analytics
              </h1>
              <p className="text-muted-foreground mt-1">
                Complete financial overview and business intelligence
              </p>
            </div>
          </div>
          
          <Button variant="outline" className="gap-2">
            <Download className="h-5 w-5 sm:h-6 sm:w-6" />
            Export Report
          </Button>
        </div>

        {/* Admin Notice */}
        <Card className="border-2 border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold">Admin Financial Dashboard</p>
                <p className="text-sm text-muted-foreground">
                  You have full access to platform revenue data, commission tracking, and business metrics
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
            <CardHeader>
              <CardTitle className="text-lg">Commission Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Track and manage stylist commissions
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/commissions')}
              >
                View Commissions
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="text-lg">Growth Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Detailed platform growth metrics
              </p>
              <Button 
                variant="outline" 
                className="w-full"
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
