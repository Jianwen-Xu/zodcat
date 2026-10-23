import { ArrowSquareOut, BracketsCurly, Check, Copy, DownloadSimple } from '@phosphor-icons/react';
import { useI18n } from '../i18n';

interface HeaderProps {
  catalogName: string;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
}

export function Header({ catalogName, copied, onCopy, onDownload }: HeaderProps) {
  const { t, locale, setLocale } = useI18n();

  return (
    <header className="topbar">
      <div className="brand" aria-label="zodcat catalog studio">
        <div className="brand-mark" aria-hidden="true">
          <span>z</span>
        </div>
        <div className="brand-type">
          <span className="brand-name">zodcat</span>
          <span className="brand-caption">{t('header.brandCaption')}</span>
        </div>
      </div>

      <div className="doc-path" aria-label={t('header.currentCatalog')}>
        <span className="doc-path-muted">{t('header.workspace')}</span>
        <span className="doc-path-slash">/</span>
        <span className="doc-path-file">{catalogName || t('catalog.untitled')}</span>
        <span className="local-badge">
          <span className="local-badge-dot" aria-hidden="true" />
          {t('header.local')}
        </span>
      </div>

      <div className="topbar-actions">
        <a
          className="docs-link"
          href="https://json-render.dev/docs/catalog"
          target="_blank"
          rel="noreferrer"
        >
          <BracketsCurly size={15} aria-hidden="true" />
          <span>{t('header.docs')}</span>
          <ArrowSquareOut size={12} weight="bold" aria-hidden="true" />
        </a>
        <button
          className="locale-toggle"
          type="button"
          onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
          title={t('header.languageAria')}
          aria-label={t('header.languageAria')}
        >
          {t('header.languageTarget')}
        </button>
        <span className="topbar-divider" aria-hidden="true" />
        <button className="btn btn-quiet" type="button" onClick={onDownload} aria-label={t('header.downloadAria')}>
          <DownloadSimple size={16} weight="bold" aria-hidden="true" />
          <span className="btn-label">{t('header.download')}</span>
        </button>
        <button
          className={`btn btn-primary copy-primary${copied ? ' is-copied' : ''}`}
          type="button"
          onClick={onCopy}
          aria-label={t('header.copyAria')}
        >
          {copied ? (
            <Check size={16} weight="bold" aria-hidden="true" />
          ) : (
            <Copy size={16} weight="bold" aria-hidden="true" />
          )}
          <span className="btn-label">{copied ? t('header.copied') : t('header.copy')}</span>
        </button>
      </div>
    </header>
  );
}
