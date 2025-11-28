import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, Camera } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useState } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { PageHeader } from '@/components/PageHeader';

const Profile = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { roles } = useUserRole(session?.user?.id);
  const userRole = roles?.[0];

  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user?.id || '')
        .maybeSingle();
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: stylistProfile } = useQuery({
    queryKey: ['stylist-profile', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('stylist_profiles')
        .select('*')
        .eq('user_id', session?.user?.id || '')
        .maybeSingle();
      return data;
    },
    enabled: !!session?.user?.id && userRole === 'stylist',
  });

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    bio: stylistProfile?.bio || '',
    business_name: stylistProfile?.business_name || '',
    location: stylistProfile?.location || '',
  });

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      // Update basic profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          phone: data.phone,
        })
        .eq('id', session?.user?.id || '');

      if (profileError) throw profileError;

      // Update stylist profile if stylist
      if (userRole === 'stylist' && stylistProfile) {
        const { error: stylistError } = await supabase
          .from('stylist_profiles')
          .update({
            bio: data.bio,
            business_name: data.business_name,
            location: data.location,
          })
          .eq('user_id', session?.user?.id || '');

        if (stylistError) throw stylistError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['stylist-profile'] });
      toast.success('Profile updated successfully');
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="My Profile"
        icon={<User className="h-6 w-6" />}
        backTo="/dashboard"
      />
      <div className="space-y-6 max-w-3xl px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="text-xl sm:text-2xl md:text-3xl font-pixel">
                {profile?.full_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
              <p className="text-xs sm:text-sm font-sans text-muted-foreground mt-2">
                JPG, GIF or PNG. Max size 2MB
              </p>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={e =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="pl-9"
                  />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Email cannot be changed here
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={e =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="pl-9"
                  />
                </div>
              </div>

              {userRole === 'stylist' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="business_name">Business Name</Label>
                    <Input
                      id="business_name"
                      value={formData.business_name}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          business_name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={e =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={e =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      rows={4}
                      placeholder="Tell clients about yourself and your expertise..."
                    />
                  </div>
                </>
              )}

              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
