/**
 * Tour Tooltip Component
 * Custom styled tooltip for guided tours
 */

import { TooltipRenderProps } from 'react-joyride';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export const TourTooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  skipProps,
  size,
}: TooltipRenderProps) => {
  return (
    <div
      {...tooltipProps}
      className="bg-background border-[3px] border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none max-w-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-[2px] border-foreground">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary border-[2px] border-foreground flex items-center justify-center">
            <span className="text-primary-foreground font-pixel text-sm">
              {index + 1}
            </span>
          </div>
          <span className="font-pixel text-xs uppercase text-muted-foreground">
            Step {index + 1} of {size}
          </span>
        </div>
        <Button
          {...closeProps}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          aria-label="Close tour"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-sm text-foreground leading-relaxed">
          {step.content}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 p-4 border-t-[2px] border-foreground bg-muted/20">
        {index > 0 ? (
          <Button
            {...backProps}
            variant="outline"
            size="sm"
            className="font-pixel text-xs uppercase border-[2px] border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            Back
          </Button>
        ) : (
          <Button
            {...skipProps}
            variant="ghost"
            size="sm"
            className="font-pixel text-xs uppercase"
          >
            Skip Tour
          </Button>
        )}

        <div className="flex gap-2">
          {continuous && (
            <Button
              {...primaryProps}
              size="sm"
              className="font-pixel text-xs uppercase bg-primary text-primary-foreground border-[2px] border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              {index === size - 1 ? 'Finish' : 'Next'}
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((index + 1) / size) * 100}%` }}
        />
      </div>
    </div>
  );
};
