import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const expired = searchParams.get('expired') === '1';

  useEffect(() => {
    if (expired) {
      toast.error('Your session has expired. Please sign in again.');
    }
  }, [expired]);

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
          Object.entries(error.errors).forEach(([field, messages]) => {
            setError(field as keyof LoginFormValues, { message: messages[0] });
          });
        } else {
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
    <div className='min-h-screen bg-bg-base flex items-center justify-center p-6 selection:bg-navy-500 selection:text-white'>
      <div className='w-full max-w-md space-y-6 animate-page-in'>
        <div className='flex flex-col items-center text-center gap-3'>
          <div className='px-6 py-4 sm:px-8 sm:py-5 rounded-2xl bg-white border border-border-main/80 shadow-sm hover:scale-102 transition-all flex items-center justify-center'>
            <img
              src='/ICORE_logo_last_iteration.svg'
              alt='ICORE Information Systems Ltd'
              className='w-52 sm:w-64 h-auto max-h-20 object-contain [image-rendering:-webkit-optimize-contrast]'
            />
          </div>
          <div>
            <h1 className='text-xl font-bold tracking-tight text-text-main'>
              ICORE SMS Admin Portal
            </h1>
            <p className='text-xs text-text-muted mt-1'>
              Sign in to manage SMS clients & provider instances
            </p>
          </div>
        </div>

        <Card className='shadow-lg border-border-main/80'>
          <CardBody className='p-6 sm:p-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <Input
                label='Email Address'
                type='email'
                placeholder='admin@icoresystems.co.ke'
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
              <Button
                type='submit'
                fullWidth
                loading={mutation.isPending}
                className='mt-2 shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-transform'>
                Sign In to Dashboard
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
