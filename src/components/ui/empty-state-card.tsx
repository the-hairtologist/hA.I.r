/**
 * EmptyStateCard - Consistent empty state component with brutal design
 * Use this for all empty states across the app for visual consistency
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  variant?: 'default' | 'success' | 'info' | 'warning';
  gradient?: string;
}

export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default',
  gradient = 'bg-gradient-purple-pink',
}: EmptyStateCardProps) {
  const variantStyles = {
    default:
      'border-foreground hover:shadow-[8px_8px_0px_0px_hsl(var(--primary))]',
    success:
      'border-success hover:shadow-[8px_8px_0px_0px_hsl(var(--success))]',
    info: 'border-info hover:shadow-[8px_8px_0px_0px_hsl(var(--info))]',
    warning:
      'border-warning hover:shadow-[8px_8px_0px_0px_hsl(var(--warning))]',
  };

  return (
    <Card
      className={`brutal-border ${variantStyles[variant]} shadow-brutal-lg transition-all duration-300 max-w-2xl mx-auto`}
    >
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-6">
          <div
            className={`w-20 h-20 rounded-2xl ${gradient} flex items-center justify-center brutal-border shadow-brutal-md`}
          >
            <Icon className="h-10 w-10 text-on-surface-primary" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold">{title}</CardTitle>
        <CardDescription className="text-base mt-2">
          {description}
        </CardDescription>
      </CardHeader>
      {action && (
        <CardContent className="text-center pb-6">{action}</CardContent>
      )}
    </Card>
  );
}
