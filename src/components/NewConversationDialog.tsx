import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { MessageSquare, User, Loader2, Search } from "lucide-react";

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: string;
  onConversationStarted: (partnerId: string) => void;
}

export const NewConversationDialog = ({ open, onOpenChange, userRole, onConversationStarted }: NewConversationDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open, userRole]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get list of potential chat partners based on role
      if (userRole === "stylist") {
        // Stylists can message their clients
        // Get stylist profile first
        const { data: stylistProfile } = await supabase
          .from("stylist_profiles")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (!stylistProfile) {
          setUsers([]);
          return;
        }

        const { data: appointments } = await supabase
          .from("appointments")
          .select(`
            client:client_profiles(
              id,
              user_id,
              user:profiles(id, full_name, email)
            )
          `)
          .eq("stylist_id", stylistProfile.id);

        const uniqueClients = Array.from(
          new Map(
            appointments?.map(apt => [apt.client.user_id, apt.client.user]) || []
          ).values()
        );
        setUsers(uniqueClients);
      } else {
        // Clients can message stylists
        const { data: stylistProfiles } = await supabase
          .from("stylist_profiles")
          .select(`
            id,
            user_id,
            business_name,
            user:profiles(id, full_name, email)
          `);

        setUsers(stylistProfiles?.map(s => s.user) || []);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartConversation = (userId: string) => {
    onConversationStarted(userId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Select someone to start chatting with
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[min(60vh,400px)] overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleStartConversation(user.id)}
                >
                  <Avatar>
                    <AvatarFallback>
                      <User className="h-5 w-5 sm:h-6 sm:w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {user.full_name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};