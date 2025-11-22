import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Users, Edit, Trash2 } from 'lucide-react';
import { profilesApi } from '@/db/api';
import type { Profile, UserRole } from '@/types/types';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';

export default function Admin() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      role: 'senior' as UserRole,
    },
  });

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    if (editingProfile) {
      form.reset({
        full_name: editingProfile.full_name,
        email: editingProfile.email || '',
        phone: editingProfile.phone || '',
        role: editingProfile.role,
      });
    }
  }, [editingProfile, form]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await profilesApi.getAll();
      setProfiles(data);
    } catch (error) {
      console.error('Error loading profiles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user profiles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setDialogOpen(true);
  };

  const handleSubmit = async (values: {
    full_name: string;
    email: string;
    phone: string;
    role: UserRole;
  }) => {
    if (!editingProfile) return;

    try {
      await profilesApi.update(editingProfile.id, {
        full_name: values.full_name,
        email: values.email || null,
        phone: values.phone || null,
        role: values.role,
      });

      toast({
        title: 'Success',
        description: 'User profile updated successfully',
      });

      setDialogOpen(false);
      setEditingProfile(null);
      loadProfiles();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user profile',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await profilesApi.delete(id);
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      loadProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'healthcare':
        return 'default';
      case 'caregiver':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const roleStats = {
    admin: profiles.filter(p => p.role === 'admin').length,
    senior: profiles.filter(p => p.role === 'senior').length,
    caregiver: profiles.filter(p => p.role === 'caregiver').length,
    healthcare: profiles.filter(p => p.role === 'healthcare').length,
  };

  return (
    <div className="min-h-screen bg-background p-4 xl:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h1 className="text-3xl xl:text-4xl font-bold text-foreground flex items-center gap-3">
              <Shield className="w-10 h-10 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-senior text-muted-foreground mt-2">
              Manage users and system settings
            </p>
          </div>
          <Link to="/">
            <Button variant="outline" className="btn-senior">
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-senior-lg">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">{profiles.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-senior-lg">Administrators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-destructive">{roleStats.admin}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-senior-lg">Seniors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{roleStats.senior}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-senior-lg">Care Team</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-secondary">
                {roleStats.caregiver + roleStats.healthcare}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-senior-xl flex items-center gap-2">
              <Users className="w-6 h-6" />
              User Management
            </CardTitle>
            <CardDescription className="text-senior">
              View and manage all user accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-senior-lg text-muted-foreground">Loading users...</p>
              </div>
            ) : profiles.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-senior-lg text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="p-6 rounded-lg border bg-card flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-senior-lg font-semibold">{profile.full_name}</h3>
                        <Badge variant={getRoleBadgeVariant(profile.role)} className="text-senior capitalize">
                          {profile.role}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-senior text-muted-foreground">
                        {profile.email && <p>Email: {profile.email}</p>}
                        {profile.phone && <p>Phone: {profile.phone}</p>}
                        <p className="text-sm">
                          Joined: {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="btn-senior"
                        onClick={() => handleEdit(profile)}
                      >
                        <Edit className="w-5 h-5 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        className="btn-senior"
                        onClick={() => handleDelete(profile.id)}
                      >
                        <Trash2 className="w-5 h-5 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-senior-xl">Edit User Profile</DialogTitle>
            <DialogDescription className="text-senior">
              Update user information and role
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="full_name"
                rules={{ required: 'Full name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-senior-lg">Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter full name" className="text-senior" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-senior-lg">Email (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="Enter email" className="text-senior" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-senior-lg">Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" placeholder="Enter phone number" className="text-senior" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-senior-lg">Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-senior">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin" className="text-senior">Administrator</SelectItem>
                        <SelectItem value="senior" className="text-senior">Senior</SelectItem>
                        <SelectItem value="caregiver" className="text-senior">Caregiver</SelectItem>
                        <SelectItem value="healthcare" className="text-senior">Healthcare Professional</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button type="submit" className="btn-senior flex-1">
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="btn-senior flex-1"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
