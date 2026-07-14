import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  clientSchema,
  type ClientFormValues,
} from '../../lib/schemas/clientSchemas';
import {
  createClient,
  updateClient,
  type Client,
  type ClientPayload,
} from '../../lib/api/clients';
import { getProviders } from '../../lib/api/providers';
import { ApiError } from '../../lib/api';
import { Modal } from '../Modal/Modal';
import { Input } from '../Input/Input';
import { Select } from '../Select/Select';
import { Button } from '../Button/Button';

interface ClientFormModalProps {
  open: boolean;
  onClose: () => void;
  client?: Client | null;
}

export function ClientFormModal({
  open,
  onClose,
  client,
}: ClientFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(client);

  const { data: providers } = useQuery({
    queryKey: ['providers'],
    queryFn: getProviders,
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      login: '',
      password: '',
      provider_id: '',
      provider_login_name: '',
      status: 'active',
      low_balance_threshold: '',
    },
  });

  useEffect(() => {
    if (client) {
      reset({
        name: client.name ?? '',
        email: client.email ?? '',
        phone: client.phone,
        login: client.login,
        password: '',
        provider_id: String(client.provider_id),
        provider_login_name: client.provider_login_name,
        status: client.status,
        low_balance_threshold:
          client.low_balance_threshold != null
            ? String(client.low_balance_threshold)
            : '',
      });
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        login: '',
        password: '',
        provider_id: '',
        provider_login_name: '',
        status: 'active',
        low_balance_threshold: '',
      });
    }
  }, [client, reset, open]);

  const mutation = useMutation({
    mutationFn: (values: ClientFormValues) => {
      const payload: ClientPayload = {
        name: values.name ? values.name : undefined,
        email: values.email ? values.email : undefined,
        phone: values.phone,
        login: values.login,
        provider_id: Number(values.provider_id),
        provider_login_name: values.provider_login_name,
        status: values.status,
        low_balance_threshold: values.low_balance_threshold
          ? Number(values.low_balance_threshold)
          : undefined,
      };

      if (values.password) {
        payload.password = values.password;
      }

      return isEditing
        ? updateClient(client!.id, payload)
        : createClient(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success(isEditing ? 'Client updated.' : 'Client created.');
      onClose();
    },
    onError: (error) => {
      if (error instanceof ApiError && error.errors) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          setError(field as keyof ClientFormValues, { message: messages[0] });
        });
      } else {
        toast.error(
          error instanceof ApiError ? error.message : 'Something went wrong.',
        );
      }
    },
  });

  const providerOptions =
    providers?.map((p) => ({ value: String(p.id), label: p.name })) ?? [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? `Edit ${client?.name ?? client?.login}` : 'Add Client'}
      size='lg'
      footer={
        <>
          <Button
            variant='secondary'
            onClick={onClose}
            disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit((values) => mutation.mutate(values))}
            loading={mutation.isPending}>
            {isEditing ? 'Save Changes' : 'Create Client'}
          </Button>
        </>
      }>
      <form className='space-y-4'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <Input
            label='Name'
            placeholder='Optional'
            hint='Falls back to login/phone if left blank.'
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label='Email'
            placeholder='Optional'
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <Input
            label='Phone'
            placeholder='254791381097'
            hint='Format: 254XXXXXXXXX — used for STK push.'
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            label='Login'
            placeholder="Client's login username"
            error={errors.login?.message}
            {...register('login')}
          />
        </div>

        <Input
          label={isEditing ? 'New Password' : 'Password'}
          type='password'
          placeholder={isEditing ? 'Leave blank to keep current password' : ''}
          error={errors.password?.message}
          {...register('password')}
        />

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <Select
            label='Provider'
            placeholder='Select a provider'
            options={providerOptions}
            error={errors.provider_id?.message}
            {...register('provider_id')}
          />
          <Input
            label='Provider Login Name'
            placeholder="Exact username on the provider's platform"
            hint='Must match character-for-character.'
            error={errors.provider_login_name?.message}
            {...register('provider_login_name')}
          />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <Select
            label='Status'
            options={[
              { value: 'active', label: 'Active' },
              { value: 'suspended', label: 'Suspended' },
            ]}
            {...register('status')}
          />
          <Input
            label='Low Balance Threshold'
            type='number'
            placeholder='Optional'
            error={errors.low_balance_threshold?.message}
            {...register('low_balance_threshold')}
          />
        </div>
      </form>
    </Modal>
  );
}
