/**
 * Security Settings Component
 * Handles password changes and security-related settings
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FormFieldError } from '@/components/FormFieldError';
import { Lock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mobileFirst } from '@/lib/responsive/mobile-first-utils';
import { SaveIndicator } from '@/components/SaveIndicator';

interface SecuritySettingsProps {
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  passwordErrors: {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
  isChangingPassword: boolean;
  passwordSaveState: 'idle' | 'saving' | 'saved' | 'error';
  onPasswordChange: (e: React.FormEvent) => void;
}

export const SecuritySettings = ({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  passwordErrors,
  isChangingPassword,
  passwordSaveState,
  onPasswordChange,
}: SecuritySettingsProps) => {
  return (
    <Card className="border-brutal">
      <CardHeader className={mobileFirst.padding.md}>
        <CardTitle className={cn(mobileFirst.text.lg, 'flex items-center gap-2')}>
          <Lock className="h-5 w-5" />
          Password & Security
        </CardTitle>
        <CardDescription className={mobileFirst.text.sm}>
          Change your password and manage security settings
        </CardDescription>
      </CardHeader>
      <CardContent className={cn(mobileFirst.padding.md, 'space-y-4')}>
        <form onSubmit={onPasswordChange} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              aria-invalid={passwordErrors.currentPassword ? true : undefined}
              aria-describedby={
                passwordErrors.currentPassword
                  ? 'currentPassword-error'
                  : undefined
              }
            />
            {passwordErrors.currentPassword && (
              <FormFieldError
                id="currentPassword-error"
                message={passwordErrors.currentPassword}
              />
            )}
          </div>

          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter a strong password (min 8 characters)"
              aria-invalid={passwordErrors.newPassword ? true : undefined}
              aria-describedby={
                passwordErrors.newPassword ? 'newPassword-error' : undefined
              }
            />
            {passwordErrors.newPassword && (
              <FormFieldError
                id="newPassword-error"
                message={passwordErrors.newPassword}
              />
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              aria-invalid={passwordErrors.confirmPassword ? true : undefined}
              aria-describedby={
                passwordErrors.confirmPassword
                  ? 'confirmPassword-error'
                  : undefined
              }
            />
            {passwordErrors.confirmPassword && (
              <FormFieldError
                id="confirmPassword-error"
                message={passwordErrors.confirmPassword}
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={isChangingPassword}
              className="flex-1"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </>
              )}
            </Button>
            <SaveIndicator status={passwordSaveState} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
