import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Navigation } from "@/components/Navigation";
import { Settings, ArrowLeft, Download, Trash2, Loader2, FileDown, HelpCircle } from "lucide-react";
import avatarMale from "@/assets/avatar-male-lego.png";
import avatarFemale from "@/assets/avatar-female-lego.png";
import avatarNeutral from "@/assets/avatar-neutral-lego.png";

const AccountSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [gender, setGender] = useState<string>("");
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      // Get user role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (roleData) {
        setUserRole(roleData.role);
      }

      // Get user profile for gender
      const { data: profileData } = await supabase
        .from("profiles")
        .select("gender")
        .eq("id", session.user.id)
        .single();

      if (profileData?.gender) {
        setGender(profileData.gender);
        setSelectedGender(profileData.gender);
      }
    } catch (error) {
      toast.error("Error loading user data");
    } finally {
      setLoading(false);
    }
  };

  const handleGenderChange = (newGender: string) => {
    setSelectedGender(newGender);
    setHasChanges(newGender !== gender);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Save avatar changes
      if (selectedGender !== gender) {
        const { error } = await supabase
          .from("profiles")
          .update({ gender: selectedGender })
          .eq("id", session.user.id);

        if (error) throw error;
        setGender(selectedGender);
      }

      setHasChanges(false);
      toast.success("All changes saved successfully!");
    } catch (error: any) {
      console.error("Error saving changes:", error);
      toast.error("Error saving changes");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelAll = () => {
    setSelectedGender(gender);
    setHasChanges(false);
    toast.info("All changes cancelled");
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      let userData: any = { user: session.user };

      if (roleData?.role === "stylist") {
        const { data: stylistProfile } = await supabase
          .from("stylist_profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        const { data: appointments } = await supabase
          .from("appointments")
          .select("*")
          .eq("stylist_id", stylistProfile?.id);

        const { data: formulas } = await supabase
          .from("formulas")
          .select("*")
          .eq("stylist_id", stylistProfile?.id);

        userData = { ...userData, stylistProfile, appointments, formulas };
      } else {
        const { data: clientProfile } = await supabase
          .from("client_profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        const { data: appointments } = await supabase
          .from("appointments")
          .select("*")
          .eq("client_id", clientProfile?.id);

        userData = { ...userData, clientProfile, appointments };
      }

      // Create downloadable JSON
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `hair-app-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Data exported successfully!");
    } catch (error: any) {
      console.error("Error exporting data:", error);
      toast.error("Error exporting data");
    } finally {
      setExporting(false);
    }
  };

  const handleSwitchRole = async () => {
    setSwitching(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const newRole = userRole === "stylist" ? "client" : "stylist";

      // Update user role
      const { error: roleError } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", session.user.id);

      if (roleError) throw roleError;

      // Create new profile for the switched role
      if (newRole === "stylist") {
        const { error: profileError } = await supabase
          .from("stylist_profiles")
          .insert({ user_id: session.user.id });
        
        if (profileError && profileError.code !== "23505") throw profileError; // Ignore duplicate key error
      } else {
        const { error: profileError } = await supabase
          .from("client_profiles")
          .insert({ user_id: session.user.id });
        
        if (profileError && profileError.code !== "23505") throw profileError; // Ignore duplicate key error
      }

      toast.success(`Successfully switched to ${newRole} account!`);
      setUserRole(newRole);
      
      // Redirect to dashboard to refresh
      setTimeout(() => {
        navigate("/dashboard");
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error("Error switching role:", error);
      toast.error("Error switching account type");
    } finally {
      setSwitching(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      // Sign out and clear local data
      await supabase.auth.signOut();
      navigate("/");
      toast.success("Signed out successfully. To fully delete your account, please contact support.");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Error signing out");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg">
        Skip to main content
      </a>

      {/* Header */}
      <header role="banner" className="border-b-[3px] border-foreground bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-[4px_4px_0px_0px_hsl(var(--foreground)_/_0.1)]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              aria-label="Back to dashboard"
              className="hover:bg-secondary/20 hover:-translate-x-1 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-display font-bold gradient-text">Account Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" role="main" aria-label="Account Settings" className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Account Created</p>
                <p className="font-medium">
                  {user?.created_at && new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Avatar Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Your Lego Avatar</CardTitle>
              <CardDescription>Choose your personal avatar style</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                {selectedGender && (
                  <div className="w-24 h-24 border-4 border-foreground rounded-2xl overflow-hidden bg-yellow-300 shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
                    <img 
                      src={
                        selectedGender === 'male' ? avatarMale :
                        selectedGender === 'female' ? avatarFemale :
                        avatarNeutral
                      } 
                      alt="Your current avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-2 block">Avatar Style</label>
                  <Select value={selectedGender} onValueChange={handleGenderChange} disabled={saving}>
                    <SelectTrigger className="border-2 border-foreground">
                      <SelectValue placeholder="Select avatar style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male Style</SelectItem>
                      <SelectItem value="female">Female Style</SelectItem>
                      <SelectItem value="neutral">Neutral Style</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Switching */}
          <Card>
            <CardHeader>
              <CardTitle>Account Type</CardTitle>
              <CardDescription>
                Switch between stylist and client accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Account Type</p>
                <p className="font-medium capitalize">{userRole || "Loading..."}</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Switch to {userRole === "stylist" ? "Client" : "Stylist"} Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Switch Account Type?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>You're about to switch from a {userRole} account to a {userRole === "stylist" ? "client" : "stylist"} account.</p>
                      <p className="font-medium">Important:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Your existing {userRole} data will be preserved</li>
                        <li>You can switch back anytime</li>
                        <li>A new {userRole === "stylist" ? "client" : "stylist"} profile will be created</li>
                        <li>The app will reload to apply changes</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleSwitchRole}
                      disabled={switching}
                    >
                      {switching ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Switching...
                        </>
                      ) : (
                        "Yes, switch account type"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Data Export */}
          <Card>
            <CardHeader>
              <CardTitle>Export Your Data</CardTitle>
              <CardDescription>
                Download all your data in JSON format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleExportData} 
                disabled={exporting}
                variant="outline"
                className="w-full"
              >
                {exporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export My Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Restart Tutorial */}
          <Card>
            <CardHeader>
              <CardTitle>Tutorial & Help</CardTitle>
              <CardDescription>
                Restart the onboarding tour to learn about hA.I.r features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => {
                  localStorage.removeItem('onboarding_complete');
                  toast.success("Tutorial reset! Redirecting to dashboard...");
                  setTimeout(() => {
                    navigate("/dashboard");
                    window.location.reload();
                  }, 1000);
                }}
                variant="outline"
                className="w-full"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Restart Tutorial
              </Button>
            </CardContent>
          </Card>

          {/* Delete Account */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers including:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Your profile information</li>
                        <li>All appointments</li>
                        <li>All formulas and history</li>
                        <li>All messages</li>
                        <li>All payment records</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Yes, delete my account"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>

        {/* Sticky Save/Cancel Bar */}
        {hasChanges && (
          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 border-t-4 border-foreground shadow-[0_-4px_0px_0px_hsl(var(--foreground))] z-50">
            <div className="container mx-auto px-4 py-4 max-w-2xl">
              <div className="flex items-center justify-between gap-4 bg-white/95 backdrop-blur-sm p-4 rounded-xl border-2 border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <p className="text-sm font-bold text-foreground">
                    You have unsaved changes
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={handleCancelAll}
                    disabled={saving}
                    className="border-2 border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_hsl(var(--foreground))] transition-all"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="border-2 border-foreground bg-green-400 hover:bg-green-500 text-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_hsl(var(--foreground))] transition-all"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save All Changes'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AccountSettings;