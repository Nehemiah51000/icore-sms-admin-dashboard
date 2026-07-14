import { useQuery } from '@tanstack/react-query';
import { getTransaction } from '../../lib/api/transactions';
import { statusToVariant, stageLabel } from '../../lib/statusMappings';
import { Modal } from '../Modal/Modal';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import { Button } from '../Button/Button';

interface TransactionDetailModalProps {
  transactionId: number | null;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex items-center justify-between py-2 border-b border-border-main last:border-0'>
      <span className='text-xs text-text-muted'>{label}</span>
      <span className='text-sm text-text-main font-medium text-right'>
        {value}
      </span>
    </div>
  );
}

export function TransactionDetailModal({
  transactionId,
  onClose,
}: TransactionDetailModalProps) {
  const { data: txn, isLoading } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => getTransaction(transactionId!),
    enabled: transactionId !== null,
  });

  return (
    <Modal
      open={transactionId !== null}
      onClose={onClose}
      title={txn ? `Transaction #${txn.id}` : 'Loading...'}
      size='lg'
      footer={
        <Button variant='secondary' onClick={onClose}>
          Close
        </Button>
      }>
      {isLoading || !txn ? (
        <div className='space-y-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='h-5 rounded bg-bg-base animate-pulse' />
          ))}
        </div>
      ) : (
        <div>
          <div>
            <Row label='Client' value={txn.client.name ?? txn.client.login} />
            <Row label='Provider' value={txn.provider.name} />
            <Row label='Phone' value={txn.mpesa_phone} />
            <Row label='Amount' value={`KES ${txn.amount_kes}`} />
            <Row label='Credits Requested' value={txn.credits_requested} />
            <Row
              label='Stage'
              value={
                <StatusBadge status={statusToVariant(txn.status)} size='sm'>
                  {stageLabel(txn.stage)}
                </StatusBadge>
              }
            />
            <Row
              label='M-Pesa Receipt'
              value={txn.mpesa_receipt_number ?? '—'}
            />
            <Row
              label='Checkout Request ID'
              value={txn.mpesa_checkout_request_id ?? '—'}
            />
            <Row
              label='Created'
              value={new Date(txn.created_at).toLocaleString()}
            />
            {txn.failure_reason && (
              <Row
                label='Failure Reason'
                value={
                  <span className='text-red-600'>{txn.failure_reason}</span>
                }
              />
            )}
          </div>

          {txn.provider_response && (
            <div className='mt-4'>
              <p className='text-xs font-semibold uppercase text-text-muted mb-2'>
                Raw Provider Response
              </p>
              <pre className='text-xs font-mono bg-bg-base rounded-lg p-3 overflow-x-auto text-text-main'>
                {JSON.stringify(txn.provider_response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
