/**
 * Empty State Component - Helpful placeholder when there's no data
 * Provides guidance and CTAs to help users take action
 */

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  illustration?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  illustration,
  className,
}: EmptyStateProps) {
  return (
    <Card
      className={cn(
        'flex flex-col items-center justify-center',
        'p-8 sm:p-12 text-center',
        'border-2 border-dashed border-border',
        'bg-muted/30',
        'animate-fade-in',
        className
      )}
    >
      {/* Icon or Illustration */}
      {illustration ? (
        <div className="mb-6 animate-scale-in">{illustration}</div>
      ) : (
        <div
          className={cn(
            'mb-6 p-4 rounded-full',
            'bg-primary/10 border-2 border-primary/20',
            'animate-scale-in'
          )}
        >
          <Icon className="h-12 w-12 text-primary" strokeWidth={1.5} />
        </div>
      )}

      {/* Title */}
      <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>

      {/* Description */}
      <p className="text-muted-foreground mb-6 max-w-md text-sm sm:text-base">
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {action && (
            <Button
              onClick={action.onClick}
              size="lg"
              className="w-full sm:w-auto hover-scale"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto hover-scale"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

/**
 * Preset Empty States for common scenarios
 */

interface PresetEmptyStateProps {
  onAction?: () => void;
  onSecondaryAction?: () => void;
  className?: string;
}

export function EmptyClientsState({
  onAction,
  className,
}: PresetEmptyStateProps) {
  const { Users } = require('lucide-react');
  
  return (
    <EmptyState
      icon={Users}
      title="No clients yet"
      description="Start building your client base by adding your first client. You can add their contact info, preferences, and hair history."
      action={
        onAction
          ? {
              label: 'Add First Client',
              onClick: onAction,
            }
          : undefined
      }
      className={className}
    />
  );
}

export function EmptyAppointmentsState({
  onAction,
  className,
}: PresetEmptyStateProps) {
  const { Calendar } = require('lucide-react');
  
  return (
    <EmptyState
      icon={Calendar}
      title="No appointments scheduled"
      description="Your schedule is empty. Book your first appointment to get started with managing your calendar."
      action={
        onAction
          ? {
              label: 'Book Appointment',
              onClick: onAction,
            }
          : undefined
      }
      className={className}
    />
  );
}

export function EmptyPortfolioState({
  onAction,
  className,
}: PresetEmptyStateProps) {
  const { Image } = require('lucide-react');
  
  return (
    <EmptyState
      icon={Image}
      title="No portfolio photos yet"
      description="Showcase your work by uploading photos of your best styles. A great portfolio helps attract new clients."
      action={
        onAction
          ? {
              label: 'Upload Photos',
              onClick: onAction,
            }
          : undefined
      }
      className={className}
    />
  );
}

export function EmptyFormulasState({
  onAction,
  className,
}: PresetEmptyStateProps) {
  const { Beaker } = require('lucide-react');
  
  return (
    <EmptyState
      icon={Beaker}
      title="No formulas saved"
      description="Save your color formulas to easily recreate perfect results for your clients every time."
      action={
        onAction
          ? {
              label: 'Create Formula',
              onClick: onAction,
            }
          : undefined
      }
      className={className}
    />
  );
}

export function EmptySearchState({ className }: { className?: string }) {
  const { SearchX } = require('lucide-react');
  
  return (
    <EmptyState
      icon={SearchX}
      title="No results found"
      description="Try adjusting your search terms or filters to find what you're looking for."
      className={className}
    />
  );
}
