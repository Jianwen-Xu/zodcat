import { describe, expect, it } from 'vitest';
import type { CatalogConfig, ComponentConfig, PropConfig } from '../types';
import {
  buildCatalogCode,
  buildComponentCode,
  catalogFileName,
  propSchemaExpression,
  slugifyCatalogName,
} from './codegen';

function prop(overrides: Partial<PropConfig> = {}): PropConfig {
  return {
    id: 'prop_1',
    name: 'title',
    type: 'string',
    required: true,
    nullable: false,
    min: '',
    max: '',
    enumValues: [],
    ...overrides,
  };
}

function component(overrides: Partial<ComponentConfig> = {}): ComponentConfig {
  return {
    id: 'cmp_1',
    name: 'Card',
    description: 'A card container.',
    icon: 'card',
    acceptsChildren: false,
    props: [prop()],
    ...overrides,
  };
}

function catalog(components: ComponentConfig[]): CatalogConfig {
  return { name: 'Analytics dashboard', components };
}

describe('propSchemaExpression', () => {
  it('adds string length bounds, nullable, and optional modifiers in order', () => {
    expect(
      propSchemaExpression(prop({ min: '1', max: '80', nullable: true, required: false })),
    ).toBe('z.string().min(1).max(80).nullable().optional()');
  });

  it('supports negative number bounds', () => {
    expect(
      propSchemaExpression(prop({ name: 'offset', type: 'number', min: '-10', max: '10' })),
    ).toBe('z.number().min(-10).max(10)');
  });

  it('renders enums with quoted values', () => {
    expect(
      propSchemaExpression(prop({ type: 'enum', enumValues: ['row', 'column', 'full width'] })),
    ).toBe('z.enum(["row", "column", "full width"])');
  });

  it('keeps escape hatches explicit', () => {
    expect(propSchemaExpression(prop({ type: 'any' }))).toBe('z.any()');
    expect(propSchemaExpression(prop({ type: 'unknown' }))).toBe('z.unknown()');
  });
});

describe('buildCatalogCode', () => {
  it('emits the json-render schema-first catalog API', () => {
    const code = buildCatalogCode(
      catalog([
        component({
          acceptsChildren: true,
          props: [
            prop({ min: '1', max: '80' }),
            prop({
              id: 'prop_2',
              name: 'padding',
              type: 'enum',
              enumValues: ['none', 'sm', 'md'],
              required: false,
            }),
          ],
        }),
      ]),
    );

    expect(code).toContain('import { defineCatalog } from "@json-render/core";');
    expect(code).toContain('import { schema } from "@json-render/react";');
    expect(code).toContain('import { z } from "zod";');
    expect(code).toContain('export const catalog = defineCatalog(schema, {');
    expect(code).toContain('title: z.string().min(1).max(80),');
    expect(code).toContain('padding: z.enum(["none", "sm", "md"]).optional(),');
    expect(code).toContain('slots: ["default"],');
    expect(code).toContain('description: "A card container.",');
  });

  it('emits an empty z.object for components without props', () => {
    const code = buildCatalogCode(catalog([component({ props: [] })]));
    expect(code).toContain('props: z.object({}),');
  });

  it('quotes keys that are not valid JS identifiers', () => {
    const code = buildCatalogCode(
      catalog([
        component({
          name: 'DataGrid/Compact',
          props: [prop({ name: 'column-label', max: '20' })],
        }),
      ]),
    );
    expect(code).toContain('"DataGrid/Compact": {');
    expect(code).toContain('"column-label": z.string().max(20),');
  });

  it('omits empty descriptions', () => {
    const code = buildCatalogCode(catalog([component({ description: '' })]));
    expect(code).not.toContain('description:');
  });
});

describe('buildComponentCode', () => {
  it('emits a copy-ready single component fragment without imports', () => {
    const code = buildComponentCode(
      component({
        acceptsChildren: true,
        props: [prop({ min: '1', max: '80' }), prop({ id: 'prop_2', name: 'padding', type: 'enum', enumValues: ['sm', 'md'], required: false })],
      }),
    );

    expect(code).not.toContain('import');
    expect(code).toContain('Card: {\n  props: z.object({\n    title: z.string().min(1).max(80),');
    expect(code).toContain('    padding: z.enum(["sm", "md"]).optional(),');
    expect(code).toContain('  slots: ["default"],');
    expect(code).toContain('  description: "A card container.",');
    expect(code.endsWith('},\n')).toBe(true);
  });
});

describe('filename helpers', () => {
  it('creates a safe download slug', () => {
    expect(slugifyCatalogName('Analytics dashboard')).toBe('analytics-dashboard');
    expect(catalogFileName('Analytics dashboard')).toBe('analytics-dashboard.catalog.ts');
    expect(catalogFileName('数据面板')).toBe('catalog.catalog.ts');
  });
});
