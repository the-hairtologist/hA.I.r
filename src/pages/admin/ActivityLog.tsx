/**
 * Admin Activity Log Page
 * Comprehensive activity tracking with advanced filtering
 * Admin-only access
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Activity,
  Download,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  ActivityLogFilter,
  ActivityFilters,
} from '@/components/admin/ActivityLogFilter';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';

interface ActivityLogEntry {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  created_at: string;
  user?: any;
  old_data?: any;
  new_data?: any;
}

const ActivityLog = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [filters, setFilters] = useState<ActivityFilters>({});

  useEffect(() => {
    const checkRole = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setUserRole('admin');
          loadActivities();
        } else {
          toast.error('Access denied. Admin privileges required.');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking role:', error);
        navigate('/dashboard');
      } finally {
        setRoleLoading(false);
      }
    };

    checkRole();
  }, [user, navigate]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select(
          `
          *,
          user:profiles(full_name, email)
        `
        )
        .order('created_at', { ascending: false })
        .limit(200);

      // Apply date filters
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Apply client-side filters for role and type
      let filteredData = (data || []) as any[];

      if (filters.role) {
        filteredData = filteredData.filter((log: any) => {
          // This would need to be enhanced with actual role data from user_roles
          return true; // Placeholder
        });
      }

      if (filters.type) {
        filteredData = filteredData.filter((log: any) =>
          log.table_name
            .toLowerCase()
            .includes(filters.type?.toLowerCase() || '')
        );
      }

      setActivities(filteredData);
    } catch (error: any) {
      console.error('Error loading activities:', error);
      toast.error('Failed to load activity log. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    try {
      const headers = ['Date', 'User', 'Action', 'Table', 'Record ID'];
      const rows = activities.map(activity => [
        format(new Date(activity.created_at), 'yyyy-MM-dd HH:mm:ss'),
        activity.user?.full_name || 'Unknown User',
        activity.action,
        activity.table_name,
        activity.record_id || 'N/A',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();

      toast.success('Activity log exported successfully!');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export activity log');
    }
  };

  const getActionBadge = (action: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      INSERT: 'default',
      UPDATE: 'secondary',
      DELETE: 'destructive',
      ADMIN_GRANT: 'outline',
      ADMIN_REVOKE: 'destructive',
    };
    return <Badge variant={variants[action] || 'secondary'}>{action}</Badge>;
  };

  const activeFilterCount = Object.values(filters).filter(
    v => v !== undefined
  ).length;

  if (roleLoading || (loading && activities.length === 0)) {
    return <LoadingSpinner message="Loading activity log..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b-[3px] border-foreground bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-brutal">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/admin/command')}
                className="min-h-[44px] min-w-[44px] border-2 shadow-brutal"
                aria-label="Go back to admin command center"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-2xl font-pixel gradient-text">
                    Activity Log
                  </h1>
                  <p className="text-sm font-sans text-muted-foreground">
                    System-wide activity tracking
                  </p>
                </div>
              </div>
            </div>
            <Badge variant="destructive" className="font-semibold">
              ADMIN ACCESS
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters & Actions */}
        <Card className="mb-6 brutal-border brutal-shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-lg">Filter Activity</CardTitle>
                <CardDescription>
                  Track all system actions and changes
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadActivities}
                  disabled={loading}
                  className="border-2 shadow-brutal"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={exportToCSV}
                  disabled={activities.length === 0}
                  className="shadow-brutal"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ActivityLogFilter
              filters={filters}
              onFiltersChange={newFilters => {
                setFilters(newFilters);
                // Reload activities with new filters
                setTimeout(loadActivities, 100);
              }}
              activeCount={activeFilterCount}
            />
          </CardContent>
        </Card>

        {/* Activity List */}
        <Card className="brutal-border brutal-shadow-md">
          <CardHeader>
            <CardTitle>
              Recent Activity
              <Badge variant="secondary" className="ml-2">
                {activities.length} entries
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No activity found matching your filters.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {activities.map(activity => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 border-2 border-foreground rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {activity.action === 'INSERT' && (
                        <FileText className="h-5 w-5 text-primary" />
                      )}
                      {activity.action === 'UPDATE' && (
                        <Calendar className="h-5 w-5 text-secondary" />
                      )}
                      {activity.action === 'DELETE' && (
                        <Activity className="h-5 w-5 text-destructive" />
                      )}
                      {activity.action.includes('ADMIN') && (
                        <User className="h-5 w-5 text-accent" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {getActionBadge(activity.action)}
                        <span className="text-sm font-medium truncate">
                          {activity.table_name}
                        </span>
                        {activity.record_id && (
                          <Badge
                            variant="outline"
                            className="text-xs font-mono"
                          >
                            ID: {activity.record_id.substring(0, 8)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {activity.user?.full_name || 'System'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(
                            new Date(activity.created_at),
                            "MMM d, yyyy 'at' h:mm a"
                          )}
                        </span>
                      </div>
                      {(activity.old_data || activity.new_data) && (
                        <details className="mt-2 text-xs">
                          <summary className="cursor-pointer text-primary hover:underline">
                            View changes
                          </summary>
                          <div className="mt-2 p-2 bg-muted rounded border font-mono text-xs overflow-x-auto">
                            {activity.old_data && (
                              <div className="mb-2">
                                <strong className="text-destructive">
                                  Before:
                                </strong>
                                <pre className="mt-1">
                                  {JSON.stringify(activity.old_data, null, 2)}
                                </pre>
                              </div>
                            )}
                            {activity.new_data && (
                              <div>
                                <strong className="text-primary">After:</strong>
                                <pre className="mt-1">
                                  {JSON.stringify(activity.new_data, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ActivityLog;
