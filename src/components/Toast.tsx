import { ArrowCounterClockwise, CheckCircle, X } from '@phosphor-icons/react';
import { useI18n } from '../i18n';

export interface ToastState {
  id: number;
  message: string;
  undo?: () => void;
}

interface ToastProps {
  toast: ToastState;
  onUndo: () => void;
  onDismiss: () => void;
}

export function Toast({ toast, onUndo, onDismiss }: ToastProps) {
  const { t } = useI18n();

  return (
    <div className="toast" role="status" aria-live="polite" key={toast.id}>
      <CheckCircle className="toast-icon" size={17} weight="fill" aria-hidden="true" />
      <span className="toast-message">{toast.message}</span>
      {toast.undo && (
        <button className="toast-undo" type="button" onClick={onUndo}>
          <ArrowCounterClockwise size={13} weight="bold" aria-hidden="true" />
          {t('common.undo')}
        </button>
      )}
      <button className="toast-close" type="button" onClick={onDismiss} aria-label={t('common.dismiss')}>
        <X size={12} weight="bold" aria-hidden="true" />
      </button>
    </div>
  );
}
