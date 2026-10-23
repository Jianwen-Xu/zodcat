import { useEffect, useRef, useState } from 'react';
import { Check, CaretDown, BracketsCurly, Copy, Plus, Trash, WarningCircle, X, XCircle } from '@phosphor-icons/react';
import type { ComponentConfig, PropConfig, PropType, ValidationIssue } from '../types';
import { buildComponentCode } from '../lib/codegen';
import { useI18n } from '../i18n';
import { highlightCodeLine } from '../lib/highlight';
import { ComponentGlyph } from './Glyphs';

interface CatalogEditorProps {
  catalog: { name: string; components: ComponentConfig[] };
  activeId: string;
  issues: ValidationIssue[];
  onSelectComponent: (id: string) => void;
  onUpdateCatalogName: (name: string) => void;
  onUpdateComponent: (
    id: string,
    patch: Partial<Pick<ComponentConfig, 'name' | 'description' | 'acceptsChildren'>>,
  ) => void;
  onUpdateProp: (componentId: string, propId: string, patch: Partial<PropConfig>) => void;
  onAddProp: (componentId: string) => void;
  onRemoveProp: (componentId: string, propId: string) => void;
  onRemoveComponent: (id: string) => void;
  onCopyComponent: (id: string) => Promise<boolean>;
  onFocusLibrary: () => void;
}

const TYPE_OPTIONS: Array<{ value: PropType; label: string }> = [
  { value: 'string', label: 'string' },
  { value: 'number', label: 'number' },
  { value: 'boolean', label: 'boolean' },
  { value: 'enum', label: 'enum' },
];

const HATCH_OPTIONS: Array<{ value: PropType; label: string }> = [
  { value: 'any', label: 'any' },
  { value: 'unknown', label: 'unknown' },
];

function worstSeverity(issues: ValidationIssue[]): 'error' | 'warning' | null {
  if (issues.some((issue) => issue.severity === 'error')) return 'error';
  if (issues.length > 0) return 'warning';
  return null;
}

function BoundsEditor({
  prop,
  onChange,
}: {
  prop: PropConfig;
  onChange: (patch: Partial<PropConfig>) => void;
}) {
  const { t } = useI18n();
  const isString = prop.type === 'string';

  return (
    <div className="bounds-editor">
      <label className="bound-field">
        <span>{t(isString ? 'prop.minLen' : 'prop.min')}</span>
        <input
          value={prop.min}
          onChange={(event) => onChange({ min: event.target.value })}
          inputMode={isString ? 'numeric' : 'decimal'}
          placeholder="0"
          aria-label={t(isString ? 'prop.minLengthAria' : 'prop.minValueAria', { name: prop.name })}
        />
      </label>
      <span className="bound-divider" aria-hidden="true">
        /
      </span>
      <label className="bound-field">
        <span>{t(isString ? 'prop.maxLen' : 'prop.max')}</span>
        <input
          value={prop.max}
          onChange={(event) => onChange({ max: event.target.value })}
          inputMode={isString ? 'numeric' : 'decimal'}
          placeholder="∞"
          aria-label={t(isString ? 'prop.maxLengthAria' : 'prop.maxValueAria', { name: prop.name })}
        />
      </label>
    </div>
  );
}

function EnumEditor({ prop, onChange }: { prop: PropConfig; onChange: (values: string[]) => void }) {
  const { t } = useI18n();
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(prop.enumValues.length === 0);

  function commitDraft() {
    const next = draft.trim();
    if (!next) return;
    if (!prop.enumValues.includes(next)) onChange([...prop.enumValues, next]);
    setDraft('');
  }

  function finishAdding() {
    commitDraft();
    setAdding(false);
  }

  return (
    <div className="enum-editor">
      <div className="enum-values">
        {prop.enumValues.map((value) => (
          <span className="enum-chip" key={value}>
            {value}
            <button
              type="button"
              aria-label={t('prop.removeEnumAria', { value })}
              onClick={() => onChange(prop.enumValues.filter((entry) => entry !== value))}
            >
              <X size={9} weight="bold" aria-hidden="true" />
            </button>
          </span>
        ))}
        {adding ? (
          <input
            className="enum-input"
            value={draft}
            autoFocus
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ',') {
                event.preventDefault();
                commitDraft();
              }
              if (event.key === 'Escape') {
                event.preventDefault();
                setDraft('');
                setAdding(false);
              }
              if (event.key === 'Backspace' && !draft && prop.enumValues.length > 0) {
                onChange(prop.enumValues.slice(0, -1));
              }
            }}
            onBlur={finishAdding}
            placeholder={t('prop.enumPlaceholder')}
            aria-label={t('prop.addValueAria', { name: prop.name })}
          />
        ) : (
          <button
            className="enum-add"
            type="button"
            onClick={() => setAdding(true)}
            aria-label={t('prop.addValueAria', { name: prop.name })}
          >
            <Plus size={9} weight="bold" aria-hidden="true" />
            {t('prop.addValue')}
          </button>
        )}
      </div>
    </div>
  );
}

function CheckFlag({
  label,
  checked,
  onChange,
  title,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
}) {
  return (
    <label className="check-flag" title={title}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="check-box" aria-hidden="true">
        {checked && <Check size={9} weight="bold" />}
      </span>
      <span>{label}</span>
    </label>
  );
}

function PropRow({
  component,
  prop,
  issues,
  onUpdate,
  onRemove,
}: {
  component: ComponentConfig;
  prop: PropConfig;
  issues: ValidationIssue[];
  onUpdate: (patch: Partial<PropConfig>) => void;
  onRemove: () => void;
}) {
  const { t } = useI18n();
  const severity = worstSeverity(issues);

  return (
    <div className={`prop-row${severity ? ` has-${severity}` : ''}`}>
      <div className="prop-name-cell">
        <input
          className="prop-name-input"
          value={prop.name}
          onChange={(event) => onUpdate({ name: event.target.value })}
          aria-label={t('prop.nameAria', { component: component.name || t('component.untitled') })}
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      <div className="prop-type-cell">
        <span className="select-wrap">
          <select
            value={prop.type}
            onChange={(event) => onUpdate({ type: event.target.value as PropType })}
            aria-label={t('prop.typeAria', { name: prop.name })}
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            <optgroup label={t('prop.escapeGroup')}>
              {HATCH_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          </select>
          <CaretDown size={11} weight="bold" aria-hidden="true" />
        </span>
      </div>

      <div className="prop-rules-cell">
        {prop.type === 'string' && (
          <>
            <span className="rule-kicker">{t('prop.length')}</span>
            <BoundsEditor prop={prop} onChange={onUpdate} />
          </>
        )}
        {prop.type === 'number' && (
          <>
            <span className="rule-kicker">{t('prop.range')}</span>
            <BoundsEditor prop={prop} onChange={onUpdate} />
          </>
        )}
        {prop.type === 'enum' && (
          <>
            <span className="rule-kicker">{t('prop.values')}</span>
            <EnumEditor prop={prop} onChange={(enumValues) => onUpdate({ enumValues })} />
          </>
        )}
        {prop.type === 'boolean' && (
          <span className="rule-empty">
            {t('prop.noParams')}
          </span>
        )}
        {(prop.type === 'any' || prop.type === 'unknown') && (
          <span className="rule-escape">
            <span>z.{prop.type}()</span>
            <small>{t('prop.escapeBypass')}</small>
          </span>
        )}
      </div>

      <div className="prop-flags-cell">
        <CheckFlag
          label={t('prop.required')}
          checked={prop.required}
          onChange={(required) => onUpdate({ required })}
          title={t('prop.requiredTitle')}
        />
        <CheckFlag
          label={t('prop.nullable')}
          checked={prop.nullable}
          onChange={(nullable) => onUpdate({ nullable })}
          title={t('prop.nullableTitle')}
        />
      </div>

      <div className="prop-remove-cell">
        <button
          className="icon-button danger-hover"
          type="button"
          onClick={onRemove}
          aria-label={t('prop.removeAria', { name: prop.name || t('prop.unnamed') })}
          title={t('prop.removeTitle')}
        >
          <Trash size={14} />
        </button>
      </div>

      {issues.length > 0 && (
        <div className={`prop-issues is-${severity}`}>
          {issues.map((issue) => (
            <p key={issue.id}>
              {issue.severity === 'error' ? (
                <XCircle size={13} weight="fill" aria-hidden="true" />
              ) : (
                <WarningCircle size={13} weight="fill" aria-hidden="true" />
              )}
              <span>{issue.message}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function ComponentCard({
  component,
  index,
  active,
  issues,
  onSelect,
  onUpdate,
  onUpdateProp,
  onAddProp,
  onRemoveProp,
  onRemove,
  onCopyComponent,
}: {
  component: ComponentConfig;
  index: number;
  active: boolean;
  issues: ValidationIssue[];
  onSelect: () => void;
  onUpdate: (patch: Partial<Pick<ComponentConfig, 'name' | 'description' | 'acceptsChildren'>>) => void;
  onUpdateProp: (propId: string, patch: Partial<PropConfig>) => void;
  onAddProp: () => void;
  onRemoveProp: (propId: string) => void;
  onRemove: () => void;
  onCopyComponent: (id: string) => Promise<boolean>;
}) {
  const severity = worstSeverity(issues);
  const componentIssues = issues.filter((issue) => !issue.propId);
  const issueCount = issues.length;
  const [view, setView] = useState<'props' | 'code'>('props');
  const [snippetCopied, setSnippetCopied] = useState(false);
  const snippetTimer = useRef<number | null>(null);
  const { t, tn } = useI18n();
  const displayName = component.name || t('component.untitled');
  const snippet = buildComponentCode(component);
  const snippetLines = snippet.replace(/\n$/, '').split('\n');

  useEffect(() => {
    return () => {
      if (snippetTimer.current !== null) window.clearTimeout(snippetTimer.current);
    };
  }, []);

  async function handleCopySnippet() {
    const succeeded = await onCopyComponent(component.id);
    if (!succeeded) return;

    setSnippetCopied(true);
    if (snippetTimer.current !== null) window.clearTimeout(snippetTimer.current);
    snippetTimer.current = window.setTimeout(() => {
      setSnippetCopied(false);
      snippetTimer.current = null;
    }, 1800);
  }

  return (
    <article
      className={`component-card${active ? ' is-open' : ''}${severity ? ` has-${severity}` : ''}`}
      id={`component-${component.id}`}
    >
      <div className="component-head">
        <button
          className="component-toggle"
          type="button"
          onClick={onSelect}
          aria-expanded={active}
          aria-controls={`component-body-${component.id}`}
        >
          <span className="component-index">{String(index + 1).padStart(2, '0')}</span>
          <span className="component-icon">
            <ComponentGlyph icon={component.icon} size={18} />
          </span>
          <span className="component-copy">
            <span className="component-name-row">
              <span className="component-name">{displayName}</span>
              {issueCount > 0 && (
                <span className={`issue-pip is-${severity}`}>
                  {issueCount}
                  <span className="sr-only"> {tn('count.check.one', 'count.check.other', issueCount)}</span>
                </span>
              )}
            </span>
            <span className="component-description">
              {component.description || t('component.descriptionFallback')}
            </span>
          </span>
          <span className="component-prop-count">
            {tn('count.prop.one', 'count.prop.other', component.props.length)}
          </span>
          <CaretDown className="component-caret" size={14} weight="bold" aria-hidden="true" />
        </button>
        <button
          className="icon-button component-remove"
          type="button"
          onClick={onRemove}
          aria-label={t('component.removeAria', { name: displayName })}
          title={t('component.removeTitle')}
        >
          <Trash size={15} />
        </button>
      </div>

      {active && (
        <div className="component-body" id={`component-body-${component.id}`}>
          <div className="component-modebar">
            <div className="mode-switch" role="group" aria-label={t('component.modeGroupAria', { name: displayName })}>
              <button
                className={`mode-switch-button${view === 'props' ? ' is-active' : ''}`}
                type="button"
                aria-pressed={view === 'props'}
                onClick={() => setView('props')}
              >
                {t('component.modeProps')}
              </button>
              <button
                className={`mode-switch-button${view === 'code' ? ' is-active' : ''}`}
                type="button"
                aria-pressed={view === 'code'}
                onClick={() => setView('code')}
              >
                {t('component.modeCode')}
              </button>
            </div>
            <button
              className={`snippet-copy${snippetCopied ? ' is-copied' : ''}`}
              type="button"
              onClick={handleCopySnippet}
              title={t('component.copyAria', { name: displayName })}
              aria-label={t('component.copyAria', { name: displayName })}
            >
              {snippetCopied ? (
                <Check size={12} weight="bold" aria-hidden="true" />
              ) : (
                <Copy size={12} aria-hidden="true" />
              )}
              <span>{snippetCopied ? t('common.copied') : t('common.copy')}</span>
            </button>
          </div>

          {view === 'code' ? (
            <>
              <div className="component-code-view">
              <div className="component-code-head">
                <span className="component-code-label">{t('component.fragment')}</span>
                <span className="component-code-language">TS</span>
              </div>
              <pre
                className="component-code-block"
                aria-label={t('component.codeViewAria', { name: displayName })}
              >
                <code>
                  {snippetLines.map((line, lineIndex) => (
                    <span className="component-code-line" key={lineIndex}>
                      {line
                        ? highlightCodeLine(line).map((token, tokenIndex) => (
                            <span className={token.className} key={`${lineIndex}-${tokenIndex}`}>
                              {token.text}
                            </span>
                          ))
                        : ' '}
                    </span>
                  ))}
                </code>
                </pre>
              </div>
              <p className="component-code-hint">{t('component.codeHint')}</p>
            </>
          ) : (
            <>
          <div className="component-settings">
            <label className="field">
              <span className="field-label">{t('component.nameLabel')}</span>
              <input
                className="mono-input"
                value={component.name}
                onChange={(event) => onUpdate({ name: event.target.value })}
                spellCheck={false}
                autoComplete="off"
              />
            </label>
            <label className="field description-field">
              <span className="field-label">{t('component.descriptionLabel')}</span>
              <input
                value={component.description}
                onChange={(event) => onUpdate({ description: event.target.value })}
                placeholder={t('component.descriptionPlaceholder')}
                autoComplete="off"
              />
            </label>
            <div className="slot-setting">
              <div className="slot-copy">
                <span className="field-label">{t('component.acceptsChildren')}</span>
                <small>{t('component.defaultSlot')}</small>
              </div>
              <button
                className={`switch${component.acceptsChildren ? ' is-on' : ''}`}
                type="button"
                role="switch"
                aria-checked={component.acceptsChildren}
                aria-label={t('component.acceptsChildren')}
                onClick={() => onUpdate({ acceptsChildren: !component.acceptsChildren })}
              >
                <span className="switch-thumb" />
              </button>
            </div>
          </div>

          {componentIssues.length > 0 && (
            <div className={`component-alerts is-${worstSeverity(componentIssues)}`}>
              {componentIssues.map((issue) => (
                <p key={issue.id}>
                  {issue.severity === 'error' ? (
                    <XCircle size={13} weight="fill" aria-hidden="true" />
                  ) : (
                    <WarningCircle size={13} weight="fill" aria-hidden="true" />
                  )}
                  <span>{issue.message}</span>
                </p>
              ))}
            </div>
          )}

          <div className="props-heading">
            <div className="props-heading-copy">
              <h4>{t('component.propsHeading')}</h4>
              <span className="schema-note">{`z.object({ ${component.props.length} })`}</span>
            </div>
            <span className="props-helper">{t('component.requiredHelper')}</span>
          </div>

          <div className="prop-table">
            {component.props.length > 0 && (
              <div className="prop-table-head" aria-hidden="true">
                <span>{t('prop.table.property')}</span>
                <span>{t('prop.table.type')}</span>
                <span>{t('prop.table.rules')}</span>
                <span>{t('prop.table.flags')}</span>
                <span />
              </div>
            )}

            {component.props.map((prop) => (
              <PropRow
                key={prop.id}
                component={component}
                prop={prop}
                issues={issues.filter((issue) => issue.propId === prop.id)}
                onUpdate={(patch) => onUpdateProp(prop.id, patch)}
                onRemove={() => onRemoveProp(prop.id)}
              />
            ))}

            {component.props.length === 0 && (
              <div className="props-empty">
                <BracketsCurly size={18} aria-hidden="true" />
                <span>{t('component.noProps')}</span>
              </div>
            )}
          </div>

              <div className="props-footer">
                <button className="add-prop" type="button" onClick={onAddProp}>
                  <Plus size={14} weight="bold" aria-hidden="true" />
                  {t('component.addProp')}
                </button>
                <span className="props-footer-note">
                  {component.props.length === 0
                    ? t('component.emptyPropsNote')
                    : t('component.fieldCount', {
                        fields: tn('count.field.one', 'count.field.other', component.props.length),
                        inContract: t('component.inContract'),
                      })}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </article>
  );
}

export function CatalogEditor({
  catalog,
  activeId,
  issues,
  onSelectComponent,
  onUpdateCatalogName,
  onUpdateComponent,
  onUpdateProp,
  onAddProp,
  onRemoveProp,
  onRemoveComponent,
  onCopyComponent,
  onFocusLibrary,
}: CatalogEditorProps) {
  const { t } = useI18n();
  const totalProps = catalog.components.reduce((count, component) => count + component.props.length, 0);

  return (
    <section className="catalog-pane" aria-label={t('catalog.editorAria')}>
      <div className="pane-head catalog-head">
        <div className="catalog-title-group">
          <span className="eyebrow">{t('catalog.eyebrow')}</span>
          <input
            className="catalog-name-input"
            value={catalog.name}
            onChange={(event) => onUpdateCatalogName(event.target.value)}
            aria-label={t('catalog.nameAria')}
            title={t('catalog.nameTitle')}
            spellCheck={false}
          />
        </div>
        <div className="catalog-head-side">
          <div className="catalog-stats" aria-label={t('catalog.statsAria', { components: catalog.components.length, props: totalProps })}>
            <span>
              <strong>{String(catalog.components.length).padStart(2, '0')}</strong>{' '}
              {t(catalog.components.length === 1 ? 'catalog.componentLabel.one' : 'catalog.componentLabel.other')}
            </span>
            <span className="stat-divider" aria-hidden="true">
              /
            </span>
            <span>
              <strong>{String(totalProps).padStart(2, '0')}</strong>{' '}
              {t(totalProps === 1 ? 'catalog.propLabel.one' : 'catalog.propLabel.other')}
            </span>
          </div>
          <button className="btn btn-small btn-quiet add-part-button" type="button" onClick={onFocusLibrary}>
            <Plus size={14} weight="bold" aria-hidden="true" />
            {t('catalog.addComponent')}
          </button>
        </div>
      </div>

      <div className="catalog-scroll">
        {catalog.components.length === 0 ? (
          <div className="empty-catalog">
            <span className="empty-glyph">
              <BracketsCurly size={30} weight="regular" aria-hidden="true" />
            </span>
            <span className="eyebrow">{t('catalog.emptyEyebrow')}</span>
            <h3>{t('catalog.emptyTitle')}</h3>
            <p>{t('catalog.emptyBody')}</p>
            <button className="btn btn-primary" type="button" onClick={onFocusLibrary}>
              <Plus size={15} weight="bold" aria-hidden="true" />
              {t('catalog.browse')}
            </button>
          </div>
        ) : (
          <div className="component-list">
            {catalog.components.map((component, index) => (
              <ComponentCard
                key={component.id}
                component={component}
                index={index}
                active={component.id === activeId}
                issues={issues.filter((issue) => issue.componentId === component.id)}
                onSelect={() => onSelectComponent(component.id === activeId ? '' : component.id)}
                onUpdate={(patch) => onUpdateComponent(component.id, patch)}
                onUpdateProp={(propId, patch) => onUpdateProp(component.id, propId, patch)}
                onAddProp={() => onAddProp(component.id)}
                onRemoveProp={(propId) => onRemoveProp(component.id, propId)}
                onRemove={() => onRemoveComponent(component.id)}
                onCopyComponent={onCopyComponent}
              />
            ))}
          </div>
        )}
        <div className="catalog-footer-note">
          <span className="footer-rule" aria-hidden="true" />
          <span>
            {catalog.components.length > 0 ? t('catalog.footerWith') : t('catalog.footerEmpty')}
          </span>
        </div>
      </div>
    </section>
  );
}
