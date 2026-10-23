import { useEffect, useRef } from 'react';
import { X } from '@phosphor-icons/react';
import { useI18n } from '../i18n';

interface CopyDialogProps {
  open: boolean;
  code: string;
  onClose: () => void;
}

export function CopyDialog({ open, code, onClose }: CopyDialogProps) {
  const { t } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      const frame = window.requestAnimationFrame(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      });
      return () => window.cancelAnimationFrame(frame);
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function selectCode() {
    textareaRef.current?.focus();
    textareaRef.current?.select();
  }

  return (
    <dialog
      className="copy-dialog"
      ref={dialogRef}
      aria-labelledby="copy-dialog-title"
      onClose={onClose}
    >
      <div className="copy-dialog-body">
        <div className="copy-dialog-head">
          <div>
            <span className="eyebrow">{t('copyFallback.eyebrow')}</span>
            <h2 id="copy-dialog-title">{t('copyFallback.title')}</h2>
          </div>
          <button className="copy-dialog-icon" type="button" onClick={onClose} aria-label={t('copyFallback.closeAria')}>
            <X size={15} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <p className="copy-dialog-intro">{t('copyFallback.intro')}</p>

        <textarea
          ref={textareaRef}
          className="copy-dialog-code"
          value={code}
          readOnly
          spellCheck={false}
          aria-label={t('copyFallback.codeAria')}
          onFocus={(event) => event.currentTarget.select()}
        />

        <div className="copy-dialog-actions">
          <span className="copy-dialog-hint">{t('copyFallback.local')}</span>
          <div className="copy-dialog-buttons">
            <button className="copy-dialog-button" type="button" onClick={selectCode}>
              {t('copyFallback.selectAll')}
            </button>
            <button className="copy-dialog-button is-primary" type="button" onClick={onClose}>
              {t('copyFallback.done')}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
