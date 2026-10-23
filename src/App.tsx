import { useEffect, useMemo, useRef, useState } from 'react';
import { LockSimple } from '@phosphor-icons/react';
import { Header } from './components/Header';
import { LibrarySidebar } from './components/LibrarySidebar';
import { CatalogEditor } from './components/CatalogEditor';
import { CodePanel } from './components/CodePanel';
import { CopyDialog } from './components/CopyDialog';
import { Toast, type ToastState } from './components/Toast';
import {
  createDefaultCatalog,
  createBlankCatalog,
  createCatalogFromTemplate,
  createCustomComponent,
  getTemplateName,
} from './data/templates';
import { cloneLibraryItem, createEmptyProp } from './data/library';
import type { CatalogConfig, CatalogTemplate, LibraryItem, PropConfig, ValidationIssue } from './types';
import { buildCatalogCode, buildComponentCode, catalogFileName, codeByteSize, countProps } from './lib/codegen';
import { validateCatalog, countIssues } from './lib/validation';
import { copyText, downloadText, loadCatalog, saveCatalog } from './lib/storage';
import { useI18n } from './i18n';
import { localizeCatalogContent } from './lib/contentLocalization';

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

function StatusBar({
  components,
  props,
  bytes,
  issues,
}: {
  components: number;
  props: number;
  bytes: number;
  issues: ValidationIssue[];
}) {
  const { t, tn } = useI18n();
  const { errors, warnings } = countIssues(issues);
  const tone = errors > 0 ? 'error' : warnings > 0 ? 'warning' : 'ok';
  const label =
    errors > 0
      ? tn('count.blocking.one', 'count.blocking.other', errors)
      : warnings > 0
        ? tn('count.suggestion.one', 'count.suggestion.other', warnings)
        : t('status.allPass');

  return (
    <footer className="statusbar">
      <div className={`statusbar-primary is-${tone}`}>
        <span className={`status-dot is-${tone}`} aria-hidden="true" />
        <span>{label}</span>
      </div>
      <div className="statusbar-stats" aria-label={t('status.statsAria')}>
        <span>{tn('count.component.one', 'count.component.other', components)}</span>
        <span>{tn('count.prop.one', 'count.prop.other', props)}</span>
        <span>{bytes.toLocaleString('en-US')} B</span>
      </div>
      <div className="statusbar-note">
        <LockSimple size={12} aria-hidden="true" />
        <span>{t('status.browserOnly')}</span>
      </div>
    </footer>
  );
}

export default function App() {
  const { t, locale } = useI18n();
  const [catalog, setCatalog] = useState<CatalogConfig>(() =>
    localizeCatalogContent(loadCatalog() ?? createDefaultCatalog(locale), locale),
  );
  const [activeId, setActiveId] = useState(() => catalog.components[0]?.id ?? '');
  const [toast, setToast] = useState<ToastState | null>(null);
  const [copied, setCopied] = useState(false);
  const [manualCopyCode, setManualCopyCode] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const copyTimer = useRef<number | null>(null);

  const issues = useMemo(() => validateCatalog(catalog, locale), [catalog, locale]);
  const { errors, warnings } = useMemo(() => countIssues(issues), [issues]);
  const code = useMemo(() => buildCatalogCode(catalog), [catalog]);
  const propsCount = useMemo(() => countProps(catalog), [catalog]);
  const byteSize = useMemo(() => codeByteSize(code), [code]);

  useEffect(() => {
    const timeout = window.setTimeout(() => saveCatalog(catalog), 350);
    return () => window.clearTimeout(timeout);
  }, [catalog]);

  useEffect(() => {
    setCatalog((current) => localizeCatalogContent(current, locale));
  }, [locale]);

  useEffect(() => {
    if (catalog.components.length === 0) {
      if (activeId) setActiveId('');
      return;
    }
    if (activeId && !catalog.components.some((component) => component.id === activeId)) {
      setActiveId(catalog.components[0].id);
    }
  }, [catalog.components, activeId]);

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    };
  }, []);

  function dismissToast() {
    if (toastTimer.current !== null) {
      window.clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
    setToast(null);
  }

  function showToast(message: string, undo?: () => void) {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    const id = Date.now() + Math.random();
    setToast({ id, message, undo });
    toastTimer.current = window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
      toastTimer.current = null;
    }, undo ? 7000 : 3800);
  }

  function undoToast() {
    const undo = toast?.undo;
    dismissToast();
    undo?.();
  }

  function updateCatalogName(name: string) {
    setCatalog((current) => ({ ...current, name, templateId: undefined }));
  }

  function updateComponent(
    id: string,
    patch: Partial<Pick<CatalogConfig['components'][number], 'name' | 'description' | 'acceptsChildren'>>,
  ) {
    setCatalog((current) => ({
      ...current,
      components: current.components.map((component) =>
        component.id === id
          ? {
              ...component,
              ...patch,
              ...(patch.description !== undefined ? { descriptionSource: undefined } : {}),
            }
          : component,
      ),
    }));
  }

  function updateProp(componentId: string, propId: string, patch: Partial<PropConfig>) {
    setCatalog((current) => ({
      ...current,
      components: current.components.map((component) =>
        component.id === componentId
          ? {
              ...component,
              props: component.props.map((prop) => (prop.id === propId ? { ...prop, ...patch } : prop)),
            }
          : component,
      ),
    }));
  }

  function addProp(componentId: string) {
    setCatalog((current) => ({
      ...current,
      components: current.components.map((component) =>
        component.id === componentId
          ? { ...component, props: [...component.props, createEmptyProp(component.props)] }
          : component,
      ),
    }));
  }

  function removeProp(componentId: string, propId: string) {
    const component = catalog.components.find((entry) => entry.id === componentId);
    const propIndex = component?.props.findIndex((entry) => entry.id === propId) ?? -1;
    const prop = component && propIndex >= 0 ? component.props[propIndex] : null;
    if (!component || !prop) return;

    setCatalog((current) => ({
      ...current,
      components: current.components.map((entry) =>
        entry.id === componentId
          ? { ...entry, props: entry.props.filter((currentProp) => currentProp.id !== propId) }
          : entry,
      ),
    }));

    showToast(t('toast.removedProp', { name: prop.name || t('prop.unnamed') }), () => {
      setCatalog((current) => ({
        ...current,
        components: current.components.map((entry) => {
          if (entry.id !== componentId || entry.props.some((currentProp) => currentProp.id === propId)) {
            return entry;
          }
          const nextProps = [...entry.props];
          nextProps.splice(Math.min(propIndex, nextProps.length), 0, prop);
          return { ...entry, props: nextProps };
        }),
      }));
    });
  }

  function removeComponent(id: string) {
    const componentIndex = catalog.components.findIndex((entry) => entry.id === id);
    if (componentIndex < 0) return;
    const component = catalog.components[componentIndex];

    const remaining = catalog.components.filter((entry) => entry.id !== id);
    setCatalog((current) => ({ ...current, components: current.components.filter((entry) => entry.id !== id) }));

    if (activeId === id) {
      const nextActive = remaining[Math.min(componentIndex, remaining.length - 1)];
      setActiveId(nextActive?.id ?? '');
    }

    showToast(t('toast.removedComponent', { name: component.name || t('component.untitled') }), () => {
      setCatalog((current) => {
        if (current.components.some((entry) => entry.id === id)) return current;
        const nextComponents = [...current.components];
        nextComponents.splice(Math.min(componentIndex, nextComponents.length), 0, component);
        return { ...current, components: nextComponents };
      });
      setActiveId(id);
    });
  }

  function addLibraryItem(item: LibraryItem) {
    const existing = catalog.components.find(
      (component) => component.name.toLowerCase() === item.name.toLowerCase(),
    );
    if (existing) {
      setActiveId(existing.id);
      return;
    }

    const component = cloneLibraryItem(item, locale);
    setCatalog((current) => ({ ...current, components: [...current.components, component] }));
    setActiveId(component.id);
  }

  function addCustomComponent(name: string) {
    const component = createCustomComponent(name);
    setCatalog((current) => ({ ...current, components: [...current.components, component] }));
    setActiveId(component.id);
  }

  function loadTemplate(template: CatalogTemplate) {
    const previousCatalog = catalog;
    const previousActive = activeId;
    const next = createCatalogFromTemplate(template, locale);
    setCatalog(next);
    setActiveId(next.components[0]?.id ?? '');
    showToast(t('toast.loadedTemplate', { name: getTemplateName(template, locale) }), () => {
      setCatalog(previousCatalog);
      setActiveId(previousActive);
    });
  }

  function startBlankCatalog() {
    const previousCatalog = catalog;
    const previousActive = activeId;
    const next = createBlankCatalog(locale);
    setCatalog(next);
    setActiveId('');
    showToast(t('toast.blank'), () => {
      setCatalog(previousCatalog);
      setActiveId(previousActive);
    });
  }

  function markCopied() {
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    setCopied(true);
    copyTimer.current = window.setTimeout(() => {
      setCopied(false);
      copyTimer.current = null;
    }, 1800);
  }

  async function handleCopy() {
    const succeeded = await copyText(code);
    if (succeeded) {
      markCopied();
      showToast(t('toast.copiedCatalog'));
      return;
    }

    setManualCopyCode(code);
    showToast(t('toast.clipboardBlocked'));
  }

  async function handleCopyComponent(componentId: string): Promise<boolean> {
    const component = catalog.components.find((entry) => entry.id === componentId);
    if (!component) return false;

    const snippet = buildComponentCode(component);
    const succeeded = await copyText(snippet);

    if (succeeded) {
      showToast(t('toast.copiedSnippet', { name: component.name || t('component.untitled') }));
      return true;
    }

    setManualCopyCode(snippet);
    showToast(t('toast.clipboardBlocked'));
    return false;
  }

  function handleDownload() {
    const filename = catalogFileName(catalog.name);
    downloadText(code, filename);
    showToast(t('toast.downloaded', { filename }));
  }

  function focusLibrary() {
    document.getElementById('library-pane')?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    window.setTimeout(() => {
      document.getElementById('component-search')?.focus({ preventScroll: true });
    }, 180);
  }

  function locateIssue(componentId: string) {
    setActiveId(componentId);
    window.requestAnimationFrame(() => {
      document
        .getElementById(`component-${componentId}`)
        ?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    });
  }

  return (
    <div className="app-shell">
      <Header
        catalogName={catalog.name}
        copied={copied}
        onCopy={handleCopy}
        onDownload={handleDownload}
      />
      <main className="workspace">
        <LibrarySidebar
          catalog={catalog}
          onSelectComponent={setActiveId}
          onAddLibrary={addLibraryItem}
          onRemoveComponent={removeComponent}
          onLoadTemplate={loadTemplate}
          onNewBlank={startBlankCatalog}
          onAddCustom={addCustomComponent}
        />
        <CatalogEditor
          catalog={catalog}
          activeId={activeId}
          issues={issues}
          onSelectComponent={setActiveId}
          onUpdateCatalogName={updateCatalogName}
          onUpdateComponent={updateComponent}
          onUpdateProp={updateProp}
          onAddProp={addProp}
          onRemoveProp={removeProp}
          onCopyComponent={handleCopyComponent}
          onRemoveComponent={removeComponent}
          onFocusLibrary={focusLibrary}
        />
        <CodePanel
          code={code}
          issues={issues}
          errors={errors}
          warnings={warnings}
          copied={copied}
          onCopy={handleCopy}
          onLocateIssue={locateIssue}
        />
      </main>
      <StatusBar components={catalog.components.length} props={propsCount} bytes={byteSize} issues={issues} />
      {toast && <Toast toast={toast} onUndo={undoToast} onDismiss={dismissToast} />}
      <CopyDialog
        open={manualCopyCode !== null}
        code={manualCopyCode ?? code}
        onClose={() => setManualCopyCode(null)}
      />
    </div>
  );
}
