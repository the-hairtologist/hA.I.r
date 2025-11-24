/**
 * Password Strength Indicator
 * Real-time visual feedback for password strength
 */

import { useMemo } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

type StrengthLevel = 'weak' | 'medium' | 'strong' | 'very-strong';

interface StrengthResult {
  level: StrengthLevel;
  score: number;
  label: string;
  color: string;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

export function PasswordStrength({
  password,
  className,
}: PasswordStrengthProps) {
  const strength = useMemo((): StrengthResult => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    let score = 0;
    let level: StrengthLevel = 'weak';
    let label = 'Weak';
    let color = 'text-destructive';

    if (passedChecks === 0) {
      score = 0;
    } else if (passedChecks === 1 || passedChecks === 2) {
      score = 25;
      level = 'weak';
      label = 'Weak';
      color = 'text-destructive';
    } else if (passedChecks === 3) {
      score = 50;
      level = 'medium';
      label = 'Medium';
      color = 'text-warning';
    } else if (passedChecks === 4) {
      score = 75;
      level = 'strong';
      label = 'Strong';
      color = 'text-success';
    } else {
      score = 100;
      level = 'very-strong';
      label = 'Very Strong';
      color = 'text-success';
    }

    return { level, score, label, color, checks };
  }, [password]);

  if (!password) return null;

  return (
    <div
      className={cn('space-y-2 mt-2', className)}
      role="status"
      aria-live="polite"
    >
      {/* Progress Bar */}
      <div className="space-y-1">
        <Progress
          value={strength.score}
          className={cn(
            'h-2 transition-all duration-300',
            strength.level === 'weak' && 'bg-destructive/20',
            strength.level === 'medium' && 'bg-warning/20',
            (strength.level === 'strong' || strength.level === 'very-strong') &&
              'bg-success/20'
          )}
        />
        <div className="flex items-center justify-between">
          <span
            className={cn(
              'text-xs font-medium transition-colors',
              strength.color
            )}
          >
            {strength.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {strength.score}%
          </span>
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1 text-xs">
        <RequirementCheck
          met={strength.checks.length}
          label="At least 8 characters"
        />
        <RequirementCheck
          met={strength.checks.uppercase}
          label="One uppercase letter"
        />
        <RequirementCheck
          met={strength.checks.lowercase}
          label="One lowercase letter"
        />
        <RequirementCheck met={strength.checks.number} label="One number" />
        <RequirementCheck
          met={strength.checks.special}
          label="One special character (!@#$%)"
        />
      </div>
    </div>
  );
}

function RequirementCheck({ met, label }: { met: boolean; label: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 transition-colors',
        met ? 'text-success' : 'text-muted-foreground'
      )}
    >
      {met ? (
        <Check className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
      ) : (
        <X className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
      )}
      <span>{label}</span>
    </div>
  );
}
