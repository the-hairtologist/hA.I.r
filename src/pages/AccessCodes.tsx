import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Key, Copy, CheckCircle, XCircle, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { logger } from '@/lib/logging/productionLogger';
import { trackSelect } from '@/lib/logging/supabaseTracker';

interface AccessCode {
  id: string;
  code: string;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
  is_active: boolean;
  notes: string | null;
}

export default function AccessCodes() {
  const { user, isAdmin, loading: authLoading } = useEnhancedAuth();

  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        toast.error('Please sign in');
        setLoadingCodes(false);
        return;
      }

      if (!isAdmin) {
        toast.error('Admin access required');
        setLoadingCodes(false);
        return;
      }

      loadCodes();
    }
  }, [authLoading, user, isAdmin]);

  const loadCodes = async () => {
    try {
      const result = await trackSelect(
        async () => {
          return await supabase
            .from('access_codes')
            .select('*')
            .order('created_at', { ascending: true });
        },
        'access_codes',
        'AccessCodes'
      );

      const { data, error } = result;
      if (error) throw error;
      setCodes(data || []);
    } catch (error) {
      logger.error('Error loading access codes', error, {
        context: 'AccessCodes',
      });
      toast.error('Failed to load access codes');
    } finally {
      setLoadingCodes(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const usedCount = codes.filter(c => c.used_by !== null).length;
  const availableCount = codes.filter(
    c => c.used_by === null && c.is_active
  ).length;

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                This page is only accessible to administrators.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
            Access Code Management
          </h1>
          <p className="text-muted-foreground">
            Manage early access codes for testing users
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm">Total Codes</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold">
                {codes.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm">Used Codes</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold">
                {usedCount}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm">Available</CardTitle>
              <XCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold">
                {availableCount}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Access Codes</CardTitle>
            <CardDescription>
              Limited to 5 codes for early testing phase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {codes.map(codeItem => (
                <div
                  key={codeItem.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <code className="px-3 py-1 bg-muted rounded font-mono text-xs sm:text-sm">
                        {codeItem.code}
                      </code>
                      {codeItem.used_by ? (
                        <Badge variant="default" className="bg-green-500">
                          Used
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Available</Badge>
                      )}
                    </div>

                    {codeItem.notes && (
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {codeItem.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-[10px] xs:text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created{' '}
                        {format(new Date(codeItem.created_at), 'MMM d, yyyy')}
                      </div>
                      {codeItem.used_at && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Used{' '}
                          {format(new Date(codeItem.used_at), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(codeItem.code)}
                    disabled={!!codeItem.used_by}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
