import { useState, useCallback, ReactNode } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptimisticUpdateProps<T> {
  onUpdate: () => Promise<T>;
  optimisticValue?: T;
  children: (state: {
    trigger: () => void;
    isPending: boolean;
    isSuccess: boolean;
    isError: boolean;
  }) => ReactNode;
}

export function OptimisticUpdate<T>({
  onUpdate,
  optimisticValue,
  children,
}: OptimisticUpdateProps<T>) {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const trigger = useCallback(async () => {
    setIsPending(true);
    setIsError(false);
    setIsSuccess(false);

    try {
      await onUpdate();
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (error) {
      setIsError(true);
      setTimeout(() => setIsError(false), 3000);
    } finally {
      setIsPending(false);
    }
  }, [onUpdate]);

  return <>{children({ trigger, isPending, isSuccess, isError })}</>;
}

export const OptimisticButton = ({
  onUpdate,
  children,
  successMessage = 'Saved!',
  className,
}: {
  onUpdate: () => Promise<void>;
  children: ReactNode;
  successMessage?: string;
  className?: string;
}) => {
  return (
    <OptimisticUpdate onUpdate={onUpdate}>
      {({ trigger, isPending, isSuccess, isError }) => (
        <button
          onClick={trigger}
          disabled={isPending}
          className={cn(
            'relative px-4 py-2 rounded-md transition-all min-h-[44px]',
            isSuccess && 'bg-success text-on-surface-primary',
            isError && 'bg-destructive text-on-surface-primary',
            className
          )}
        >
          {isPending && (
            <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
          )}
          {isSuccess && <CheckCircle2 className="h-4 w-4 mr-2 inline" />}
          {isError && <XCircle className="h-4 w-4 mr-2 inline" />}
          {isSuccess ? successMessage : children}
        </button>
      )}
    </OptimisticUpdate>
  );
};
