/**
 * Commission Tracker Widget
 * Shows stylist's commission earnings and status
 * OPTIMIZED: Uses EnhancedAuth context to avoid duplicate queries
 */

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { format } from 'date-fns';

interface Commission {
  id: string;
  product_name: string;
  commission_amount: number;
  status: string;
  purchase_date: string | null;
  created_at: string;
}

export function CommissionTrackerWidget() {
  const { stylistProfile } = useEnhancedAuth();
  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState<Commission[]>([]);

  useEffect(() => {
    if (stylistProfile?.id) {
      loadCommissions();
    }
  }, [stylistProfile?.id]);

  const loadCommissions = async () => {
    if (!stylistProfile?.id) return;

    try {
      // Get recent commissions - NO DUPLICATE QUERY
      const { data, error } = await supabase
        .from('commissions')
        .select('*')
        .eq('stylist_id', stylistProfile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setCommissions(data || []);
    } catch (error) {
      console.error('Error loading commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totalPending = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + Number(c.commission_amount), 0);

  const totalPaid = commissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + Number(c.commission_amount), 0);

  const totalThisMonth = commissions
    .filter(c => {
      const date = new Date(c.created_at);
      const now = new Date();
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, c) => sum + Number(c.commission_amount), 0);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-success" />
          Commission Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold text-success">
              ${totalThisMonth.toFixed(2)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-warning">
              ${totalPending.toFixed(2)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Paid</p>
            <p className="text-2xl font-bold text-success">
              ${totalPaid.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Recent Commissions */}
        {commissions.length > 0 ? (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-sm font-medium">Recent Commissions</p>
            <div className="space-y-2">
              {commissions.slice(0, 3).map(commission => (
                <div
                  key={commission.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {commission.status === 'paid' ? (
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-warning flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {commission.product_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(commission.created_at), 'MMM d')}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-success flex-shrink-0 ml-2">
                    ${Number(commission.commission_amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No commissions yet</p>
            <p className="text-xs mt-1">Start referring products to earn!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
