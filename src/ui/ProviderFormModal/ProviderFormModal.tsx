import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createProvider,
  updateProvider,
  type Provider,
} from '../../lib/api/providers';
import { getFieldsForSlug } from '../../lib/providerFieldRegistry';
import { ApiError } from '../../lib/api';
import { Modal } from '../Modal/Modal';
import { Input } from '../Input/Input';
import { Select } from '../Select/Select';
import { Button } from '../Button/Button';
import { Textarea } from '../TextArea/TextArea';

interface ProviderFormModalProps {
  open: boolean;
  onClose: () => void;
  provider?: Provider | null;
}

const PROVIDER_OPTIONS = [
  { value: 'zettatel', label: 'Zettatel' },
  { value: 'hostpinnacle', label: 'HostPinnacle' },
  { value: 'advanta', label: 'Advanta' },
  { value: 'other', label: 'Other (advanced — raw JSON)' },
];

interface FormState {
  name: string;
  slug: string;
  base_url: string;
  status: 'active' | 'inactive';
}

interface ProviderFormProps {
  onClose: () => void;
  provider?: Provider | null;
}

function ProviderForm({ onClose, provider }: ProviderFormProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(provider);
  const [form, setForm] = useState<FormState>(
    provider
      ? {
          name: provider.name,
          slug: provider.slug,
          base_url: provider.base_url,
          status: provider.status,
        }
      : { name: '', slug: '', base_url: '', status: 'active' },
  );
  const [credentialValues, setCredentialValues] = useState<
    Record<string, string>
  >({});
  const [rawJson, setRawJson] = useState('{\n  \n}');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fields = getFieldsForSlug(form.slug);
  const isKnownProvider = fields !== null;

  const mutation = useMutation({
    mutationFn: () => {
      let credentials: Record<string, string>;
      if (isKnownProvider) {
        credentials = credentialValues;
      } else {
        credentials = JSON.parse(rawJson);
      }
      const payload = { ...form, credentials };
      return isEditing
        ? updateProvider(provider!.id, payload)
        : createProvider(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      toast.success(
        isEditing
          ? 'Provider details modified.'
          : 'Successfully created provider.',
      );
      onClose();
    },
    onError: (error) => {
      if (error instanceof ApiError && error.errors) {
        const flat: Record<string, string> = {};
        Object.entries(error.errors).forEach(([field, messages]) => {
          flat[field] = messages[0];
        });
        setErrors(flat);
      } else {
        toast.error(
          error instanceof ApiError ? error.message : 'Something went wrong.',
        );
      }
    },
  });

  function handleSubmit() {
    const nextErrors: Record<string, string> = {};
    if (!form.name) nextErrors.name = 'Name is required';
    if (!form.slug) nextErrors.slug = 'Select a provider type';
    if (!form.base_url) nextErrors.base_url = 'Base URL is required';
    if (isKnownProvider) {
      fields!.forEach((f) => {
        if (f.required && !credentialValues[f.key]) {
          nextErrors[f.key] = `${f.label} is required`;
        }
      });
    } else {
      try {
        JSON.parse(rawJson);
      } catch {
        nextErrors.credentials = 'Must be valid JSON';
      }
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) mutation.mutate();
  }

  return (
    <div className='flex flex-col h-full'>
      <form className='space-y-5 max-h-[60vh] overflow-y-auto px-1 scrollbar-thin'>
        <Input
          label='Display Name'
          placeholder='e.g. Zettatel Core'
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
        />
        <Select
          label='Provider Type'
          placeholder='Select provider type'
          options={PROVIDER_OPTIONS}
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          error={errors.slug}
          hint='Determines custom parameters required below.'
        />
        <Input
          label='Base URL'
          placeholder='https://portal.zettatel.com/SMSApi'
          value={form.base_url}
          onChange={(e) => setForm({ ...form, base_url: e.target.value })}
          error={errors.base_url}
        />
        <Select
          label='Status'
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
          value={form.status}
          onChange={(e) =>
            setForm({
              ...form,
              status: e.target.value as 'active' | 'inactive',
            })
          }
        />
        {form.slug && (
          <div className='border-t border-border-main pt-5 mt-5'>
            <p className='text-xs font-bold uppercase tracking-wider text-text-muted mb-4'>
              Custom Provider Credentials
            </p>
            {isKnownProvider ? (
              <div className='space-y-4'>
                {isEditing && (
                  <p className='text-xs text-text-muted -mt-2 mb-2'>
                    Leave fields blank to keep existing encrypted values.
                  </p>
                )}
                {fields!.map((field) => (
                  <Input
                    key={field.key}
                    label={field.label}
                    type={field.type}
                    placeholder={field.placeholder}
                    hint={field.hint}
                    value={credentialValues[field.key] ?? ''}
                    onChange={(e) =>
                      setCredentialValues({
                        ...credentialValues,
                        [field.key]: e.target.value,
                      })
                    }
                    error={errors[field.key]}
                  />
                ))}
              </div>
            ) : (
              <Textarea
                label='Raw JSON Credentials'
                hint='Raw JSON configuration is active for custom providers.'
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                error={errors.credentials}
              />
            )}
          </div>
        )}
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
          onClick={handleSubmit}
          loading={mutation.isPending}
          fullWidth
          className='sm:w-auto'>
          {isEditing ? 'Save Changes' : 'Create Provider'}
        </Button>
      </div>
    </div>
  );
}

export function ProviderFormModal({
  open,
  onClose,
  provider,
}: ProviderFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={provider ? `Edit ${provider.name}` : 'Add New Provider'}
      size='lg'>
      {open && (
        <ProviderForm
          key={provider?.id ?? 'new'}
          onClose={onClose}
          provider={provider}
        />
      )}
    </Modal>
  );
}
