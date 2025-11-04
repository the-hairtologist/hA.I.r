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
import { StandardFormField } from '@/components/forms/StandardFormField';

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
              <StandardFormField
                name="full_name"
                label="Full Name"
                type="text"
                value={formData.full_name}
                onChange={val => setFormData({ ...formData, full_name: String(val) })}
                placeholder="Your full name"
                required
              />

              <StandardFormField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={() => {}}
                disabled
                description="Email cannot be changed here"
              />

              <StandardFormField
                name="phone"
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={val => setFormData({ ...formData, phone: String(val) })}
                placeholder="(555) 123-4567"
              />

              {userRole === 'stylist' && (
                <>
                  <StandardFormField
                    name="business_name"
                    label="Business Name"
                    type="text"
                    value={formData.business_name}
                    onChange={val => setFormData({ ...formData, business_name: String(val) })}
                    placeholder="Your salon or business name"
                  />

                  <StandardFormField
                    name="location"
                    label="Location"
                    type="text"
                    value={formData.location}
                    onChange={val => setFormData({ ...formData, location: String(val) })}
                    placeholder="City, State"
                  />

                  <StandardFormField
                    name="bio"
                    label="Bio"
                    type="textarea"
                    value={formData.bio}
                    onChange={val => setFormData({ ...formData, bio: String(val) })}
                    rows={4}
                    placeholder="Tell clients about yourself and your expertise..."
                    maxLength={500}
                  />
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
