import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Search, Eye, Shield, Ban, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
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
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);

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

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'stylist' | 'client', oldRole: string) => {
    try {
      // Type assert oldRole to match the app_role enum
      const typedOldRole = oldRole as 'admin' | 'stylist' | 'client';
      
      // Remove old role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', typedOldRole);

      // Add new role
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: newRole }]);

      if (error) throw error;

      toast.success('User role updated');
      loadUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || 
                       user.user_roles?.some((ur: any) => ur.role === filterRole);
    return matchesSearch && matchesRole;
  });

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

        {/* Filters */}
        <Card className="border-4 border-foreground shadow-brutal">
          <CardContent className="pt-6">
            <div className="flex gap-4">
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
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="border-4 border-foreground shadow-brutal">
          <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
            <CardDescription>Complete user directory with management controls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-4 border-2 border-foreground rounded-lg hover:bg-muted/50 transition-colors"
                >
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
                            View Details
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
