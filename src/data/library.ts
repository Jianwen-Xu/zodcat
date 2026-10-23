import type { ComponentConfig, LibraryItem, Locale, PropConfig, PropType } from '../types';
import { createId } from '../lib/id';

export function makeProp(
  name: string,
  type: PropType,
  options: Partial<Pick<PropConfig, 'required' | 'nullable' | 'min' | 'max' | 'enumValues'>> = {},
): Omit<PropConfig, 'id'> {
  return {
    name,
    type,
    required: options.required ?? true,
    nullable: options.nullable ?? false,
    min: options.min ?? '',
    max: options.max ?? '',
    enumValues: options.enumValues ?? [],
  };
}

function optionalProp(
  name: string,
  type: PropType,
  options: Partial<Pick<PropConfig, 'nullable' | 'min' | 'max' | 'enumValues'>> = {},
): Omit<PropConfig, 'id'> {
  return makeProp(name, type, { ...options, required: false });
}

export const LIBRARY_ITEMS: LibraryItem[] = [
  {
    name: 'Card',
    category: 'Structure',
    categoryZh: '结构',
    description: 'Surface for grouping related content. Accepts child components in its default slot.',
    descriptionZh: '用于组织相关内容的面板，default slot 可容纳子组件。',
    icon: 'card',
    acceptsChildren: true,
    props: [
      makeProp('title', 'string', { min: '1', max: '80' }),
      optionalProp('subtitle', 'string', { max: '120' }),
      optionalProp('padding', 'enum', { enumValues: ['none', 'sm', 'md', 'lg'] }),
    ],
  },
  {
    name: 'Stack',
    category: 'Structure',
    categoryZh: '结构',
    description: 'Lays out child components in a row or column with consistent spacing.',
    descriptionZh: '按行或列排列子组件，并保持一致的间距。',
    icon: 'stack',
    acceptsChildren: true,
    props: [
      makeProp('direction', 'enum', { enumValues: ['row', 'column'] }),
      optionalProp('gap', 'enum', { enumValues: ['xs', 'sm', 'md', 'lg'] }),
      optionalProp('align', 'enum', { enumValues: ['start', 'center', 'end', 'stretch'] }),
    ],
  },
  {
    name: 'Button',
    category: 'Actions',
    categoryZh: '操作',
    description: 'Triggers a named action from the catalog consumer.',
    descriptionZh: '触发 catalog 使用方提供的一个命名动作。',
    icon: 'button',
    acceptsChildren: false,
    props: [
      makeProp('label', 'string', { min: '1', max: '40' }),
      makeProp('variant', 'enum', { enumValues: ['primary', 'secondary', 'ghost'] }),
      optionalProp('disabled', 'boolean'),
    ],
  },
  {
    name: 'Input',
    category: 'Inputs',
    categoryZh: '输入',
    description: 'Single-line field with a label and an optional placeholder.',
    descriptionZh: '带标签和可选 placeholder 的单行输入框。',
    icon: 'input',
    acceptsChildren: false,
    props: [
      makeProp('label', 'string', { min: '1', max: '60' }),
      optionalProp('placeholder', 'string', { max: '80' }),
      makeProp('inputType', 'enum', { enumValues: ['text', 'email', 'password', 'number'] }),
      optionalProp('required', 'boolean'),
    ],
  },
  {
    name: 'Toggle',
    category: 'Inputs',
    categoryZh: '输入',
    description: 'Boolean switch for a single setting.',
    descriptionZh: '用于单个设置的布尔开关。',
    icon: 'toggle',
    acceptsChildren: false,
    props: [
      makeProp('label', 'string', { min: '1', max: '60' }),
      optionalProp('checked', 'boolean'),
    ],
  },
  {
    name: 'Table',
    category: 'Data',
    categoryZh: '数据',
    description: 'Tabular data region. Rows are supplied by the registry at render time.',
    descriptionZh: '表格数据区域，行数据在渲染时由 registry 提供。',
    icon: 'table',
    acceptsChildren: false,
    props: [
      makeProp('caption', 'string', { min: '1', max: '80' }),
      makeProp('density', 'enum', { enumValues: ['compact', 'comfortable'] }),
      optionalProp('paginated', 'boolean'),
    ],
  },
  {
    name: 'Badge',
    category: 'Display',
    categoryZh: '展示',
    description: 'Compact status label for inline metadata.',
    descriptionZh: '用于行内元数据的紧凑状态标签。',
    icon: 'badge',
    acceptsChildren: false,
    props: [
      makeProp('label', 'string', { min: '1', max: '24' }),
      makeProp('tone', 'enum', { enumValues: ['neutral', 'positive', 'warning', 'critical'] }),
    ],
  },
  {
    name: 'Metric',
    category: 'Data',
    categoryZh: '数据',
    description: 'Single KPI with a value, optional trend, and caption.',
    descriptionZh: '展示单个 KPI，包含数值、可选趋势和说明。',
    icon: 'metric',
    acceptsChildren: false,
    props: [
      makeProp('label', 'string', { min: '1', max: '32' }),
      makeProp('value', 'string', { min: '1', max: '24' }),
      optionalProp('trend', 'enum', { enumValues: ['up', 'down', 'flat'] }),
      optionalProp('caption', 'string', { max: '48' }),
    ],
  },
  {
    name: 'Text',
    category: 'Display',
    categoryZh: '展示',
    description: 'Heading, body, or caption copy.',
    descriptionZh: '标题、正文或注释文案。',
    icon: 'text',
    acceptsChildren: false,
    props: [
      makeProp('content', 'string', { min: '1', max: '280' }),
      makeProp('variant', 'enum', { enumValues: ['heading', 'body', 'caption'] }),
    ],
  },
  {
    name: 'Image',
    category: 'Display',
    categoryZh: '展示',
    description: 'Media block. The source can be bound to application state.',
    descriptionZh: '媒体区块，图片源可以绑定到应用状态。',
    icon: 'image',
    acceptsChildren: false,
    props: [
      makeProp('src', 'string', { min: '1', max: '500' }),
      makeProp('alt', 'string', { min: '1', max: '120' }),
      optionalProp('fit', 'enum', { enumValues: ['cover', 'contain'] }),
    ],
  },
];

export function getLibraryCategory(item: LibraryItem, locale: Locale): string {
  return locale === 'zh' ? item.categoryZh : item.category;
}

export function getLibraryDescription(item: LibraryItem, locale: Locale): string {
  return locale === 'zh' ? item.descriptionZh : item.description;
}

export function cloneLibraryItem(item: LibraryItem, locale: Locale = 'en'): ComponentConfig {
  return {
    id: createId('cmp'),
    name: item.name,
    description: getLibraryDescription(item, locale),
    descriptionSource: item.name,
    icon: item.icon,
    acceptsChildren: item.acceptsChildren,
    props: item.props.map((prop) => ({ ...prop, id: createId('prop'), enumValues: [...prop.enumValues] })),
  };
}

export function getLibraryItem(name: string): LibraryItem | undefined {
  return LIBRARY_ITEMS.find((item) => item.name === name);
}

export function createEmptyProp(existing: PropConfig[] = []): PropConfig {
  let index = 1;
  let name = 'value';

  while (existing.some((prop) => prop.name.toLowerCase() === name.toLowerCase())) {
    index += 1;
    name = `value${index}`;
  }

  return {
    id: createId('prop'),
    name,
    type: 'string',
    required: true,
    nullable: false,
    min: '',
    max: '',
    enumValues: [],
  };
}
