import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Navigation } from "@/components/Navigation";
import { Settings, ArrowLeft, Download, Trash2, Loader2, FileDown } from "lucide-react";
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
  const [savingGender, setSavingGender] = useState(false);
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

  const handleSaveAvatar = async () => {
    setSavingGender(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("profiles")
        .update({ gender: selectedGender })
        .eq("id", session.user.id);

      if (error) throw error;

      setGender(selectedGender);
      setHasChanges(false);
      toast.success("Avatar saved successfully!");
    } catch (error: any) {
      console.error("Error updating gender:", error);
      toast.error("Error updating avatar");
    } finally {
      setSavingGender(false);
    }
  };

  const handleCancelAvatar = () => {
    setSelectedGender(gender);
    setHasChanges(false);
    toast.info("Changes cancelled");
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
      <Navigation userRole={userRole || undefined} />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
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
                  <Select value={selectedGender} onValueChange={handleGenderChange} disabled={savingGender}>
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
              
              {hasChanges && (
                <div className="flex gap-3 pt-2">
                  <Button 
                    onClick={handleSaveAvatar} 
                    disabled={savingGender}
                    className="flex-1 border-2 border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_hsl(var(--foreground))] transition-all"
                  >
                    {savingGender ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Avatar'
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleCancelAvatar}
                    disabled={savingGender}
                    className="flex-1 border-2 border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_hsl(var(--foreground))] transition-all"
                  >
                    Cancel
                  </Button>
                </div>
              )}
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
      </main>
    </div>
  );
};

export default AccountSettings;