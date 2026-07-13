import { z } from 'zod';

export const providerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9_-]+$/, 'Lowercase letters, numbers, and dashes only'),
  base_url: z.string().url('Enter a valid URL'),
  credentials: z
    .string()
    .min(1, 'Credentials are required')
    .refine(
      (val) => {
        try {
          JSON.parse(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Must be valid JSON' },
    ),
  status: z.enum(['active', 'inactive']),
});

export type ProviderFormValues = z.infer<typeof providerSchema>;
