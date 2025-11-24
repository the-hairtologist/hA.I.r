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
      className="bg-background border-[3px] border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none max-w-[min(calc(100vw-2rem),400px)] sm:max-w-sm w-full relative z-[10001]"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b-[2px] border-foreground">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary border-[2px] border-foreground flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-xs sm:text-sm">
              {index + 1}
            </span>
          </div>
          <span className="font-medium text-[10px] sm:text-xs uppercase text-muted-foreground truncate">
            Step {index + 1} of {size}
          </span>
        </div>
        <Button
          {...closeProps}
          variant="ghost"
          size="sm"
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0 ml-2"
          aria-label="Close tour"
        >
          <X className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <div className="text-xs sm:text-sm text-foreground leading-relaxed">
          {step.content}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-3 sm:p-4 border-t-[2px] border-foreground bg-muted/20 flex-wrap relative z-[10001]">
        {index > 0 ? (
          <Button
            {...backProps}
            variant="outline"
            size="sm"
            className="font-semibold text-xs sm:text-xs uppercase border-[2px] border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all px-2.5 sm:px-3 h-8 sm:h-9 min-w-[64px] pointer-events-auto cursor-pointer touch-manipulation"
            aria-label="Go back to previous step"
          >
            <span className="hidden xs:inline">Back</span>
            <span className="inline xs:hidden">←</span>
          </Button>
        ) : (
          <Button
            {...skipProps}
            variant="ghost"
            size="sm"
            className="font-semibold text-xs uppercase px-2.5 sm:px-3 h-8 sm:h-9 min-w-[64px] pointer-events-auto cursor-pointer touch-manipulation"
          >
            Skip
          </Button>
        )}

        <Button
          {...primaryProps}
          size="sm"
          className="font-semibold text-xs uppercase bg-primary text-primary-foreground border-[2px] border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all px-3 sm:px-4 h-8 sm:h-9 min-w-[64px] pointer-events-auto cursor-pointer touch-manipulation"
        >
          {index === size - 1 ? (
            <>
              <span className="hidden xs:inline">Finish</span>
              <span className="inline xs:hidden">Done</span>
            </>
          ) : (
            'Next'
          )}
        </Button>
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
