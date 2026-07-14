export interface CredentialField {
  key: string;
  label: string;
  type: 'text' | 'password';
  placeholder?: string;
  hint?: string;
  required?: boolean;
}

// Fields common to every provider — used for the master-balance boss-alert
// feature (CheckMasterBalances backend command).
const commonFields: CredentialField[] = [
  {
    key: 'alert_phone',
    label: 'Alert Phone Number',
    type: 'text',
    placeholder: '254712345678',
    hint: "Who gets notified if this provider's master balance runs low.",
  },
  {
    key: 'master_threshold',
    label: 'Master Balance Alert Threshold',
    type: 'text',
    placeholder: 'e.g. 1000',
  },
];

export const providerFieldRegistry: Record<string, CredentialField[]> = {
  zettatel: [
    { key: 'userId', label: 'User ID', type: 'text', required: true },
    { key: 'password', label: 'Password', type: 'password', required: true },
    {
      key: 'senderid',
      label: 'Sender ID',
      type: 'text',
      hint: 'Approved sender name for SMS alerts.',
    },
    ...commonFields,
  ],
  hostpinnacle: [
    { key: 'userId', label: 'User ID', type: 'text', required: true },
    { key: 'password', label: 'Password', type: 'password', required: true },
    {
      key: 'senderid',
      label: 'Sender ID',
      type: 'text',
      hint: 'Approved sender name for SMS alerts.',
    },
    ...commonFields,
  ],
  advanta: [
    { key: 'apikey', label: 'API Key', type: 'password', required: true },
    { key: 'partnerID', label: 'Partner ID', type: 'text', required: true },
    { key: 'shortcode', label: 'Shortcode / Sender ID', type: 'text' },
    ...commonFields,
  ],
};

export function getFieldsForSlug(slug: string): CredentialField[] | null {
  return providerFieldRegistry[slug] ?? null;
}
