import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { loginSchema, type LoginFormValues } from '../lib/schemas/authSchemas';
import { loginAdmin } from '../lib/api/auth';
import { useAuthStore } from '../stores/authStore';
import { ApiError } from '../lib/api';
import { Button } from '../ui/Button/Button';
import { Card, CardBody } from '../ui/Card/Card';
import { Input } from '../ui/Input/Input';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: (values: LoginFormValues) =>
      loginAdmin(values.email, values.password),
    onSuccess: (data) => {
      setAuth(data.admin, data.token);
      toast.success(`Welcome back, ${data.admin.name}.`);
      navigate('/');
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.errors) {
          // Field-specific validation errors from Laravel
          Object.entries(error.errors).forEach(([field, messages]) => {
            setError(field as keyof LoginFormValues, { message: messages[0] });
          });
        } else {
          // Invalid credentials, or anything else without a field breakdown
          setError('email', { message: error.message });
        }
      } else {
        toast.error('Could not reach the server. Please try again.');
      }
    },
  });

  function onSubmit(values: LoginFormValues) {
    mutation.mutate(values);
  }

  return (
    <div className='min-h-screen bg-bg-base flex items-center justify-center p-4'>
      <div className='w-full max-w-sm'>
        <div className='flex flex-col items-center gap-2 mb-6'>
          <img
            src='/ic_frame_2.svg'
            alt='ICORE'
            className='h-12 w-12 rounded-xl'
          />
          <h1 className='text-lg font-semibold text-text-main'>
            ICORE SMS Admin
          </h1>
          <p className='text-xs text-text-muted'>
            Sign in to manage clients and providers
          </p>
        </div>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <Input
                label='Email'
                type='email'
                placeholder='you@icoresystems.co.ke'
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label='Password'
                type='password'
                placeholder='••••••••'
                error={errors.password?.message}
                {...register('password')}
              />
              <Button type='submit' fullWidth loading={mutation.isPending}>
                Sign In
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
