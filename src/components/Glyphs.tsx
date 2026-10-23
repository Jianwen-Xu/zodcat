import {
  Cards,
  ChartLineUp,
  CursorClick,
  Image as ImageIcon,
  ListChecks,
  Pulse,
  Rows,
  Shapes,
  Table,
  Tag,
  TextT,
  Textbox,
  ToggleLeft,
} from '@phosphor-icons/react';
import type { ComponentIcon } from '../types';
import type { CatalogTemplate } from '../types';

const COMPONENT_ICONS = {
  card: Cards,
  stack: Rows,
  button: CursorClick,
  input: Textbox,
  toggle: ToggleLeft,
  table: Table,
  badge: Tag,
  metric: ChartLineUp,
  text: TextT,
  image: ImageIcon,
  custom: Shapes,
};

const TEMPLATE_ICONS = {
  dashboard: ChartLineUp,
  form: ListChecks,
  monitor: Pulse,
};

export function ComponentGlyph({
  icon,
  size = 18,
  weight = 'regular',
}: {
  icon: ComponentIcon;
  size?: number;
  weight?: 'regular' | 'bold' | 'duotone' | 'fill';
}) {
  const Glyph = COMPONENT_ICONS[icon] ?? Shapes;
  return <Glyph size={size} weight={weight} aria-hidden="true" />;
}

export function TemplateGlyph({
  icon,
  size = 18,
}: {
  icon: CatalogTemplate['icon'];
  size?: number;
}) {
  const Glyph = TEMPLATE_ICONS[icon];
  return <Glyph size={size} weight="regular" aria-hidden="true" />;
}
