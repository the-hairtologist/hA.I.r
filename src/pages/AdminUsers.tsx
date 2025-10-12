import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Search, Eye, Shield, Ban, Mail, Calendar, Trash2, UserCog } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminUsers() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole(user?.id);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Redirect non-admins
  if (!authLoading && !roleLoading && (!user || !isAdmin)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading while checking permissions
  if (authLoading || roleLoading) {
    return <LoadingSpinner message="Verifying access..." />;
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || 
                       user.user_roles?.some((ur: any) => ur.role === filterRole);
    return matchesSearch && matchesRole;
  });

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const selectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedUsers.size} user(s)? This action cannot be undone.`
    );

    if (!confirmed) return;

    setBulkActionLoading(true);
    try {
      // Note: This would need proper backend implementation with cascading deletes
      toast.info("Bulk delete is a critical operation. Contact system administrator.");
      
      // In production, you'd call an edge function:
      // const { error } = await supabase.functions.invoke('admin-bulk-delete-users', {
      //   body: { userIds: Array.from(selectedUsers) }
      // });
    } catch (error) {
      console.error("Error deleting users:", error);
      toast.error("Failed to delete users");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleAssignRole = async (userId: string, role: 'client' | 'stylist') => {
    try {
      const { error } = await supabase.rpc('assign_user_role', {
        _user_id: userId,
        _role: role as any
      });

      if (error) throw error;

      toast.success(`Role ${role} assigned successfully`);
      loadUsers();
    } catch (error: any) {
      console.error("Error assigning role:", error);
      toast.error(error.message || "Failed to assign role");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              User Management
            </h1>
            <p className="text-muted-foreground">Manage all platform users</p>
          </div>
          <Badge className="bg-warning text-warning-foreground border-2 border-foreground">
            ADMIN ACCESS
          </Badge>
        </div>

        {/* Filters & Bulk Actions */}
        <Card className="border-4 border-foreground shadow-brutal">
          <CardContent className="pt-6">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="stylist">Stylists</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedUsers.size > 0 && (
              <div className="flex items-center justify-between p-3 bg-primary/10 border-2 border-primary rounded-lg">
                <span className="text-sm font-medium">
                  {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={bulkActionLoading}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedUsers(new Set())}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="border-4 border-foreground shadow-brutal">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Users ({filteredUsers.length})</CardTitle>
                <CardDescription>Complete user directory with management controls</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                {selectedUsers.size === filteredUsers.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-4 border-2 border-foreground rounded-lg hover:bg-muted/50 transition-colors ${
                    selectedUsers.has(user.id) ? 'bg-primary/5 border-primary' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="mt-1 h-5 w-5"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex flex-col">
                          <p className="font-semibold text-lg">{user.full_name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        {user.user_roles?.map((ur: any) => (
                          <Badge key={ur.role} variant="secondary">
                            {ur.role}
                          </Badge>
                        ))}
                        <span className="text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          Joined {format(new Date(user.created_at), 'PP')}
                        </span>
                      </div>
                    </div>

                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>User Details</DialogTitle>
                            <DialogDescription>
                              Complete information for {selectedUser?.full_name}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedUser && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                                  <p className="text-lg">{selectedUser.full_name || 'Not set'}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                                  <p className="text-lg">{selectedUser.email}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">User ID</p>
                                  <p className="text-sm font-mono">{selectedUser.id}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Joined</p>
                                  <p className="text-sm">{format(new Date(selectedUser.created_at), 'PPp')}</p>
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Roles</p>
                                <div className="flex gap-2">
                                  {selectedUser.user_roles?.map((ur: any) => (
                                    <Badge key={ur.role}>{ur.role}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                        </Dialog>
                        
                        <Select
                          onValueChange={(role) => handleAssignRole(user.id, role as 'client' | 'stylist')}
                        >
                          <SelectTrigger className="w-[140px]">
                            <UserCog className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Add Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="client">Client</SelectItem>
                            <SelectItem value="stylist">Stylist</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
