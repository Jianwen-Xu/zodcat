import { useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import {
  ArrowRight,
  CaretRight,
  Check,
  CheckCircle,
  Copy,
  FileCode,
  WarningCircle,
  XCircle,
} from '@phosphor-icons/react';
import type { ValidationIssue } from '../types';
import { GUARDRAILS } from '../lib/validation';
import { highlightCodeLine } from '../lib/highlight';
import { useI18n } from '../i18n';

interface CodePanelProps {
  code: string;
  issues: ValidationIssue[];
  errors: number;
  warnings: number;
  copied: boolean;
  onCopy: () => void;
  onLocateIssue: (componentId: string) => void;
}

type PanelTab = 'code' | 'checks';

function highlightedLine(line: string, lineIndex: number): ReactNode[] {
  return highlightCodeLine(line).map((token, tokenIndex) => (
    <span className={token.className} key={`${lineIndex}-${tokenIndex}`}>
      {token.text}
    </span>
  ));
}

function CodeView({ code }: { code: string }) {
  const { t } = useI18n();
  const lines = code.replace(/\n$/, '').split('\n');

  return (
    <div className="code-view" role="tabpanel" id="output-code" aria-labelledby="output-code-tab">
      <pre className="code-block" aria-label={t('code.viewAria')}>
        <code>
          {lines.map((line, index) => (
            <span className="code-line" key={index}>
              <span className="code-line-number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="code-line-content">{line ? highlightedLine(line, index) : ' '}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

function IssueRow({ issue, onLocateIssue }: { issue: ValidationIssue; onLocateIssue: (id: string) => void }) {
  const { t } = useI18n();
  const guardrail = GUARDRAILS.find((entry) => entry.id === issue.ruleId);
  const location = [issue.componentName, issue.propName].filter(Boolean).join(' / ');

  return (
    <li className={`issue-item is-${issue.severity}`}>
      <div className="issue-item-top">
        <span className="issue-severity-icon">
          {issue.severity === 'error' ? (
            <XCircle size={15} weight="fill" aria-hidden="true" />
          ) : (
            <WarningCircle size={15} weight="fill" aria-hidden="true" />
          )}
        </span>
        <span className="issue-location">{location || t('checks.locationCatalog')}</span>
        <span className="issue-rule">{guardrail ? t(guardrail.labelKey) : t('checks.ruleFallback')}</span>
      </div>
      <p className="issue-message">{issue.message}</p>
      {issue.hint && <p className="issue-hint">{issue.hint}</p>}
      {issue.componentId && (
        <button className="issue-locate" type="button" onClick={() => onLocateIssue(issue.componentId!)}>
          {t('checks.openComponent')}
          <ArrowRight size={12} weight="bold" aria-hidden="true" />
        </button>
      )}
    </li>
  );
}

function ChecksView({
  issues,
  errors,
  warnings,
  onLocateIssue,
}: {
  issues: ValidationIssue[];
  errors: number;
  warnings: number;
  onLocateIssue: (id: string) => void;
}) {
  const { t } = useI18n();
  const clean = issues.length === 0;
  const blockingText = t(errors === 1 ? 'count.blocking.one' : 'count.blocking.other', { count: errors });
  const suggestionText = t(warnings === 1 ? 'count.suggestion.one' : 'count.suggestion.other', { count: warnings });
  const summaryBody =
    errors > 0 && warnings > 0
      ? t('checks.body.both', { errors: blockingText, warnings: suggestionText })
      : errors > 0
        ? t('checks.body.errors', { errors: blockingText })
        : warnings > 0
          ? t('checks.body.warnings', { warnings: suggestionText })
          : t('checks.cleanBody');

  return (
    <div
      className="checks-view"
      role="tabpanel"
      id="output-checks"
      aria-labelledby="output-checks-tab"
    >
      <div className="checks-scroll">
        <div className={`checks-summary${clean ? ' is-clean' : ''}`}>
          <span className={`checks-summary-icon${clean ? ' is-clean' : ''}`}>
            {clean ? (
              <CheckCircle size={24} weight="fill" aria-hidden="true" />
            ) : errors > 0 ? (
              <XCircle size={24} weight="fill" aria-hidden="true" />
            ) : (
              <WarningCircle size={24} weight="fill" aria-hidden="true" />
            )}
          </span>
          <div className="checks-summary-copy">
            <span className="eyebrow">{t('checks.liveAudit')}</span>
            <h3>{clean ? t('checks.cleanTitle') : errors > 0 ? t('checks.errorTitle') : t('checks.warningTitle')}</h3>
            <p>{summaryBody}</p>
          </div>
        </div>

        {issues.length > 0 && (
          <ul className="issue-list" aria-label={t('checks.issueListAria')}>
            {issues.map((issue) => (
              <IssueRow key={issue.id} issue={issue} onLocateIssue={onLocateIssue} />
            ))}
          </ul>
        )}

        <section className="guardrails" aria-labelledby="guardrails-heading">
          <div className="section-bar">
            <h3 className="section-label" id="guardrails-heading">
              {t('checks.guardrails')}
            </h3>
            <span className="section-note">{t('checks.runsOnEveryKeystroke')}</span>
          </div>
          <div className="guardrail-list">
            {GUARDRAILS.map((guardrail) => {
              const failures = issues.filter((issue) => issue.ruleId === guardrail.id);
              const passing = failures.length === 0;

              return (
                <div className={`guardrail-row${passing ? ' is-passing' : ' is-failing'}`} key={guardrail.id}>
                  <span className="guardrail-state" aria-hidden="true">
                    {passing ? <Check size={10} weight="bold" /> : failures.length}
                  </span>
                  <div className="guardrail-copy">
                    <strong>{t(guardrail.labelKey)}</strong>
                    <small>{t(guardrail.detailKey)}</small>
                  </div>
                  <span className={`guardrail-status${passing ? ' is-passing' : ''}`}>
                    {passing ? t('checks.pass') : t('checks.fix')}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <p className="checks-footnote">{t('checks.footnote')}</p>
      </div>
    </div>
  );
}

export function CodePanel({ code, issues, errors, warnings, copied, onCopy, onLocateIssue }: CodePanelProps) {
  const { t } = useI18n();
  const [tab, setTab] = useState<PanelTab>('code');
  const totalIssues = issues.length;

  function handleTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') {
      return;
    }
    event.preventDefault();
    const nextTab: PanelTab =
      event.key === 'Home' ? 'code' : event.key === 'End' ? 'checks' : tab === 'code' ? 'checks' : 'code';
    setTab(nextTab);
    document.getElementById(nextTab === 'code' ? 'output-code-tab' : 'output-checks-tab')?.focus();
  }
  const tone = errors > 0 ? 'error' : warnings > 0 ? 'warning' : 'ok';
  const statusLabel =
    errors > 0
      ? t(errors === 1 ? 'code.status.blocking.one' : 'code.status.blocking.other', { count: errors })
      : warnings > 0
        ? t(warnings === 1 ? 'code.status.suggestion.one' : 'code.status.suggestion.other', { count: warnings })
        : t('code.status.clean');

  return (
    <aside className="code-pane" aria-label={t('code.panelAria')}>
      <div className="code-topbar">
        <div className="code-tabs" role="tablist" aria-label={t('code.tabsAria')} onKeyDown={handleTabKeyDown}>
          <button
            className={`code-tab${tab === 'code' ? ' is-active' : ''}`}
            type="button"
            role="tab"
            aria-selected={tab === 'code'}
            aria-controls="output-code"
            id="output-code-tab"
            tabIndex={tab === 'code' ? 0 : -1}
            onClick={() => setTab('code')}
          >
            <FileCode size={15} aria-hidden="true" />
            catalog.ts
          </button>
          <button
            className={`code-tab${tab === 'checks' ? ' is-active' : ''}`}
            type="button"
            role="tab"
            aria-selected={tab === 'checks'}
            aria-controls="output-checks"
            id="output-checks-tab"
            tabIndex={tab === 'checks' ? 0 : -1}
            onClick={() => setTab('checks')}
          >
            <CheckCircle size={15} aria-hidden="true" />
            {t('code.checksTab')}
            <span className={`tab-count is-${tone}`}>{totalIssues}</span>
          </button>
        </div>
        <div className="code-topbar-actions">
          <button
            className={`inline-copy${copied ? ' is-copied' : ''}`}
            type="button"
            onClick={onCopy}
            title={t('code.copyAria')}
            aria-label={t('code.copyAria')}
          >
            {copied ? (
              <Check size={13} weight="bold" aria-hidden="true" />
            ) : (
              <Copy size={13} aria-hidden="true" />
            )}
            <span>{copied ? t('common.copied') : t('common.copy')}</span>
          </button>
          <span className="language-chip">TS</span>
        </div>
      </div>

      {tab === 'code' ? (
        <>
          <CodeView code={code} />
          <button
            className={`code-status-strip is-${tone}`}
            type="button"
            onClick={() => setTab('checks')}
          >
            <span className="code-status-label">
              <span className={`status-dot is-${tone}`} aria-hidden="true" />
              {statusLabel}
            </span>
            <span className="code-status-action">
              {t('code.review')}
              <CaretRight size={11} weight="bold" aria-hidden="true" />
            </span>
          </button>
        </>
      ) : (
        <ChecksView issues={issues} errors={errors} warnings={warnings} onLocateIssue={onLocateIssue} />
      )}
    </aside>
  );
}
