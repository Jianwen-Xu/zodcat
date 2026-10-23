import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Check, FilePlus, MagnifyingGlass, Plus, WarningCircle, X } from '@phosphor-icons/react';
import { getLibraryCategory, getLibraryDescription, LIBRARY_ITEMS } from '../data/library';
import {
  getTemplateName,
  getTemplateTagline,
  TEMPLATES,
} from '../data/templates';
import { useI18n } from '../i18n';
import type { CatalogConfig, CatalogTemplate, LibraryItem } from '../types';
import { ComponentGlyph, TemplateGlyph } from './Glyphs';

interface LibrarySidebarProps {
  catalog: CatalogConfig;
  onSelectComponent: (id: string) => void;
  onAddLibrary: (item: LibraryItem) => void;
  onRemoveComponent: (id: string) => void;
  onLoadTemplate: (template: CatalogTemplate) => void;
  onNewBlank: () => void;
  onAddCustom: (name: string) => void;
}

export function LibrarySidebar({
  catalog,
  onSelectComponent,
  onAddLibrary,
  onRemoveComponent,
  onLoadTemplate,
  onNewBlank,
  onAddCustom,
}: LibrarySidebarProps) {
  const [query, setQuery] = useState('');
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customErrorKey, setCustomErrorKey] = useState<
    'library.nameRequired' | 'library.nameInvalid' | 'library.nameDuplicate' | null
  >(null);
  const customInputRef = useRef<HTMLInputElement>(null);
  const { t, tn, locale } = useI18n();

  const addedByName = new Map<string, string>();
  for (const component of catalog.components) {
    const key = component.name.toLowerCase();
    if (!addedByName.has(key)) addedByName.set(key, component.id);
  }

  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = LIBRARY_ITEMS.filter((item) => {
    if (!normalizedQuery) return true;
    return `${item.name} ${item.category} ${item.categoryZh} ${item.description} ${item.descriptionZh}`
      .toLowerCase()
      .includes(normalizedQuery);
  });

  useEffect(() => {
    if (customOpen) customInputRef.current?.focus();
  }, [customOpen]);

  function openCustomForm() {
    setCustomErrorKey(null);
    setCustomName('');
    setCustomOpen(true);
  }

  function closeCustomForm() {
    setCustomOpen(false);
    setCustomErrorKey(null);
  }

  function submitCustomForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = customName.trim();

    if (!name) {
      setCustomErrorKey('library.nameRequired');
      return;
    }

    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)) {
      setCustomErrorKey('library.nameInvalid');
      return;
    }

    if (catalog.components.some((component) => component.name.toLowerCase() === name.toLowerCase())) {
      setCustomErrorKey('library.nameDuplicate');
      return;
    }

    onAddCustom(name);
    closeCustomForm();
  }

  function handleLibraryItem(item: LibraryItem) {
    const existingId = addedByName.get(item.name.toLowerCase());
    if (existingId) {
      onSelectComponent(existingId);
      return;
    }
    onAddLibrary(item);
  }

  return (
    <aside className="library-pane" aria-label={t('library.title')} id="library-pane">
      <div className="pane-head sidebar-head">
        <div>
          <span className="eyebrow">{t('library.eyebrow')}</span>
          <h2 className="pane-title">{t('library.title')}</h2>
        </div>
        <span className="pane-count" aria-label={t('library.countAria', { count: LIBRARY_ITEMS.length })}>
          {String(LIBRARY_ITEMS.length).padStart(2, '0')}
        </span>
      </div>

      <div className="sidebar-scroll">
        <section className="starters" aria-labelledby="starters-heading">
          <div className="section-bar">
            <h3 className="section-label" id="starters-heading">
              {t('library.startFrom')}
            </h3>
            <button className="mini-action" type="button" onClick={onNewBlank}>
              <FilePlus size={13} aria-hidden="true" />
              {t('library.blank')}
            </button>
          </div>
          <div className="starter-grid">
            {TEMPLATES.map((template) => (
              <button
                className="starter-tile"
                type="button"
                key={template.id}
                onClick={() => onLoadTemplate(template)}
                title={getTemplateTagline(template, locale)}
              >
                <span className="starter-icon">
                  <TemplateGlyph icon={template.icon} size={16} />
                </span>
                <span className="starter-name">{getTemplateName(template, locale)}</span>
                <span className="starter-meta">{tn('count.templateComponent.one', 'count.templateComponent.other', template.componentNames.length)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="library-section" aria-labelledby="library-heading">
          <div className="section-bar">
            <h3 className="section-label" id="library-heading">
              {t('library.components')}
            </h3>
            <span className="section-note">{t('library.addRemove')}</span>
          </div>

          <label className="search-field">
            <MagnifyingGlass size={15} aria-hidden="true" />
            <span className="sr-only">{t('library.searchLabel')}</span>
            <input
              id="component-search"
              type="search"
              value={query}
              placeholder={t('library.searchPlaceholder')}
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
            />
          </label>

          <div className="library-list">
            {filteredItems.map((item) => {
              const existingId = addedByName.get(item.name.toLowerCase());
              const added = Boolean(existingId);
              return (
                <div className={`library-row${added ? ' is-added' : ''}`} key={item.name}>
                  {added ? (
                    <>
                      <button
                        className="library-row-main"
                        type="button"
                        onClick={() => handleLibraryItem(item)}
                        title={getLibraryDescription(item, locale)}
                        aria-label={t('library.openAria', { name: item.name })}
                      >
                        <span className="library-icon">
                          <ComponentGlyph icon={item.icon} size={17} />
                        </span>
                        <span className="library-copy">
                          <strong>{item.name}</strong>
                          <small>{getLibraryCategory(item, locale)}</small>
                        </span>
                      </button>
                      <button
                        className="library-action"
                        type="button"
                        onClick={() => existingId && onRemoveComponent(existingId)}
                        title={t('library.removeAria', { name: item.name })}
                        aria-label={t('library.removeAria', { name: item.name })}
                      >
                        <Check className="library-action-check" size={13} weight="bold" aria-hidden="true" />
                        <X className="library-action-remove" size={12} weight="bold" aria-hidden="true" />
                      </button>
                    </>
                  ) : (
                    <button
                      className="library-row-main is-full"
                      type="button"
                      onClick={() => onAddLibrary(item)}
                      title={getLibraryDescription(item, locale)}
                      aria-label={t('library.addAria', { name: item.name })}
                    >
                      <span className="library-icon">
                        <ComponentGlyph icon={item.icon} size={17} />
                      </span>
                      <span className="library-copy">
                        <strong>{item.name}</strong>
                        <small>{getLibraryCategory(item, locale)}</small>
                      </span>
                      <span className="library-action library-action-static" aria-hidden="true">
                        <Plus size={13} weight="bold" />
                      </span>
                    </button>
                  )}
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="library-empty">
                <WarningCircle size={17} aria-hidden="true" />
                <span>{t('library.noMatch', { query: query.trim() })}</span>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className={`sidebar-foot${customOpen ? ' is-open' : ''}`}>
        {customOpen ? (
          <form className="custom-form" onSubmit={submitCustomForm}>
            <div className="custom-form-head">
              <span className="section-label">{t('library.newComponent')}</span>
              <button
                className="text-button"
                type="button"
                onClick={closeCustomForm}
                aria-label={t('library.cancelAria')}
              >
                {t('common.cancel')}
              </button>
            </div>
            <label className="field compact-field">
              <span className="field-label">{t('library.componentName')}</span>
              <input
                ref={customInputRef}
                value={customName}
                placeholder={t('library.namePlaceholder')}
                onChange={(event) => {
                  setCustomName(event.target.value);
                  if (customErrorKey) setCustomErrorKey(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') closeCustomForm();
                }}
                aria-invalid={Boolean(customErrorKey)}
                aria-describedby={customErrorKey ? 'custom-name-error' : undefined}
              />
            </label>
            {customErrorKey && (
              <p className="form-error" id="custom-name-error">
                {t(customErrorKey)}
              </p>
            )}
            <button className="btn btn-primary custom-submit" type="submit">
              <Plus size={15} weight="bold" aria-hidden="true" />
              {t('library.addComponent')}
            </button>
          </form>
        ) : (
          <button className="custom-trigger" type="button" onClick={openCustomForm}>
            <span className="custom-trigger-icon">
              <Plus size={15} weight="bold" aria-hidden="true" />
            </span>
            <span>
              <strong>{t('library.custom')}</strong>
              <small>{t('library.customHint')}</small>
            </span>
          </button>
        )}
      </div>
    </aside>
  );
}
