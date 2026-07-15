import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getProfile, updateProfile, updatePassword } from '../lib/api/profile';
import { ApiError } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { Input } from '../ui/Input/Input';
import { Button } from '../ui/Button/Button';
import { Card, CardHeader, CardBody } from '../ui/Card/Card';

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
      toast.success('Profile updated.');
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
    <div className='space-y-4'>
      <Input
        label='Name'
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />
      <Input
        label='Email'
        type='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <div className='flex justify-end'>
        <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>
          Save Profile
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
      toast.success('Password updated.');
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
    <div className='space-y-4'>
      <Input
        label='Current Password'
        type='password'
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        error={errors.current_password}
      />
      <Input
        label='New Password'
        type='password'
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        error={errors.new_password}
      />
      <Input
        label='Confirm New Password'
        type='password'
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <div className='flex justify-end'>
        <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>
          Update Password
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
    <div className='max-w-2xl space-y-6'>
      <div>
        <h1 className='text-xl font-semibold text-text-main'>Settings</h1>
        <p className='text-sm text-text-muted mt-0.5'>
          Manage your admin account details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <span className='text-sm font-semibold text-text-main'>Profile</span>
        </CardHeader>
        <CardBody>
          {isLoading || !data ? (
            <div className='space-y-3'>
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className='h-10 rounded bg-bg-base animate-pulse'
                />
              ))}
            </div>
          ) : (
            <ProfileForm key={data.id} initial={data} />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <span className='text-sm font-semibold text-text-main'>Password</span>
        </CardHeader>
        <CardBody>
          <PasswordForm />
        </CardBody>
      </Card>
    </div>
  );
}
