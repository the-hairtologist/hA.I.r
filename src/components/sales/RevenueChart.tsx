import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export function RevenueChart() {
  return (
    <Card className="brutal-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Revenue Trends
        </CardTitle>
        <CardDescription>
          Daily, weekly, and monthly revenue analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Revenue chart will display here</p>
            <p className="text-sm">Start tracking bookings to see trends</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
