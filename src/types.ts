export type Locale = 'en' | 'zh';

export type PropType = 'string' | 'number' | 'boolean' | 'enum' | 'any' | 'unknown';

export type ComponentIcon =
  | 'card'
  | 'stack'
  | 'button'
  | 'input'
  | 'toggle'
  | 'table'
  | 'badge'
  | 'metric'
  | 'text'
  | 'image'
  | 'custom';

export interface PropConfig {
  id: string;
  name: string;
  type: PropType;
  required: boolean;
  nullable: boolean;
  /** Minimum length for strings, minimum value for numbers. Stored as text so inputs stay editable. */
  min: string;
  /** Maximum length for strings, maximum value for numbers. */
  max: string;
  enumValues: string[];
}

export interface ComponentConfig {
  id: string;
  name: string;
  description: string;
  /** Set for descriptions that come from the built-in library, so they can follow the UI language. */
  descriptionSource?: string;
  icon: ComponentIcon;
  acceptsChildren: boolean;
  props: PropConfig[];
}

export interface CatalogConfig {
  name: string;
  /** Set when the catalog was generated from a built-in template. */
  templateId?: string;
  components: ComponentConfig[];
}

export interface LibraryItem {
  name: string;
  category: string;
  categoryZh: string;
  description: string;
  descriptionZh: string;
  icon: ComponentIcon;
  acceptsChildren: boolean;
  props: Array<Omit<PropConfig, 'id'>>;
}

export interface CatalogTemplate {
  id: string;
  name: string;
  nameZh: string;
  tagline: string;
  taglineZh: string;
  catalogName: string;
  catalogNameZh: string;
  icon: 'dashboard' | 'form' | 'monitor';
  componentNames: string[];
}

export type IssueSeverity = 'error' | 'warning';

export interface ValidationIssue {
  id: string;
  ruleId: string;
  severity: IssueSeverity;
  message: string;
  hint?: string;
  componentId?: string;
  componentName?: string;
  propId?: string;
  propName?: string;
}
