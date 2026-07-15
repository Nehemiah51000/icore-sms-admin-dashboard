import { Modal } from '../Modal/Modal';
import { Button } from '../Button/Button';

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title: string;
  description: string;
}

export function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  loading,
  title,
  description,
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size='sm'
      footer={
        <>
          <Button
            variant='secondary'
            onClick={onClose}
            disabled={loading}
            fullWidth
            className='sm:w-auto'>
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={onConfirm}
            loading={loading}
            fullWidth
            className='sm:w-auto'>
            Delete
          </Button>
        </>
      }>
      <p className='text-sm text-text-muted leading-relaxed'>{description}</p>
    </Modal>
  );
}
