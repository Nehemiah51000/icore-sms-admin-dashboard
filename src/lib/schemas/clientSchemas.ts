import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().optional(),
  email: z
    .string()
    .email('Enter a valid email address')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^254\d{9}$/, 'Use format 254XXXXXXXXX, no leading 0 or +'),
  login: z.string().min(1, 'Login is required'),
  password: z.string().optional(),
  provider_id: z.coerce
    .number({ message: 'Select a provider' })
    .min(1, 'Select a provider'),
  provider_login_name: z.string().min(1, 'Provider login name is required'),
  status: z.enum(['active', 'suspended']),
  low_balance_threshold: z.coerce.number().optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
