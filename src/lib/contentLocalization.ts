import type { CatalogConfig, ComponentConfig, Locale } from '../types';
import { getLibraryDescription, LIBRARY_ITEMS } from '../data/library';
import { getTemplateCatalogName, TEMPLATES } from '../data/templates';

function localizeComponent(component: ComponentConfig, locale: Locale): ComponentConfig {
  const sourceItem = component.descriptionSource
    ? LIBRARY_ITEMS.find((item) => item.name === component.descriptionSource)
    : undefined;
  const matchedItem =
    sourceItem ??
    LIBRARY_ITEMS.find(
      (item) => item.description === component.description || item.descriptionZh === component.description,
    );

  if (!matchedItem) return component;

  const description = getLibraryDescription(matchedItem, locale);
  if (component.description === description && component.descriptionSource === matchedItem.name) {
    return component;
  }

  return {
    ...component,
    description,
    descriptionSource: matchedItem.name,
  };
}

/**
 * Keeps built-in template and library copy in sync with the active language.
 * User-edited descriptions and catalog names are left untouched.
 */
export function localizeCatalogContent(catalog: CatalogConfig, locale: Locale): CatalogConfig {
  let name = catalog.name;
  let templateId = catalog.templateId;
  let changed = false;

  const template = templateId
    ? TEMPLATES.find((entry) => entry.id === templateId)
    : TEMPLATES.find((entry) => entry.catalogName === name || entry.catalogNameZh === name);

  if (template) {
    const localizedName = getTemplateCatalogName(template, locale);
    if (name !== localizedName) {
      name = localizedName;
      changed = true;
    }
    if (templateId !== template.id) {
      templateId = template.id;
      changed = true;
    }
  }

  const components = catalog.components.map((component) => {
    const localized = localizeComponent(component, locale);
    if (localized !== component) changed = true;
    return localized;
  });

  if (!changed) return catalog;

  return {
    ...catalog,
    name,
    templateId,
    components,
  };
}
