import type {
  CatalogConfig,
  ComponentConfig,
  Locale,
  PropConfig,
  ValidationIssue,
} from '../types';
import { translate } from '../i18n';

export const GUARDRAILS = [
  {
    id: 'escape-hatches',
    labelKey: 'guardrail.escapeHatches.label',
    detailKey: 'guardrail.escapeHatches.detail',
  },
  {
    id: 'bounded-props',
    labelKey: 'guardrail.boundedProps.label',
    detailKey: 'guardrail.boundedProps.detail',
  },
  {
    id: 'focused-catalog',
    labelKey: 'guardrail.focusedCatalog.label',
    detailKey: 'guardrail.focusedCatalog.detail',
  },
  {
    id: 'valid-shape',
    labelKey: 'guardrail.validShape.label',
    detailKey: 'guardrail.validShape.detail',
  },
] as const;

const MAX_COMPONENTS = 8;
const PASCAL_CASE = /^[A-Z][A-Za-z0-9]*$/;

function issue(
  ruleId: string,
  severity: ValidationIssue['severity'],
  message: string,
  context: Omit<ValidationIssue, 'id' | 'ruleId' | 'severity' | 'message'>,
): ValidationIssue {
  return {
    id: `${ruleId}:${context.componentId ?? 'catalog'}:${context.propId ?? 'root'}`,
    ruleId,
    severity,
    message,
    ...context,
  };
}

function validateBound(
  prop: PropConfig,
  bound: 'min' | 'max',
  integerOnly: boolean,
  component: ComponentConfig,
  locale: Locale,
): ValidationIssue | null {
  const raw = prop[bound].trim();
  if (raw === '') return null;

  const parsed = Number(raw);
  const invalid = !Number.isFinite(parsed) || (integerOnly && (!Number.isInteger(parsed) || parsed < 0));

  if (invalid) {
    const boundKey =
      integerOnly
        ? bound === 'min'
          ? 'validation.bound.minLength'
          : 'validation.bound.maxLength'
        : bound === 'min'
          ? 'validation.bound.min'
          : 'validation.bound.max';
    const messageKey = integerOnly
      ? 'validation.invalidIntegerBound.message'
      : 'validation.invalidNumberBound.message';
    const hintKey = integerOnly
      ? 'validation.invalidIntegerBound.hint'
      : 'validation.invalidNumberBound.hint';

    return issue('valid-shape', 'error', translate(locale, messageKey, {
      name: prop.name,
      bound: translate(locale, boundKey),
    }), {
      hint: translate(locale, hintKey),
      componentId: component.id,
      componentName: component.name,
      propId: prop.id,
      propName: prop.name,
    });
  }

  return null;
}

function validateBounds(
  component: ComponentConfig,
  prop: PropConfig,
  locale: Locale,
): ValidationIssue[] {
  if (prop.type !== 'string' && prop.type !== 'number') return [];

  const issues: ValidationIssue[] = [];
  const integerOnly = prop.type === 'string';

  const minIssue = validateBound(prop, 'min', integerOnly, component, locale);
  const maxIssue = validateBound(prop, 'max', integerOnly, component, locale);
  if (minIssue) issues.push(minIssue);
  if (maxIssue) issues.push(maxIssue);
  if (issues.length > 0) return issues;

  const min = prop.min.trim() === '' ? null : Number(prop.min);
  const max = prop.max.trim() === '' ? null : Number(prop.max);

  if (min !== null && max !== null && min > max) {
    issues.push(
      issue(
        'valid-shape',
        'error',
        translate(locale, 'validation.invertedBounds.message', { name: prop.name }),
        {
          hint: translate(locale, 'validation.invertedBounds.hint'),
          componentId: component.id,
          componentName: component.name,
          propId: prop.id,
          propName: prop.name,
        },
      ),
    );
  }

  return issues;
}

function validateProp(component: ComponentConfig, prop: PropConfig, locale: Locale): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const context = {
    componentId: component.id,
    componentName: component.name,
    propId: prop.id,
    propName: prop.name,
  };

  if (!prop.name.trim()) {
    issues.push(issue('valid-shape', 'error', translate(locale, 'validation.missingPropName.message'), context));
    return issues;
  }

  if (prop.type === 'any' || prop.type === 'unknown') {
    issues.push(
      issue(
        'escape-hatches',
        'warning',
        translate(locale, 'validation.escapeHatch.message', { name: prop.name, type: prop.type }),
        {
          hint: translate(locale, 'validation.escapeHatch.hint', { type: prop.type }),
          ...context,
        },
      ),
    );
  }

  if (prop.type === 'enum') {
    const values = prop.enumValues.map((value) => value.trim()).filter(Boolean);
    const unique = new Set(values.map((value) => value.toLowerCase()));

    if (values.length === 0) {
      issues.push(
        issue('valid-shape', 'error', translate(locale, 'validation.emptyEnum.message', { name: prop.name }), {
          hint: translate(locale, 'validation.emptyEnum.hint'),
          ...context,
        }),
      );
    } else if (values.length === 1) {
      issues.push(
        issue('valid-shape', 'warning', translate(locale, 'validation.singleEnum.message', { name: prop.name }), {
          hint: translate(locale, 'validation.singleEnum.hint'),
          ...context,
        }),
      );
    } else if (unique.size !== values.length) {
      issues.push(
        issue('valid-shape', 'warning', translate(locale, 'validation.duplicateEnum.message', { name: prop.name }), {
          hint: translate(locale, 'validation.duplicateEnum.hint'),
          ...context,
        }),
      );
    }
  }

  if ((prop.type === 'string' || prop.type === 'number') && prop.min.trim() === '' && prop.max.trim() === '') {
    const messageKey =
      prop.type === 'string' ? 'validation.unboundedString.message' : 'validation.unboundedNumber.message';
    const hintKey =
      prop.type === 'string' ? 'validation.unboundedString.hint' : 'validation.unboundedNumber.hint';

    issues.push(
      issue('bounded-props', 'warning', translate(locale, messageKey, { name: prop.name }), {
        hint: translate(locale, hintKey),
        ...context,
      }),
    );
  }

  issues.push(...validateBounds(component, prop, locale));
  return issues;
}

export function validateCatalog(catalog: CatalogConfig, locale: Locale = 'en'): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (catalog.components.length === 0) {
    issues.push(
      issue('valid-shape', 'error', translate(locale, 'validation.empty.message'), {
        hint: translate(locale, 'validation.empty.hint'),
      }),
    );
    return issues;
  }

  if (catalog.components.length > MAX_COMPONENTS) {
    issues.push(
      issue(
        'focused-catalog',
        'warning',
        translate(locale, 'validation.tooMany.message', { count: catalog.components.length }),
        {
          hint: translate(locale, 'validation.tooMany.hint'),
        },
      ),
    );
  }

  const componentNames = new Map<string, ComponentConfig[]>();

  for (const component of catalog.components) {
    const normalizedName = component.name.trim().toLowerCase();
    const context = { componentId: component.id, componentName: component.name };

    if (!component.name.trim()) {
      issues.push(
        issue('valid-shape', 'error', translate(locale, 'validation.missingComponentName.message'), context),
      );
    } else if (!PASCAL_CASE.test(component.name.trim())) {
      issues.push(
        issue(
          'valid-shape',
          'warning',
          translate(locale, 'validation.pascalCase.message', { name: component.name }),
          {
            hint: translate(locale, 'validation.pascalCase.hint'),
            ...context,
          },
        ),
      );
    }

    if (!component.description.trim()) {
      issues.push(
        issue(
          'valid-shape',
          'warning',
          translate(locale, 'validation.missingDescription.message', {
            name: component.name || translate(locale, 'prop.unnamed'),
          }),
          {
            hint: translate(locale, 'validation.missingDescription.hint'),
            ...context,
          },
        ),
      );
    }

    const existing = componentNames.get(normalizedName) ?? [];
    existing.push(component);
    componentNames.set(normalizedName, existing);
    if (existing.length > 1) {
      issues.push(
        issue(
          'valid-shape',
          'error',
          translate(locale, 'validation.duplicateComponent.message', { name: component.name }),
          {
            hint: translate(locale, 'validation.duplicateComponent.hint'),
            ...context,
          },
        ),
      );
    }

    const propNames = new Set<string>();
    for (const prop of component.props) {
      const normalizedProp = prop.name.trim().toLowerCase();
      if (normalizedProp && propNames.has(normalizedProp)) {
        issues.push(
          issue(
            'valid-shape',
            'error',
            translate(locale, 'validation.duplicateProp.message', {
              name: prop.name,
              component: component.name,
            }),
            {
              hint: translate(locale, 'validation.duplicateProp.hint'),
              componentId: component.id,
              componentName: component.name,
              propId: prop.id,
              propName: prop.name,
            },
          ),
        );
      }
      if (normalizedProp) propNames.add(normalizedProp);

      issues.push(...validateProp(component, prop, locale));
    }
  }

  return issues.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === 'error' ? -1 : 1;
    return 0;
  });
}

export function countIssues(issues: ValidationIssue[]): { errors: number; warnings: number } {
  return issues.reduce(
    (counts, current) => {
      if (current.severity === 'error') counts.errors += 1;
      else counts.warnings += 1;
      return counts;
    },
    { errors: 0, warnings: 0 },
  );
}
