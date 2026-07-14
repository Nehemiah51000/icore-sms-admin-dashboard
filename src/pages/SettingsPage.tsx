import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getSettings,
  updateSettings,
  type Settings,
} from '../lib/api/settings';
import { ApiError } from '../lib/api';
import { Input } from '../ui/Input/Input';
import { Button } from '../ui/Button/Button';
import { Card, CardHeader, CardBody } from '../ui/Card/Card';
import { Textarea } from '../ui/TextArea/TextArea';

function SettingsForm({ initial }: { initial: Settings }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Partial<Settings>>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () => updateSettings(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings updated.');
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
          error instanceof ApiError
            ? error.message
            : 'Could not save settings.',
        );
      }
    },
  });

  return (
    <>
      <Input
        label='Company Name'
        value={form.company_name ?? ''}
        onChange={(e) => setForm({ ...form, company_name: e.target.value })}
        error={errors.company_name}
      />
      <Input
        label='Support Email'
        type='email'
        value={form.support_email ?? ''}
        onChange={(e) => setForm({ ...form, support_email: e.target.value })}
        error={errors.support_email}
      />
      <Input
        label='Support Phone'
        value={form.support_phone ?? ''}
        onChange={(e) => setForm({ ...form, support_phone: e.target.value })}
        error={errors.support_phone}
      />
      <Input
        label='Paybill Display Number'
        hint="Shown to clients — for reference only, doesn't affect actual STK push routing."
        value={form.paybill_display_number ?? ''}
        onChange={(e) =>
          setForm({ ...form, paybill_display_number: e.target.value })
        }
        error={errors.paybill_display_number}
      />
      <Textarea
        label='Business Hours'
        value={form.business_hours ?? ''}
        onChange={(e) => setForm({ ...form, business_hours: e.target.value })}
        error={errors.business_hours}
      />
      <div className='flex justify-end pt-2'>
        <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>
          Save Changes
        </Button>
      </div>
    </>
  );
}

export function SettingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  });

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-xl font-semibold text-text-main'>Settings</h1>
        <p className='text-sm text-text-muted mt-0.5'>
          Company details shown to clients and used in system communications.
        </p>
      </div>

      <Card className='max-w-2xl'>
        <CardHeader>
          <span className='text-sm font-semibold text-text-main'>
            Company Information
          </span>
        </CardHeader>
        <CardBody className='space-y-4'>
          {isLoading || !data ? (
            <div className='space-y-3'>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className='h-10 rounded bg-bg-base animate-pulse'
                />
              ))}
            </div>
          ) : (
            <SettingsForm key={data.id} initial={data} />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
