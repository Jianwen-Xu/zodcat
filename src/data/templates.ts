import type { CatalogConfig, CatalogTemplate, ComponentConfig, Locale } from '../types';
import { createId } from '../lib/id';
import { cloneLibraryItem, getLibraryItem } from './library';

export const TEMPLATES: CatalogTemplate[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    nameZh: '仪表盘',
    tagline: 'Metrics, status, and a table.',
    taglineZh: '指标、状态和数据表。',
    catalogName: 'Analytics dashboard',
    catalogNameZh: '分析仪表盘',
    icon: 'dashboard',
    componentNames: ['Stack', 'Card', 'Metric', 'Badge', 'Table'],
  },
  {
    id: 'crud',
    name: 'CRUD form',
    nameZh: 'CRUD 表单',
    tagline: 'Fields and commit actions.',
    taglineZh: '输入控件和提交操作。',
    catalogName: 'Customer editor',
    catalogNameZh: '客户编辑器',
    icon: 'form',
    componentNames: ['Stack', 'Card', 'Input', 'Toggle', 'Button'],
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    nameZh: '监控面板',
    tagline: 'KPIs, health, and controls.',
    taglineZh: 'KPI、健康状态和控制项。',
    catalogName: 'Service monitor',
    catalogNameZh: '服务监控',
    icon: 'monitor',
    componentNames: ['Stack', 'Card', 'Metric', 'Badge', 'Button'],
  },
];

export function getTemplateName(template: CatalogTemplate, locale: Locale): string {
  return locale === 'zh' ? template.nameZh : template.name;
}

export function getTemplateTagline(template: CatalogTemplate, locale: Locale): string {
  return locale === 'zh' ? template.taglineZh : template.tagline;
}

export function getTemplateCatalogName(template: CatalogTemplate, locale: Locale): string {
  return locale === 'zh' ? template.catalogNameZh : template.catalogName;
}

export function createCatalogFromTemplate(template: CatalogTemplate, locale: Locale = 'en'): CatalogConfig {
  const components = template.componentNames
    .map((name) => getLibraryItem(name))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => cloneLibraryItem(item, locale));

  return {
    name: getTemplateCatalogName(template, locale),
    templateId: template.id,
    components,
  };
}

export function createBlankCatalog(locale: Locale = 'en'): CatalogConfig {
  return {
    name: locale === 'zh' ? '未命名 Catalog' : 'Untitled catalog',
    components: [],
  };
}

export function createDefaultCatalog(locale: Locale = 'en'): CatalogConfig {
  return createCatalogFromTemplate(TEMPLATES[0], locale);
}

export function createCustomComponent(name: string): ComponentConfig {
  return {
    id: createId('cmp'),
    name: name.trim(),
    description: '',
    icon: 'custom',
    acceptsChildren: false,
    props: [],
  };
}

export function getTemplateById(id: string): CatalogTemplate | undefined {
  return TEMPLATES.find((template) => template.id === id);
}

