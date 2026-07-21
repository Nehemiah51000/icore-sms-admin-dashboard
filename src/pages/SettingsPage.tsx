import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, ShieldCheck, Save, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { getProfile, updateProfile, updatePassword } from '../lib/api/profile';
import { ApiError } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { Input } from '../ui/Input/Input';
import { Button } from '../ui/Button/Button';
import { Card, CardHeader, CardBody } from '../ui/Card/Card';
import { StatusBadge } from '../ui/StatusBadge/StatusBadge';

interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
}

function ProfileForm({ initial }: { initial: Admin }) {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () => updateProfile({ name, email }),
    onSuccess: (admin) => {
      if (token) setAuth(admin, token);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully.');
    },
    onError: (error) => {
      if (error instanceof ApiError && error.errors) {
        const flat: Record<string, string> = {};
        Object.entries(error.errors).forEach(([f, m]) => (flat[f] = m[0]));
        setErrors(flat);
      } else {
        toast.error(
          error instanceof ApiError
            ? error.message
            : 'Could not update profile.',
        );
      }
    },
  });

  return (
    <div className='space-y-5'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <Input
          label='Full Name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          placeholder='John Doe'
        />
        <Input
          label='Email Address'
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder='admin@icoresystems.co.ke'
        />
      </div>

      <div className='pt-2 flex items-center justify-between border-t border-border-main/50'>
        <p className='text-xs text-text-muted'>
          Your email address is used for administrative logins and system
          notifications.
        </p>
        <Button
          onClick={() => mutation.mutate()}
          loading={mutation.isPending}
          className='hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xs shrink-0'>
          <Save className='h-4 w-4 mr-1.5' /> Save Changes
        </Button>
      </div>
    </div>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () =>
      updatePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      }),
    onSuccess: () => {
      toast.success('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    },
    onError: (error) => {
      if (error instanceof ApiError && error.errors) {
        const flat: Record<string, string> = {};
        Object.entries(error.errors).forEach(([f, m]) => (flat[f] = m[0]));
        setErrors(flat);
      } else {
        toast.error(
          error instanceof ApiError
            ? error.message
            : 'Could not update password.',
        );
      }
    },
  });

  return (
    <div className='space-y-5'>
      <Input
        label='Current Password'
        type='password'
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        error={errors.current_password}
        placeholder='••••••••'
      />

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <Input
          label='New Password'
          type='password'
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={errors.new_password}
          placeholder='••••••••'
        />
        <Input
          label='Confirm New Password'
          type='password'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder='••••••••'
        />
      </div>

      <div className='pt-2 flex items-center justify-between border-t border-border-main/50'>
        <p className='text-xs text-text-muted'>
          Ensure your password is at least 8 characters long and contains mixed
          symbols.
        </p>
        <Button
          onClick={() => mutation.mutate()}
          loading={mutation.isPending}
          variant='secondary'
          className='hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xs shrink-0'>
          <Lock className='h-4 w-4 mr-1.5' /> Update Password
        </Button>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  return (
    <div className='max-w-3xl mx-auto space-y-6 animate-page-in'>
      {/* Page Header Banner */}
      <div className='bg-bg-surface border border-border-main/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-xl font-bold text-text-main tracking-tight'>
            Account Settings
          </h1>
          <p className='text-xs text-text-muted mt-1'>
            Manage your administrator profile details and security credentials.
          </p>
        </div>

        {data && (
          <div className='flex items-center gap-3 bg-bg-base/80 border border-border-main/60 px-3.5 py-2 rounded-xl shrink-0'>
            <div className='h-9 w-9 rounded-lg bg-navy-500 text-white flex items-center justify-center font-bold text-sm shadow-xs'>
              {data.name.charAt(0).toUpperCase()}
            </div>
            <div className='text-left'>
              <p className='text-xs font-semibold text-text-main leading-tight'>
                {data.name}
              </p>
              <div className='flex items-center gap-1.5 mt-0.5 '>
                <StatusBadge status='info' size='sm' className='text-text-main'>
                  {data.role || 'Admin'}
                </StatusBadge>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <Card className='shadow-xs border-border-main overflow-hidden'>
        <CardHeader className='bg-bg-base/40 border-b border-border-main/60 px-6 py-4 flex items-center gap-2.5'>
          <div className='p-2 rounded-lg bg-navy-500/10 text-navy-500 dark:text-navy-300'>
            <User className='h-4 w-4 text-text-main' />
          </div>
          <div>
            <h2 className='text-sm font-bold text-text-main'>
              Personal Information
            </h2>
            <p className='text-[11px] text-text-muted'>
              Update your display name and administrative contact address
            </p>
          </div>
        </CardHeader>

        <CardBody className='p-6'>
          {isLoading || !data ? (
            <div className='space-y-4'>
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className='h-10 rounded-xl bg-bg-base animate-pulse'
                />
              ))}
            </div>
          ) : (
            <ProfileForm key={data.id} initial={data} />
          )}
        </CardBody>
      </Card>

      {/* Password & Security Card */}
      <Card className='shadow-xs border-border-main overflow-hidden'>
        <CardHeader className='bg-bg-base/40 border-b border-border-main/60 px-6 py-4 flex items-center gap-2.5'>
          <div className='p-2 rounded-lg bg-navy-500/10 text-navy-500 dark:text-navy-300'>
            <ShieldCheck className='h-4 w-4 text-text-main' />
          </div>
          <div>
            <h2 className='text-sm font-bold text-text-main'>
              Security & Authentication
            </h2>
            <p className='text-[11px] text-text-muted'>
              Change your account password to maintain system security
            </p>
          </div>
        </CardHeader>

        <CardBody className='p-6'>
          <PasswordForm />
        </CardBody>
      </Card>
    </div>
  );
}
