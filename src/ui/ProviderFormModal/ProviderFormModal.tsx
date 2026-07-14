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

/**
 * Owns all form state and the footer's action buttons in one place.
 * Only ever mounted while the modal is open (see ProviderFormModal below),
 * and keyed by provider id — so every open gets a fresh instance with
 * correctly-derived initial state. No useEffect needed to "sync" state,
 * since there's nothing to sync: the right values are simply the initial
 * values at mount time.
 */
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
      toast.success(isEditing ? 'Provider updated.' : 'Provider created.');
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
    <div>
      <form className='space-y-4'>
        <Input
          label='Display Name'
          placeholder='Zettatel'
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
        />

        <Select
          label='Provider Type'
          placeholder='Select provider'
          options={PROVIDER_OPTIONS}
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          error={errors.slug}
          hint='Determines which credential fields appear below.'
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
          <div className='border-t border-border-main pt-4'>
            <p className='text-xs font-semibold uppercase text-text-muted mb-3'>
              Credentials
            </p>

            {isKnownProvider ? (
              <div className='space-y-4'>
                {isEditing && (
                  <p className='text-xs text-text-muted -mt-1'>
                    Leave fields blank to keep their current stored values.
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
                label='Credentials (JSON)'
                hint="This provider type isn't registered with a form yet — enter raw JSON. Ask the developer to add it to the credential field registry."
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                error={errors.credentials}
              />
            )}
          </div>
        )}
      </form>

      <div className='flex items-center justify-end gap-2 -mx-5 -mb-4 mt-6 px-5 py-4 border-t border-border-main bg-bg-base/40'>
        <Button
          variant='secondary'
          onClick={onClose}
          disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={mutation.isPending}>
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
      title={provider ? `Edit ${provider.name}` : 'Add Provider'}
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
