import { describe, expect, it } from 'vitest';
import type { CatalogConfig, ComponentConfig, PropConfig } from '../types';
import { countIssues, validateCatalog } from './validation';

function prop(overrides: Partial<PropConfig> = {}): PropConfig {
  return {
    id: 'prop_1',
    name: 'title',
    type: 'string',
    required: true,
    nullable: false,
    min: '1',
    max: '80',
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
  return { name: 'Test catalog', components };
}

describe('validateCatalog', () => {
  it('passes a focused, bounded catalog', () => {
    const issues = validateCatalog(catalog([component()]));
    expect(issues).toEqual([]);
  });

  it('flags z.any and z.unknown as escape hatches', () => {
    const issues = validateCatalog(
      catalog([component({ props: [prop({ type: 'any', min: '', max: '' })] })]),
    );
    expect(issues.some((issue) => issue.ruleId === 'escape-hatches')).toBe(true);
    expect(issues[0].severity).toBe('warning');
  });

  it('warns when a string prop has no length bounds', () => {
    const issues = validateCatalog(catalog([component({ props: [prop({ min: '', max: '' })] })]));
    expect(issues).toHaveLength(1);
    expect(issues[0].ruleId).toBe('bounded-props');
    expect(issues[0].message).toContain('no length bounds');
  });

  it('treats one bound as enough constraint', () => {
    const issues = validateCatalog(catalog([component({ props: [prop({ min: '', max: '40' })] })]));
    expect(issues).toEqual([]);
  });

  it('rejects empty enum values', () => {
    const issues = validateCatalog(
      catalog([component({ props: [prop({ type: 'enum', enumValues: [], min: '', max: '' })] })]),
    );
    expect(issues.some((issue) => issue.severity === 'error' && issue.message.includes('no values'))).toBe(true);
  });

  it('warns on a single-option enum', () => {
    const issues = validateCatalog(
      catalog([component({ props: [prop({ type: 'enum', enumValues: ['only'] })] })]),
    );
    expect(issues.some((issue) => issue.message.includes('only one allowed value'))).toBe(true);
  });

  it('rejects invalid string bounds and inverted ranges', () => {
    const invalid = validateCatalog(catalog([component({ props: [prop({ min: 'abc' })] })]));
    expect(invalid.some((issue) => issue.severity === 'error')).toBe(true);

    const inverted = validateCatalog(catalog([component({ props: [prop({ min: '20', max: '10' })] })]));
    expect(inverted.some((issue) => issue.message.includes('greater than its maximum'))).toBe(true);
  });

  it('rejects duplicate component and prop names', () => {
    const issues = validateCatalog(
      catalog([
        component(),
        component({ id: 'cmp_2' }),
        component({ id: 'cmp_3', name: 'Row', props: [prop(), prop({ id: 'prop_2' })] }),
      ]),
    );
    expect(issues.some((issue) => issue.message.includes('used more than once'))).toBe(true);
    expect(issues.some((issue) => issue.message.includes('appears twice'))).toBe(true);
  });

  it('warns past eight components', () => {
    const components = Array.from({ length: 9 }, (_, index) =>
      component({ id: `cmp_${index}`, name: `Component${index}` }),
    );
    const issues = validateCatalog(catalog(components));
    expect(issues.some((issue) => issue.ruleId === 'focused-catalog')).toBe(true);
  });

  it('reports an empty catalog', () => {
    const issues = validateCatalog(catalog([]));
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe('error');
  });

  it('localizes findings when a locale is provided', () => {
    const issues = validateCatalog(
      catalog([component({ props: [prop({ min: '', max: '' })] })]),
      'zh',
    );
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('没有长度限制');
    expect(issues[0].hint).toContain('模型');
  });

  it('counts issues by severity', () => {
    expect(
      countIssues([
        {
          id: 'a',
          ruleId: 'valid-shape',
          severity: 'error',
          message: 'a',
        },
        {
          id: 'b',
          ruleId: 'bounded-props',
          severity: 'warning',
          message: 'b',
        },
      ]),
    ).toEqual({ errors: 1, warnings: 1 });
  });
});
