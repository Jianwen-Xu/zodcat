import type { CatalogConfig, ComponentConfig, PropConfig } from '../types';

const STORAGE_KEY = 'zodcat:catalog:v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function readProp(value: unknown): PropConfig | null {
  if (!isRecord(value)) return null;

  const type = readString(value.type);
  if (!['string', 'number', 'boolean', 'enum', 'any', 'unknown'].includes(type)) return null;

  return {
    id: readString(value.id, `prop_${Math.random().toString(36).slice(2)}`),
    name: readString(value.name),
    type: type as PropConfig['type'],
    required: typeof value.required === 'boolean' ? value.required : true,
    nullable: typeof value.nullable === 'boolean' ? value.nullable : false,
    min: readString(value.min),
    max: readString(value.max),
    enumValues: Array.isArray(value.enumValues)
      ? value.enumValues.filter((entry): entry is string => typeof entry === 'string')
      : [],
  };
}

function readComponent(value: unknown): ComponentConfig | null {
  if (!isRecord(value) || typeof value.name !== 'string') return null;

  const props = Array.isArray(value.props)
    ? value.props.map(readProp).filter((prop): prop is PropConfig => prop !== null)
    : [];

  return {
    id: readString(value.id, `cmp_${Math.random().toString(36).slice(2)}`),
    name: value.name,
    description: readString(value.description),
    descriptionSource: typeof value.descriptionSource === 'string' ? value.descriptionSource : undefined,
    icon: readString(value.icon, 'custom') as ComponentConfig['icon'],
    acceptsChildren: typeof value.acceptsChildren === 'boolean' ? value.acceptsChildren : false,
    props,
  };
}

export function loadCatalog(): CatalogConfig | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !Array.isArray(parsed.components)) return null;

    return {
      name: readString(parsed.name, 'Untitled catalog'),
      templateId: typeof parsed.templateId === 'string' ? parsed.templateId : undefined,
      components: parsed.components
        .map(readComponent)
        .filter((component): component is ComponentConfig => component !== null),
    };
  } catch {
    return null;
  }
}

export function saveCatalog(catalog: CatalogConfig): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog));
    return true;
  } catch {
    return false;
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the selection-based fallback.
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}

export function downloadText(text: string, filename: string): void {
  const blob = new Blob([text], { type: 'text/typescript;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
