export function statusToVariant(status: 'pending' | 'success' | 'failed') {
  if (status === 'success') return 'success' as const;
  if (status === 'failed') return 'error' as const;
  return 'pending' as const;
}

export function stageLabel(stage: string) {
  const labels: Record<string, string> = {
    stk_initiated: 'STK Sent',
    payment_confirmed: 'Payment Confirmed',
    credit_loaded: 'Credit Loaded',
    failed: 'Failed',
  };
  return labels[stage] ?? stage;
}
