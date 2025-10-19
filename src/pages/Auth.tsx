import { useReducer, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Scissors } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { handleError, createSafeHandler } from "@/lib/errorHandler";
import { authSchema } from "@/lib/validation";
import { log } from '@/lib/logger';
import { FormFieldError } from "@/components/FormFieldError";
import { eventTracker } from "@/lib/analytics/eventTracker";
import { PasswordStrength } from "@/components/PasswordStrength";

type AuthState = {
  email: string;
  password: string;
  fullName: string;
  resetEmail: string;
  showResetDialog: boolean;
  resetLoading: boolean;
  isRecoveryMode: boolean;
  newPassword: string;
  confirmPassword: string;
  errors: {
    email?: string;
    password?: string;
    fullName?: string;
    newPassword?: string;
    confirmPassword?: string;
    resetEmail?: string;
  };
};

type AuthAction =
  | { type: "SET_FIELD"; field: keyof Omit<AuthState, 'errors'>; value: any }
  | { type: "SET_ERRORS"; errors: AuthState['errors'] }
  | { type: "CLEAR_ERRORS" }
  | { type: "SET_RECOVERY_MODE"; value: boolean }
  | { type: "TOGGLE_RESET_DIALOG" }
  | { type: "SET_RESET_LOADING"; value: boolean }
  | { type: "RESET_FORM" };

const initialState: AuthState = {
  email: "",
  password: "",
  fullName: "",
  resetEmail: "",
  showResetDialog: false,
  resetLoading: false,
  isRecoveryMode: false,
  newPassword: "",
  confirmPassword: "",
  errors: {},
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value, errors: { ...state.errors, [action.field]: undefined } };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    case "CLEAR_ERRORS":
      return { ...state, errors: {} };
    case "SET_RECOVERY_MODE":
      return { ...state, isRecoveryMode: action.value };
    case "TOGGLE_RESET_DIALOG":
      return { ...state, showResetDialog: !state.showResetDialog };
    case "SET_RESET_LOADING":
      return { ...state, resetLoading: action.value };
    case "RESET_FORM":
      return initialState;
    default:
      return state;
  }
}

const Auth = () => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { loading, signIn, signUp, resetPassword, updatePassword } = useAuth();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        dispatch({ type: "SET_RECOVERY_MODE", value: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = createSafeHandler(async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    const validation = authSchema.safeParse({
      email: state.email,
      password: state.password,
      fullName: state.fullName,
    });

    if (!validation.success) {
      const newErrors: AuthState['errors'] = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as keyof AuthState['errors'];
        if (field === 'email') {
          newErrors.email = "Please enter a valid email address";
        } else if (field === 'password') {
          newErrors.password = "Password must be at least 6 characters";
        } else if (field === 'fullName') {
          newErrors.fullName = "Please enter your full name";
        }
      });
      dispatch({ type: "SET_ERRORS", errors: newErrors });
      return;
    }
    
    dispatch({ type: "CLEAR_ERRORS" });

    try {
      await signUp(state.email, state.password, state.fullName);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found after signup");

      // User will be prompted to select role after successful signup
      toast.success("Welcome to hA.I.r! Let's get you set up.");
      setTimeout(() => navigate("/dashboard"), 1500);
      log.info("User signed up successfully", "Auth", { userType: 'stylist' });
    } catch (error) {
      await supabase.auth.signOut();
      throw error;
    }
  }, "Sign Up");

  const handleSignIn = createSafeHandler(async (e: React.FormEvent) => {
    e.preventDefault();

    // Track signin attempt
    await eventTracker.track({
      eventName: 'signin_started',
      eventCategory: 'auth',
      eventData: { method: 'email' },
    });

    const validation = authSchema.safeParse({
      email: state.email,
      password: state.password,
    });

    if (!validation.success) {
      const newErrors: AuthState['errors'] = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as keyof AuthState['errors'];
        if (field === 'email') {
          newErrors.email = "Please enter a valid email address";
        } else if (field === 'password') {
          newErrors.password = "Password is required";
        }
      });
      dispatch({ type: "SET_ERRORS", errors: newErrors });
      
      // Track validation failure
      await eventTracker.track({
        eventName: 'signin_failed',
        eventCategory: 'auth',
        eventData: { reason: 'validation_error' },
      });
      return;
    }
    
    dispatch({ type: "CLEAR_ERRORS" });

    try {
      await signIn(state.email, state.password);
      
      // Track successful signin
      const { data: { user } } = await supabase.auth.getUser();
      await eventTracker.track({
        eventName: 'signin_completed',
        eventCategory: 'auth',
        eventData: { method: 'email' },
        userId: user?.id,
      });
      
      toast.success("Welcome back!");
    } catch (error: any) {
      // Track signin failure
      await eventTracker.track({
        eventName: 'signin_failed',
        eventCategory: 'auth',
        eventData: { reason: error.message || 'unknown_error' },
      });
      throw error;
    }
  }, "Sign In");

  const handlePasswordReset = createSafeHandler(async () => {
    if (!state.resetEmail) {
      dispatch({ type: "SET_ERRORS", errors: { resetEmail: "Email is required for password reset" } });
      return;
    }
    
    dispatch({ type: "CLEAR_ERRORS" });

    // Track password reset request
    await eventTracker.track({
      eventName: 'password_reset_requested',
      eventCategory: 'auth',
      eventData: { email: state.resetEmail },
    });

    dispatch({ type: "SET_RESET_LOADING", value: true });
    try {
      await resetPassword(state.resetEmail);
      
      // Track successful password reset email sent
      await eventTracker.track({
        eventName: 'password_reset_email_sent',
        eventCategory: 'auth',
      });
      
      toast.success("Password reset link sent! Check your email.");
      dispatch({ type: "TOGGLE_RESET_DIALOG" });
      dispatch({ type: "SET_FIELD", field: "resetEmail", value: "" });
    } catch (error: any) {
      // Track failure
      await eventTracker.track({
        eventName: 'password_reset_failed',
        eventCategory: 'auth',
        eventData: { reason: error.message || 'unknown_error' },
      });
      throw error;
    } finally {
      dispatch({ type: "SET_RESET_LOADING", value: false });
    }
  }, "Password Reset");

  const handleUpdatePassword = createSafeHandler(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: AuthState['errors'] = {};
    
    if (state.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }
    
    if (state.newPassword !== state.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }
    
    if (Object.keys(newErrors).length > 0) {
      dispatch({ type: "SET_ERRORS", errors: newErrors });
      return;
    }
    
    dispatch({ type: "CLEAR_ERRORS" });

    await updatePassword(state.newPassword);
    toast.success("Password updated successfully!");
    dispatch({ type: "SET_RECOVERY_MODE", value: false });
    dispatch({ type: "RESET_FORM" });
    navigate("/dashboard");
  }, "Update Password");

  const handleSocialSignIn = createSafeHandler(async (provider: 'google' | 'apple' | 'azure') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: provider === 'google' ? {
          access_type: 'offline',
          prompt: 'consent',
        } : undefined,
      },
    });

    if (error) {
      throw error;
    }
  }, "Social Sign In");

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-4 relative overflow-hidden" style={{
      backgroundImage: `
        linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%),
        linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
      `,
      backgroundSize: '8px 8px'
    }}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-secondary focus:text-secondary-foreground focus:rounded-none focus:border-[3px] focus:border-black focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:font-pixel focus:uppercase">
        Skip to main content
      </a>
      <main id="main-content" role="main" aria-label="Authentication" className="w-full max-w-md relative z-10">
        <Card className="w-full border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-background max-w-md mx-auto rounded-none">
        <CardHeader className="text-center space-y-3 px-4 sm:px-6 pt-6 border-b-[3px] border-black">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-[3px] border-black bg-primary shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
              <Scissors className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-pixel text-foreground uppercase">hA.I.r</CardTitle>
          </div>
            <CardDescription className="text-sm sm:text-base font-pixel text-foreground/80 text-center px-2 uppercase">
              {state.isRecoveryMode ? "Create New Password" : "For Professional Hair Stylists"}
            </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6 pt-6">
          {state.isRecoveryMode ? (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="font-pixel text-xs uppercase">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={state.newPassword}
                  onChange={(e) => dispatch({ type: "SET_FIELD", field: "newPassword", value: e.target.value })}
                  required
                  minLength={6}
                  placeholder="Enter new password"
                  className="border-[2px] border-foreground rounded-none h-11 focus-visible:ring-2 focus-visible:ring-primary"
                  aria-invalid={!!state.errors.newPassword}
                />
                <PasswordStrength password={state.newPassword} />
                {state.errors.newPassword && <FormFieldError message={state.errors.newPassword} />}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="font-pixel text-xs uppercase">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={state.confirmPassword}
                  onChange={(e) => dispatch({ type: "SET_FIELD", field: "confirmPassword", value: e.target.value })}
                  required
                  minLength={6}
                  placeholder="Confirm new password"
                  className="border-[2px] border-foreground rounded-none h-11 focus-visible:ring-2 focus-visible:ring-primary"
                  aria-invalid={!!state.errors.confirmPassword}
                />
                {state.errors.confirmPassword && <FormFieldError message={state.errors.confirmPassword} />}
              </div>
            <Button type="submit" className="w-full font-pixel uppercase tracking-wide bg-accent text-accent-foreground hover:bg-accent/90 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-0.5 rounded-none h-12" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
            </form>
          ) : (
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="w-full grid grid-cols-2 h-12 bg-muted/30 border-[3px] border-black rounded-none p-1">
              <TabsTrigger value="signin" className="font-pixel text-xs sm:text-sm uppercase data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:border-[2px] data-[state=active]:border-black data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="font-pixel text-xs sm:text-sm uppercase data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:border-[2px] data-[state=active]:border-black data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-5">
              <form onSubmit={handleSignIn} className="space-y-4">

                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="font-pixel text-xs uppercase">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={state.email}
                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "email", value: e.target.value })}
                    required
                    className="border-[2px] border-foreground rounded-none h-11 focus-visible:ring-2 focus-visible:ring-primary"
                    aria-invalid={!!state.errors.email}
                  />
                  {state.errors.email && <FormFieldError message={state.errors.email} />}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="font-pixel text-xs uppercase">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={state.password}
                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "password", value: e.target.value })}
                    required
                    className="border-[2px] border-foreground rounded-none h-11 focus-visible:ring-2 focus-visible:ring-primary"
                    aria-invalid={!!state.errors.password}
                  />
                  {state.errors.password && <FormFieldError message={state.errors.password} />}
                </div>
                <Button type="submit" className="w-full font-pixel uppercase tracking-wide bg-accent text-accent-foreground hover:bg-accent/90 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-0.5 rounded-none h-12" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                <Button
                  type="button" 
                  variant="ghost" 
                  className="w-full text-xs font-pixel uppercase hover:bg-muted/50" 
                  onClick={() => dispatch({ type: "TOGGLE_RESET_DIALOG" })}
                >
                  Forgot password?
                </Button>
                </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-5">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[2px] border-foreground rounded-none flex flex-col gap-1.5 h-auto py-3 opacity-40 cursor-not-allowed"
                      disabled={true}
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span className="text-xs font-pixel">Google</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="border-[2px] border-foreground rounded-none flex flex-col gap-1.5 h-auto py-3 opacity-40 cursor-not-allowed"
                      disabled={true}
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                      </svg>
                      <span className="text-xs font-pixel">Apple</span>
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full border-foreground/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground font-pixel">Or Email</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="font-pixel text-xs uppercase">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={state.fullName}
                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "fullName", value: e.target.value })}
                    required
                    className="border-[2px] border-foreground rounded-none h-11 focus-visible:ring-2 focus-visible:ring-primary"
                    aria-invalid={!!state.errors.fullName}
                  />
                  {state.errors.fullName && <FormFieldError message={state.errors.fullName} />}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="font-pixel text-xs uppercase">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={state.email}
                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "email", value: e.target.value })}
                    required
                    className="border-[2px] border-foreground rounded-none h-11 focus-visible:ring-2 focus-visible:ring-primary"
                    aria-invalid={!!state.errors.email}
                  />
                  {state.errors.email && <FormFieldError message={state.errors.email} />}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="font-pixel text-xs uppercase">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={state.password}
                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "password", value: e.target.value })}
                    required
                    minLength={6}
                    className="border-[2px] border-foreground rounded-none h-11 focus-visible:ring-2 focus-visible:ring-primary"
                    aria-invalid={!!state.errors.password}
                  />
                  <PasswordStrength password={state.password} />
                  {state.errors.password && <FormFieldError message={state.errors.password} />}
                </div>
                
              <div className="p-4 rounded-none border-[3px] border-black bg-secondary shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-sm font-pixel text-secondary-foreground mb-1 uppercase">💼 Professional Account</p>
                <p className="text-xs font-pixel text-secondary-foreground/80 uppercase">
                  7-Day Free Trial • $15/month
                </p>
              </div>
              <Button type="submit" className="w-full font-pixel uppercase tracking-wide bg-accent text-accent-foreground hover:bg-accent/90 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-0.5 rounded-none h-12" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
              </form>
            </TabsContent>
          </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Back to home link */}
      <div className="mt-6 text-center">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="font-pixel text-xs uppercase text-primary-foreground hover:text-secondary hover:bg-primary-foreground/10 border-[2px] border-transparent hover:border-black rounded-none px-4"
        >
          ← Back to Home
        </Button>
      </div>

      {/* Password Reset Dialog */}
      <Dialog open={state.showResetDialog} onOpenChange={() => dispatch({ type: "TOGGLE_RESET_DIALOG" })}>
        <DialogContent className="border-[4px] border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-background">
          <DialogHeader>
            <DialogTitle className="font-pixel uppercase text-xl">Reset Password</DialogTitle>
            <DialogDescription className="font-pixel text-xs uppercase text-muted-foreground">
              Enter your email for reset link
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="font-pixel text-xs uppercase">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                value={state.resetEmail}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "resetEmail", value: e.target.value })}
                className="border-[2px] border-foreground rounded-none h-11 focus-visible:ring-2 focus-visible:ring-primary"
                aria-invalid={!!state.errors.resetEmail}
              />
              {state.errors.resetEmail && <FormFieldError message={state.errors.resetEmail} />}
            </div>
            <Button 
              onClick={handlePasswordReset} 
              disabled={state.resetLoading}
              className="w-full font-pixel uppercase tracking-wide bg-accent text-accent-foreground hover:bg-accent/90 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-0.5 rounded-none h-12"
            >
              {state.resetLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </main>
    </div>
  );
};

export default Auth;
