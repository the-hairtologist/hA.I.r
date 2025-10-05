import { useReducer, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Scissors } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { log } from "@/lib/logger";
import { handleError, createSafeHandler } from "@/lib/errorHandler";
import { authSchema } from "@/lib/validation";

type AuthState = {
  email: string;
  password: string;
  fullName: string;
  userType: "stylist" | "client";
  resetEmail: string;
  showResetDialog: boolean;
  resetLoading: boolean;
  isRecoveryMode: boolean;
  newPassword: string;
  confirmPassword: string;
};

type AuthAction =
  | { type: "SET_FIELD"; field: keyof AuthState; value: any }
  | { type: "SET_RECOVERY_MODE"; value: boolean }
  | { type: "TOGGLE_RESET_DIALOG" }
  | { type: "SET_RESET_LOADING"; value: boolean }
  | { type: "RESET_FORM" };

const initialState: AuthState = {
  email: "",
  password: "",
  fullName: "",
  userType: "client",
  resetEmail: "",
  showResetDialog: false,
  resetLoading: false,
  isRecoveryMode: false,
  newPassword: "",
  confirmPassword: "",
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
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
      const errorMsg = validation.error.errors[0].message;
      // Rebrand error messages to be friendly
      if (errorMsg.includes("email")) {
        toast.error("Hmm, that email doesn't look quite right 🤔");
      } else if (errorMsg.includes("password")) {
        toast.error("Password needs a bit more love (at least 6 characters) 💪");
      } else if (errorMsg.includes("name")) {
        toast.error("We'd love to know your name! ✨");
      } else {
        toast.error(errorMsg);
      }
      return;
    }

    try {
      await signUp(state.email, state.password, state.fullName);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found after signup");

      // Use secure function to assign role
      const { error: roleError } = await supabase.rpc('assign_user_role', {
        _user_id: user.id,
        _role: state.userType,
      });

      if (roleError) throw roleError;

      // Create appropriate profile
      if (state.userType === "stylist") {
        const { error: profileError } = await supabase
          .from("stylist_profiles")
          .insert({ user_id: user.id });
        
        if (profileError) {
          await supabase.from("user_roles").delete().eq("user_id", user.id);
          throw profileError;
        }
      } else {
        const { error: profileError } = await supabase
          .from("client_profiles")
          .insert({ user_id: user.id });
        
        if (profileError) {
          await supabase.from("user_roles").delete().eq("user_id", user.id);
          throw profileError;
        }
      }

      toast.success("Account created successfully! Welcome to hA.I.r!");
      log.info("User signed up successfully", "Auth", { userType: state.userType });
    } catch (error) {
      await supabase.auth.signOut();
      throw error;
    }
  }, "Sign Up");

  const handleSignIn = createSafeHandler(async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = authSchema.safeParse({
      email: state.email,
      password: state.password,
    });

    if (!validation.success) {
      const errorMsg = validation.error.errors[0].message;
      // Rebrand error messages to be friendly
      if (errorMsg.includes("email")) {
        toast.error("Double-check that email for us? 📧");
      } else if (errorMsg.includes("password")) {
        toast.error("Oops! Check your password and try again 🔑");
      } else {
        toast.error(errorMsg);
      }
      return;
    }

    await signIn(state.email, state.password);
    toast.success("Welcome back!");
  }, "Sign In");

  const handlePasswordReset = createSafeHandler(async () => {
    if (!state.resetEmail) {
      toast.error("We'll need your email to send the reset link 📬");
      return;
    }

    dispatch({ type: "SET_RESET_LOADING", value: true });
    try {
      await resetPassword(state.resetEmail);
      toast.success("Password reset link sent! Check your email.");
      dispatch({ type: "TOGGLE_RESET_DIALOG" });
      dispatch({ type: "SET_FIELD", field: "resetEmail", value: "" });
    } finally {
      dispatch({ type: "SET_RESET_LOADING", value: false });
    }
  }, "Password Reset");

  const handleUpdatePassword = createSafeHandler(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (state.newPassword !== state.confirmPassword) {
      toast.error("Hmm, those passwords don't match up 🔐");
      return;
    }

    if (state.newPassword.length < 6) {
      toast.error("Let's make that password a bit stronger (6+ characters) 💪");
      return;
    }

    await updatePassword(state.newPassword);
    toast.success("Password updated successfully!");
    dispatch({ type: "SET_RECOVERY_MODE", value: false });
    dispatch({ type: "RESET_FORM" });
    navigate("/dashboard");
  }, "Update Password");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-4">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg">
        Skip to main content
      </a>
      <main id="main-content" role="main" aria-label="Authentication">
        <Card className="w-full max-w-md border-[3px] border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))] bg-card">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-primary border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))]">
              <Scissors className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold font-display">hA.I.r</CardTitle>
          </div>
          <CardDescription className="text-base font-medium">
            {state.isRecoveryMode ? "Create your new password" : "Your AI-powered salon assistant"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.isRecoveryMode ? (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={state.newPassword}
                  onChange={(e) => dispatch({ type: "SET_FIELD", field: "newPassword", value: e.target.value })}
                  required
                  minLength={6}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={state.confirmPassword}
                  onChange={(e) => dispatch({ type: "SET_FIELD", field: "confirmPassword", value: e.target.value })}
                  required
                  minLength={6}
                  placeholder="Confirm new password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          ) : (
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))]">
              <TabsTrigger value="signin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-display font-bold">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-display font-bold">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={state.email}
                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "email", value: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={state.password}
                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "password", value: e.target.value })}
                    required
                  />
                </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                <Button
                  type="button" 
                  variant="link" 
                  className="w-full text-sm" 
                  onClick={() => dispatch({ type: "TOGGLE_RESET_DIALOG" })}
                >
                  Forgot password?
                </Button>
                </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={state.fullName}
                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "fullName", value: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={state.email}
                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "email", value: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={state.password}
                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "password", value: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label>I am a...</Label>
                  <Tabs value={state.userType} onValueChange={(v) => dispatch({ type: "SET_FIELD", field: "userType", value: v as "stylist" | "client" })} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-muted border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))]">
                      <TabsTrigger value="client" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-display font-bold">Client (Free)</TabsTrigger>
                      <TabsTrigger value="stylist" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground font-display font-bold">Stylist ($15/mo)</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  {state.userType === "stylist" && (
                    <div className="p-3 rounded-lg border-[3px] border-foreground bg-gradient-to-br from-purple-300 to-pink-300 shadow-[3px_3px_0px_0px_hsl(var(--foreground))]">
                      <p className="text-xs font-semibold text-foreground">💼 Professional Account</p>
                      <p className="text-xs text-foreground/80 font-medium">
                        7-day free trial, then $15/month for full stylist features
                      </p>
                    </div>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Password Reset Dialog */}
      <Dialog open={state.showResetDialog} onOpenChange={() => dispatch({ type: "TOGGLE_RESET_DIALOG" })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email and we'll send you a reset link
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                value={state.resetEmail}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "resetEmail", value: e.target.value })}
              />
            </div>
            <Button 
              onClick={handlePasswordReset} 
              disabled={state.resetLoading}
              className="w-full"
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
