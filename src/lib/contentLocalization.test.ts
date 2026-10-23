import { describe, expect, it } from 'vitest';
import type { CatalogConfig } from '../types';
import { cloneLibraryItem, LIBRARY_ITEMS } from '../data/library';
import { createCatalogFromTemplate, TEMPLATES } from '../data/templates';
import { localizeCatalogContent } from './contentLocalization';

const dashboard = TEMPLATES[0];

describe('localizeCatalogContent', () => {
  it('translates built-in template names and component descriptions', () => {
    const catalog = createCatalogFromTemplate(dashboard, 'en');
    const zh = localizeCatalogContent(catalog, 'zh');

    expect(zh.name).toBe('分析仪表盘');
    expect(zh.templateId).toBe('dashboard');
    expect(zh.components.every((component) => component.descriptionSource)).toBe(true);
    expect(zh.components.find((component) => component.name === 'Stack')?.description).toContain('按行或列');

    const backToEnglish = localizeCatalogContent(zh, 'en');
    expect(backToEnglish.name).toBe('Analytics dashboard');
    expect(backToEnglish.components.find((component) => component.name === 'Stack')?.description).toContain(
      'Lays out child components',
    );
  });

  it('migrates legacy template content that has no source metadata', () => {
    const catalog = createCatalogFromTemplate(dashboard, 'en');
    const legacy: CatalogConfig = {
      name: catalog.name,
      components: catalog.components.map(({ descriptionSource: _source, ...component }) => component),
    };

    const zh = localizeCatalogContent(legacy, 'zh');
    expect(zh.name).toBe('分析仪表盘');
    expect(zh.templateId).toBe('dashboard');
    expect(zh.components.find((component) => component.name === 'Card')?.description).toContain('用于组织相关内容');
  });

  it('leaves custom catalog names and descriptions untouched', () => {
    const component = cloneLibraryItem(LIBRARY_ITEMS[0], 'en');
    const catalog: CatalogConfig = {
      name: 'My own catalog',
      components: [
        {
          ...component,
          description: 'My custom card copy.',
          descriptionSource: undefined,
        },
      ],
    };

    expect(localizeCatalogContent(catalog, 'zh')).toBe(catalog);
  });

  it('syncs built-in copy without touching a custom component in the same catalog', () => {
    const catalog = createCatalogFromTemplate(dashboard, 'en');
    const custom = cloneLibraryItem(LIBRARY_ITEMS[0], 'en');
    const mixed: CatalogConfig = {
      ...catalog,
      components: [
        ...catalog.components,
        { ...custom, id: 'custom_card', description: 'A custom card.', descriptionSource: undefined },
      ],
    };

    const zh = localizeCatalogContent(mixed, 'zh');
    expect(zh.components.find((component) => component.id === 'custom_card')?.description).toBe('A custom card.');
    expect(zh.components.find((component) => component.name === 'Badge')?.description).toContain('用于行内');
  });
});
