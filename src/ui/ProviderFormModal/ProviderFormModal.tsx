import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  createProvider,
  updateProvider,
  type Provider,
} from '../../lib/api/providers';
import { ApiError } from '../../lib/api';
import { Modal } from '../Modal/Modal';
import { Input } from '../Input/Input';
import { Select } from '../Select/Select';
import { Button } from '../Button/Button';
import { Textarea } from '../TextArea/TextArea';
import {
  providerSchema,
  type ProviderFormValues,
} from '../../lib/schemas/providerSchemas';

interface ProviderFormModalProps {
  open: boolean;
  onClose: () => void;
  provider?: Provider | null;
}

export function ProviderFormModal({
  open,
  onClose,
  provider,
}: ProviderFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(provider);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema),
    defaultValues: { status: 'active', credentials: '{\n  \n}' },
  });

  useEffect(() => {
    if (provider) {
      reset({
        name: provider.name,
        slug: provider.slug,
        base_url: provider.base_url,
        status: provider.status,
        credentials: '{\n  \n}', // never pre-filled — backend never sends real credentials back
      });
    } else {
      reset({
        name: '',
        slug: '',
        base_url: '',
        status: 'active',
        credentials: '{\n  \n}',
      });
    }
  }, [provider, reset, open]);

  const mutation = useMutation({
    mutationFn: (values: ProviderFormValues) => {
      const payload = {
        ...values,
        credentials: JSON.parse(values.credentials),
      };
      return isEditing
        ? updateProvider(provider!.id, payload)
        : createProvider(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      toast.success(isEditing ? 'Provider updated.' : 'Provider created.');
      onClose();
    },
    onError: (error) => {
      if (error instanceof ApiError && error.errors) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          setError(field as keyof ProviderFormValues, { message: messages[0] });
        });
      } else {
        toast.error(
          error instanceof ApiError ? error.message : 'Something went wrong.',
        );
      }
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? `Edit ${provider?.name}` : 'Add Provider'}
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
            {isEditing ? 'Save Changes' : 'Create Provider'}
          </Button>
        </>
      }>
      <form className='space-y-4'>
        <Input
          label='Name'
          placeholder='Zettatel'
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label='Slug'
          placeholder='zettatel'
          hint='Used internally to resolve the provider driver — lowercase, no spaces.'
          error={errors.slug?.message}
          {...register('slug')}
        />
        <Input
          label='Base URL'
          placeholder='https://portal.zettatel.com/SMSApi'
          error={errors.base_url?.message}
          {...register('base_url')}
        />
        <Select
          label='Status'
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
          {...register('status')}
        />
        <Textarea
          label='Credentials (JSON)'
          hint={
            isEditing
              ? 'Leave as-is to keep existing credentials, or overwrite with new values.'
              : 'e.g. { "userId": "...", "password": "..." } or { "apikey": "...", "partnerID": "..." }'
          }
          error={errors.credentials?.message}
          {...register('credentials')}
        />
      </form>
    </Modal>
  );
}
