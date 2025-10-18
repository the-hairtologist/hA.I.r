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
import { useEnhancedAuth } from "@/contexts/EnhancedAuthContext";
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
  const { user, isAdmin, loading } = useEnhancedAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Redirect non-admins
  if (!loading && (!user || !isAdmin)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading while checking permissions
  if (loading) {
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
            <h1 className="text-3xl font-pixel flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              User Management
            </h1>
            <p className="font-sans text-muted-foreground">Manage all platform users</p>
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
                <Search className="absolute left-3 top-3 h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
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
                    <Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg sm:text-xl">All Users ({filteredUsers.length})</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Complete user directory with management controls</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                className="gap-2 w-full sm:w-auto"
              >
                <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                {selectedUsers.size === filteredUsers.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-3 sm:p-4 border-2 border-foreground rounded-lg hover:bg-muted/50 transition-colors ${
                    selectedUsers.has(user.id) ? 'bg-primary/5 border-primary' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="mt-1 h-5 w-5 min-w-[20px]"
                    />
                    <div className="flex-1 min-w-0">
                      {/* Mobile Layout: Stack everything */}
                      <div className="flex flex-col gap-3">
                        {/* User info */}
                        <div>
                          <p className="font-semibold text-base sm:text-lg truncate">{user.full_name || 'Unknown'}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>
                        
                        {/* Roles and date */}
                        <div className="flex flex-wrap items-center gap-2">
                          {user.user_roles?.map((ur: any) => (
                            <Badge key={ur.role} variant="secondary" className="text-xs">
                              {ur.role}
                            </Badge>
                          ))}
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            Joined {format(new Date(user.created_at), 'PP')}
                          </span>
                        </div>

                        {/* Actions - Full width on mobile */}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedUser(user)}
                                className="w-full sm:w-auto justify-center"
                              >
                                <Eye className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>User Details</DialogTitle>
                                <DialogDescription>
                                  Complete information for {selectedUser?.full_name}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedUser && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Full Name</p>
                                      <p className="text-sm sm:text-base break-words">{selectedUser.full_name || 'Not set'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Email</p>
                                      <p className="text-sm sm:text-base break-all">{selectedUser.email}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">User ID</p>
                                      <p className="text-xs font-mono break-all">{selectedUser.id}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Joined</p>
                                      <p className="text-xs sm:text-sm">{format(new Date(selectedUser.created_at), 'PPp')}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Roles</p>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedUser.user_roles?.map((ur: any) => (
                                        <Badge key={ur.role} className="text-xs">{ur.role}</Badge>
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
                            <SelectTrigger className="w-full sm:w-[140px]">
                              <UserCog className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
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
