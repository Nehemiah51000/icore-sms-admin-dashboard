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

function defaultValuesFor(client?: Client | null): ClientFormValues {
  if (!client) {
    return {
      name: '',
      email: '',
      phone: '',
      login: '',
      password: '',
      provider_id: '',
      provider_login_name: '',
      status: 'active',
      low_balance_threshold: '',
    };
  }
  return {
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
  };
}

interface ClientFormProps {
  onClose: () => void;
  client?: Client | null;
}

/**
 * Owns all form state. Only ever mounted while the modal is open (see
 * ClientFormModal below), keyed by client id — every open gets a fresh
 * instance with correctly-derived initial values via defaultValuesFor().
 * No useEffect needed to "sync" values after the fact.
 */
function ClientForm({ onClose, client }: ClientFormProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(client);
  const { data: providers } = useQuery({
    queryKey: ['providers'],
    queryFn: getProviders,
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: defaultValuesFor(client),
  });

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
      if (values.password) payload.password = values.password;
      return isEditing
        ? updateClient(client!.id, payload)
        : createClient(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success(
        isEditing ? 'Client updated successfully.' : 'New client created.',
      );
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
    <div className='flex flex-col'>
      <form className='space-y-5 max-h-[65vh] overflow-y-auto px-1'>
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
            hint='What the client types to sign in — separate from their display name.'
            error={errors.login?.message}
            autoComplete='off'
            {...register('login')}
          />
        </div>

        <Input
          label={isEditing ? 'New Password' : 'Password'}
          type='password'
          placeholder={isEditing ? 'Leave blank to keep current password' : ''}
          error={errors.password?.message}
          autoComplete='new-password'
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
            autoComplete='off'
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

      <div className='flex flex-col-reverse sm:flex-row items-center justify-end gap-3 -mx-6 -mb-5 mt-6 px-6 py-4 border-t border-border-main bg-bg-base/30'>
        <Button
          variant='secondary'
          onClick={onClose}
          disabled={mutation.isPending}
          fullWidth
          className='sm:w-auto'>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit((values) => mutation.mutate(values))}
          loading={mutation.isPending}
          fullWidth
          className='sm:w-auto'>
          {isEditing ? 'Save Changes' : 'Create Client'}
        </Button>
      </div>
    </div>
  );
}

export function ClientFormModal({
  open,
  onClose,
  client,
}: ClientFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={client ? `Edit ${client.name ?? client.login}` : 'Add New Client'}
      size='lg'>
      {open && (
        <ClientForm
          key={client?.id ?? 'new'}
          onClose={onClose}
          client={client}
        />
      )}
    </Modal>
  );
}
