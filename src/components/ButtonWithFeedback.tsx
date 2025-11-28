/**
 * Button With Feedback Component
 * Buttons with delightful micro-interactions and state feedback
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonWithFeedbackProps extends React.ComponentPropsWithoutRef<
  typeof Button
> {
  onClickAsync?: () => Promise<void>;
  successMessage?: string;
  errorMessage?: string;
  successDuration?: number;
  showSuccessIcon?: boolean;
}

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

export const ButtonWithFeedback = ({
  onClickAsync,
  successMessage,
  errorMessage,
  successDuration = 2000,
  showSuccessIcon = true,
  children,
  disabled,
  className,
  ...props
}: ButtonWithFeedbackProps) => {
  const [state, setState] = useState<ButtonState>('idle');

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!onClickAsync) return;

    e.preventDefault();
    setState('loading');

    try {
      await onClickAsync();
      setState('success');

      setTimeout(() => {
        setState('idle');
      }, successDuration);
    } catch (error) {
      setState('error');

      setTimeout(() => {
        setState('idle');
      }, successDuration);
    }
  };

  const isDisabled = disabled || state === 'loading' || state === 'success';

  return (
    <Button
      {...props}
      disabled={isDisabled}
      onClick={handleClick}
      className={cn(
        'transition-all duration-300',
        state === 'success' && 'bg-success hover:bg-success/90 border-success',
        state === 'error' &&
          'bg-destructive hover:bg-destructive/90 border-destructive',
        state === 'loading' && 'opacity-75',
        className
      )}
    >
      {state === 'loading' && (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          <span>Processing...</span>
        </>
      )}

      {state === 'success' && (
        <>
          {showSuccessIcon && (
            <Check className="h-4 w-4 mr-2 animate-scale-in" />
          )}
          <span>{successMessage || 'Success!'}</span>
        </>
      )}

      {state === 'error' && <span>{errorMessage || 'Error - Try again'}</span>}

      {state === 'idle' && children}
    </Button>
  );
};
