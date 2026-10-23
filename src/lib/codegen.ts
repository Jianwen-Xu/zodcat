import type { CatalogConfig, ComponentConfig, PropConfig } from '../types';

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function formatKey(name: string): string {
  return IDENTIFIER.test(name) ? name : JSON.stringify(name);
}

function formatString(value: string): string {
  return JSON.stringify(value);
}

function parseBound(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function stringBounds(prop: PropConfig): string {
  const parts: string[] = [];
  const min = parseBound(prop.min);
  const max = parseBound(prop.max);

  if (min !== null) parts.push(`.min(${min})`);
  if (max !== null) parts.push(`.max(${max})`);

  return parts.join('');
}

function numberBounds(prop: PropConfig): string {
  const parts: string[] = [];
  const min = parseBound(prop.min);
  const max = parseBound(prop.max);

  if (min !== null) parts.push(`.min(${min})`);
  if (max !== null) parts.push(`.max(${max})`);

  return parts.join('');
}

export function propSchemaExpression(prop: PropConfig): string {
  let expression: string;

  switch (prop.type) {
    case 'number':
      expression = `z.number()${numberBounds(prop)}`;
      break;
    case 'boolean':
      expression = 'z.boolean()';
      break;
    case 'enum':
      expression = `z.enum([${prop.enumValues.map(formatString).join(', ')}])`;
      break;
    case 'any':
      expression = 'z.any()';
      break;
    case 'unknown':
      expression = 'z.unknown()';
      break;
    case 'string':
    default:
      expression = `z.string()${stringBounds(prop)}`;
      break;
  }

  if (prop.nullable) expression += '.nullable()';
  if (!prop.required) expression += '.optional()';

  return expression;
}

function componentLines(component: ComponentConfig, baseIndent = '    '): string[] {
  const fieldIndent = `${baseIndent}  `;
  const propIndent = `${fieldIndent}  `;
  const lines: string[] = [];
  lines.push(`${baseIndent}${formatKey(component.name)}: {`);

  if (component.props.length === 0) {
    lines.push(`${fieldIndent}props: z.object({}),`);
  } else {
    lines.push(`${fieldIndent}props: z.object({`);
    for (const prop of component.props) {
      lines.push(`${propIndent}${formatKey(prop.name)}: ${propSchemaExpression(prop)},`);
    }
    lines.push(`${fieldIndent}}),`);
  }

  if (component.acceptsChildren) {
    lines.push(`${fieldIndent}slots: ["default"],`);
  }

  if (component.description.trim()) {
    lines.push(`${fieldIndent}description: ${formatString(component.description.trim())},`);
  }

  lines.push(`${baseIndent}},`);
  return lines;
}

export function buildComponentCode(component: ComponentConfig): string {
  return `${componentLines(component, '').join('\n')}\n`;
}

export function buildCatalogCode(catalog: CatalogConfig): string {
  const lines: string[] = [
    'import { defineCatalog } from "@json-render/core";',
    'import { schema } from "@json-render/react";',
    'import { z } from "zod";',
    '',
    'export const catalog = defineCatalog(schema, {',
    '  components: {',
  ];

  for (const component of catalog.components) {
    lines.push(...componentLines(component));
  }

  lines.push('  },');
  lines.push('});');
  lines.push('');

  return lines.join('\n');
}

export function countProps(catalog: CatalogConfig): number {
  return catalog.components.reduce((total, component) => total + component.props.length, 0);
}

export function codeByteSize(code: string): number {
  return new TextEncoder().encode(code).length;
}

export function slugifyCatalogName(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'catalog';
}

export function catalogFileName(name: string): string {
  return `${slugifyCatalogName(name)}.catalog.ts`;
}
