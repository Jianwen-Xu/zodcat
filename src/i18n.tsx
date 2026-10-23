import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Locale } from './types';

const en = {
  'page.title': 'zodcat / catalog studio',
  'header.brandCaption': 'catalog studio',
  'header.workspace': 'workspace',
  'header.local': 'local',
  'header.currentCatalog': 'Current catalog',
  'header.docs': 'json-render docs',
  'header.download': 'Download',
  'header.copy': 'Copy code',
  'header.copied': 'Copied',
  'header.downloadAria': 'Download generated catalog',
  'header.copyAria': 'Copy generated catalog code',
  'header.languageTarget': '中文',
  'header.languageAria': 'Switch language to Chinese',

  'common.cancel': 'Cancel',
  'common.undo': 'Undo',
  'common.dismiss': 'Dismiss notification',
  'common.selectAll': 'Select all',
  'common.done': 'Done',
  'common.copy': 'Copy',
  'common.copied': 'Copied',

  'status.allPass': 'All checks pass',
  'status.browserOnly': 'Runs entirely in your browser',
  'status.statsAria': 'Catalog statistics',
  'count.blocking.one': '{count} blocking issue',
  'count.blocking.other': '{count} blocking issues',
  'count.suggestion.one': '{count} suggestion',
  'count.suggestion.other': '{count} suggestions',
  'count.component.one': '{count} component',
  'count.component.other': '{count} components',
  'count.prop.one': '{count} prop',
  'count.prop.other': '{count} props',
  'count.field.one': '{count} field',
  'count.field.other': '{count} fields',
  'count.templateComponent.one': '{count} comp',
  'count.templateComponent.other': '{count} comps',
  'count.check.one': '{count} check',
  'count.check.other': '{count} checks',

  'library.eyebrow': 'Build',
  'library.title': 'Component library',
  'library.countAria': '{count} library components',
  'library.startFrom': 'Start from',
  'library.blank': 'Blank',
  'library.components': 'Components',
  'library.addRemove': 'add / remove',
  'library.searchLabel': 'Search components',
  'library.searchPlaceholder': 'Search the library',
  'library.noMatch': 'No components match "{query}". Try a broader search.',
  'library.custom': 'Custom component',
  'library.customHint': 'Start from an empty schema',
  'library.newComponent': 'New component',
  'library.componentName': 'Component name',
  'library.namePlaceholder': 'e.g. Timeline',
  'library.cancelAria': 'Cancel custom component',
  'library.nameRequired': 'Give the component a name first.',
  'library.nameInvalid': 'Use a JS-safe name: letters, numbers, or underscores, starting with a letter.',
  'library.nameDuplicate': 'That component name is already in the catalog.',
  'library.addComponent': 'Add component',
  'library.openAria': 'Open {name} in the catalog',
  'library.addAria': 'Add {name} to the catalog',
  'library.removeAria': 'Remove {name} from the catalog',

  'catalog.eyebrow': 'Catalog',
  'catalog.untitled': 'Untitled catalog',
  'catalog.editorAria': 'Catalog editor',
  'catalog.componentLabel.one': 'component',
  'catalog.componentLabel.other': 'components',
  'catalog.propLabel.one': 'prop',
  'catalog.propLabel.other': 'props',
  'catalog.nameAria': 'Catalog name',
  'catalog.nameTitle': 'Click to rename this catalog',
  'catalog.statsAria': '{components} components and {props} props',
  'catalog.addComponent': 'Add component',
  'catalog.emptyEyebrow': 'Empty catalog',
  'catalog.emptyTitle': 'Give the model a vocabulary.',
  'catalog.emptyBody':
    'Pick components from the library. Each one becomes a Zod contract the model can target, and nothing else gets through.',
  'catalog.browse': 'Browse components',
  'catalog.footerWith':
    'The generated catalog is the guardrail. If it is not in the schema, the model cannot use it.',
  'catalog.footerEmpty': 'Start with a template or add your own components.',

  'component.untitled': 'Untitled',
  'component.unnamed': 'Unnamed component',
  'component.descriptionFallback': 'No description yet, the model will have to guess.',
  'component.removeAria': 'Remove {name} from the catalog',
  'component.removeTitle': 'Remove component',
  'component.nameLabel': 'Component name',
  'component.descriptionLabel': 'Description',
  'component.descriptionPlaceholder': 'What is this component for?',
  'component.acceptsChildren': 'Accepts children',
  'component.defaultSlot': 'Adds the default slot',
  'component.propsHeading': 'Props',
  'component.requiredHelper': 'Required is checked by default',
  'component.noProps': 'No props yet. Add one to shape what the model can pass in.',
  'component.addProp': 'Add property',
  'component.emptyPropsNote': 'Empty props produce z.object({})',
  'component.inContract': 'in this contract',
  'component.fieldCount': '{fields} {inContract}',
  'component.modeGroupAria': '{name} view',
  'component.modeProps': 'Props',
  'component.modeCode': 'Code',
  'component.copyAria': 'Copy {name} TypeScript snippet',
  'component.codeViewAria': '{name} TypeScript fragment',
  'component.fragment': 'component fragment',
  'component.codeHint':
    'Paste this under components in catalog.ts. The full file already includes the imports.',

  'prop.table.property': 'Property',
  'prop.table.type': 'Type',
  'prop.table.rules': 'Rules',
  'prop.table.flags': 'Flags',
  'prop.nameAria': 'Property name in {component}',
  'prop.typeAria': 'Type for {name}',
  'prop.length': 'Length',
  'prop.range': 'Range',
  'prop.values': 'Values',
  'prop.noParams': 'No extra parameters',
  'prop.escapeBypass': 'bypasses the contract',
  'prop.minLen': 'min len',
  'prop.maxLen': 'max len',
  'prop.min': 'min',
  'prop.max': 'max',
  'prop.minLengthAria': '{name} minimum length',
  'prop.maxLengthAria': '{name} maximum length',
  'prop.minValueAria': '{name} minimum value',
  'prop.maxValueAria': '{name} maximum value',
  'prop.enumPlaceholder': 'value, Enter to add',
  'prop.addValueAria': 'Add allowed value for {name}',
  'prop.addValue': 'value',
  'prop.removeEnumAria': 'Remove enum value {value}',
  'prop.escapeGroup': 'Escape hatch',
  'prop.required': 'Required',
  'prop.nullable': 'Nullable',
  'prop.requiredTitle': 'When off, the generated schema appends .optional()',
  'prop.nullableTitle': 'When on, the generated schema appends .nullable()',
  'prop.removeAria': 'Remove prop {name}',
  'prop.removeTitle': 'Remove prop',
  'prop.unnamed': 'without a name',

  'code.checksTab': 'Checks',
  'code.panelAria': 'Generated catalog code and checks',
  'code.tabsAria': 'Output views',
  'code.viewAria': 'Generated catalog TypeScript',
  'code.copyAria': 'Copy generated TypeScript',
  'code.copyShort': 'Copy',
  'code.status.blocking.one': '{count} blocking issue to resolve',
  'code.status.blocking.other': '{count} blocking issues to resolve',
  'code.status.suggestion.one': '{count} suggestion to review',
  'code.status.suggestion.other': '{count} suggestions to review',
  'code.status.clean': 'Catalog passes all checks',
  'code.review': 'Review',

  'checks.liveAudit': 'Live audit',
  'checks.cleanTitle': 'Catalog passes the gate.',
  'checks.cleanBody':
    'No escape hatches, every bound is set, and the vocabulary stays focused.',
  'checks.errorTitle': 'Fix before shipping.',
  'checks.warningTitle': 'Tighten the edges.',
  'checks.body.errors': '{errors} across this catalog.',
  'checks.body.warnings': '{warnings} to review across this catalog.',
  'checks.body.both': '{errors} and {warnings} across this catalog.',
  'checks.guardrails': 'Guardrails',
  'checks.runsOnEveryKeystroke': 'run on every keystroke',
  'checks.pass': 'pass',
  'checks.fix': 'fix',
  'checks.footnote':
    'The audit runs locally in this tab. Nothing is uploaded, and the generated code is the only artifact.',
  'checks.issueListAria': 'Validation findings',
  'checks.locationCatalog': 'Catalog',
  'checks.ruleFallback': 'Rule',
  'checks.openComponent': 'Open component',

  'guardrail.escapeHatches.label': 'No escape hatches',
  'guardrail.escapeHatches.detail':
    'z.any() and z.unknown() weaken the contract the model has to follow.',
  'guardrail.boundedProps.label': 'Bounded props',
  'guardrail.boundedProps.detail':
    'Strings and numbers carry explicit limits so generation has a target.',
  'guardrail.focusedCatalog.label': 'Focused catalog',
  'guardrail.focusedCatalog.detail':
    'Eight components or fewer keeps the vocabulary and the prompt precise.',
  'guardrail.validShape.label': 'Valid shape',
  'guardrail.validShape.detail': 'Unique names, complete enums, and bounds that make sense.',

  'copyFallback.eyebrow': 'Clipboard fallback',
  'copyFallback.title': 'Copy the code manually.',
  'copyFallback.intro':
    'Your browser blocked clipboard access. The code is selected below. Press Ctrl+C or Cmd+C to copy it.',
  'copyFallback.selectAll': 'Select all',
  'copyFallback.done': 'Done',
  'copyFallback.local': 'Nothing has left this tab.',
  'copyFallback.closeAria': 'Close copy dialog',
  'copyFallback.codeAria': 'Generated catalog TypeScript',

  'toast.copiedCatalog': 'Copied generated catalog.ts',
  'toast.copiedSnippet': 'Copied {name} snippet',
  'toast.clipboardBlocked': 'Clipboard access was blocked',
  'toast.loadedTemplate': 'Loaded the {name} starter',
  'toast.blank': 'Started a blank catalog',
  'toast.removedComponent': 'Removed {name}',
  'toast.removedProp': 'Removed prop {name}',
  'toast.downloaded': 'Downloaded {filename}',

  'validation.empty.message': 'The catalog has no components.',
  'validation.empty.hint': 'Add at least one component from the library before generating a catalog.',
  'validation.tooMany.message': '{count} components is a lot for one catalog.',
  'validation.tooMany.hint':
    'Split by surface, for example shell components in one catalog and form components in another.',
  'validation.missingComponentName.message': 'A component is missing its name.',
  'validation.pascalCase.message': '"{name}" is not in PascalCase.',
  'validation.pascalCase.hint':
    'Component names conventionally start with a capital letter and contain no spaces.',
  'validation.missingDescription.message': '"{name}" has no description.',
  'validation.missingDescription.hint':
    'A short description is how the model knows when to choose this component.',
  'validation.duplicateComponent.message': 'Component name "{name}" is used more than once.',
  'validation.duplicateComponent.hint': 'Every component key must be unique.',
  'validation.missingPropName.message': 'A prop is missing its name.',
  'validation.duplicateProp.message': 'Prop "{name}" appears twice in {component}.',
  'validation.duplicateProp.hint': 'Two props cannot share the same key inside z.object().',
  'validation.escapeHatch.message': '"{name}" uses z.{type}(), so it accepts anything.',
  'validation.escapeHatch.hint':
    'Replace z.{type}() with a concrete type: string, number, boolean, or an enum.',
  'validation.emptyEnum.message': '"{name}" is an enum with no values.',
  'validation.emptyEnum.hint': 'Add at least two allowed values.',
  'validation.singleEnum.message': '"{name}" has only one allowed value.',
  'validation.singleEnum.hint': 'Add another option or model the prop as a boolean.',
  'validation.duplicateEnum.message': '"{name}" contains duplicate enum values.',
  'validation.duplicateEnum.hint':
    'Remove repeated options so the generated contract stays unambiguous.',
  'validation.unboundedString.message': '"{name}" has no length bounds.',
  'validation.unboundedString.hint':
    'Add a minimum or maximum length to give the model a shape.',
  'validation.unboundedNumber.message': '"{name}" has no range bounds.',
  'validation.unboundedNumber.hint':
    'Add a minimum or maximum value to prevent nonsense numbers.',
  'validation.invalidIntegerBound.message':
    'The {bound} on "{name}" is not a valid non-negative integer.',
  'validation.invalidIntegerBound.hint':
    'Use a whole number of characters, or leave it blank.',
  'validation.invalidNumberBound.message': 'The {bound} on "{name}" is not a valid number.',
  'validation.invalidNumberBound.hint': 'Use a finite number, or leave it blank.',
  'validation.invertedBounds.message': '"{name}" has a minimum greater than its maximum.',
  'validation.invertedBounds.hint': 'Flip the values or narrow the range.',
  'validation.bound.min': 'minimum',
  'validation.bound.max': 'maximum',
  'validation.bound.minLength': 'minimum length',
  'validation.bound.maxLength': 'maximum length',
} as const;

export type MessageKey = keyof typeof en;
export type MessageParams = Record<string, string | number>;

const zh: Record<MessageKey, string> = {
  'page.title': 'zodcat / Catalog 工作台',
  'header.brandCaption': 'catalog 工作台',
  'header.workspace': '工作区',
  'header.local': '本地',
  'header.currentCatalog': '当前 Catalog',
  'header.docs': 'json-render 文档',
  'header.download': '下载',
  'header.copy': '复制代码',
  'header.copied': '已复制',
  'header.downloadAria': '下载生成的 catalog',
  'header.copyAria': '复制生成的 catalog 代码',
  'header.languageTarget': 'EN',
  'header.languageAria': '切换为英文',

  'common.cancel': '取消',
  'common.undo': '撤销',
  'common.dismiss': '关闭通知',
  'common.selectAll': '全选',
  'common.done': '完成',
  'common.copy': '复制',
  'common.copied': '已复制',

  'status.allPass': '全部检查通过',
  'status.browserOnly': '全程在浏览器本地运行',
  'status.statsAria': 'Catalog 统计',
  'count.blocking.one': '{count} 个阻塞问题',
  'count.blocking.other': '{count} 个阻塞问题',
  'count.suggestion.one': '{count} 条建议',
  'count.suggestion.other': '{count} 条建议',
  'count.component.one': '{count} 个组件',
  'count.component.other': '{count} 个组件',
  'count.prop.one': '{count} 个 Props',
  'count.prop.other': '{count} 个 Props',
  'count.field.one': '{count} 个字段',
  'count.field.other': '{count} 个字段',
  'count.templateComponent.one': '{count} 个',
  'count.templateComponent.other': '{count} 个',
  'count.check.one': '{count} 项检查',
  'count.check.other': '{count} 项检查',

  'library.eyebrow': '构建',
  'library.title': '组件库',
  'library.countAria': '组件库中有 {count} 个组件',
  'library.startFrom': '从模板开始',
  'library.blank': '空白',
  'library.components': '组件',
  'library.addRemove': '添加 / 删除',
  'library.searchLabel': '搜索组件',
  'library.searchPlaceholder': '搜索组件库',
  'library.noMatch': '没有匹配 “{query}” 的组件，试试更宽泛的关键词。',
  'library.custom': '自定义组件',
  'library.customHint': '从空 Schema 开始',
  'library.newComponent': '新建组件',
  'library.componentName': '组件名',
  'library.namePlaceholder': '例如 Timeline',
  'library.cancelAria': '取消自定义组件',
  'library.nameRequired': '请先给组件起个名字。',
  'library.nameInvalid': '请使用合法的组件名：字母、数字或下划线，并以字母开头。',
  'library.nameDuplicate': '这个组件名已经存在于 Catalog 中。',
  'library.addComponent': '添加组件',
  'library.openAria': '在 Catalog 中打开 {name}',
  'library.addAria': '将 {name} 添加到 Catalog',
  'library.removeAria': '从 Catalog 中移除 {name}',

  'catalog.eyebrow': 'Catalog',
  'catalog.untitled': '未命名 Catalog',
  'catalog.editorAria': 'Catalog 编辑器',
  'catalog.componentLabel.one': '个组件',
  'catalog.componentLabel.other': '个组件',
  'catalog.propLabel.one': '个 Props',
  'catalog.propLabel.other': '个 Props',
  'catalog.nameAria': 'Catalog 名称',
  'catalog.nameTitle': '点击重命名此 Catalog',
  'catalog.statsAria': '{components} 个组件，{props} 个 Props',
  'catalog.addComponent': '添加组件',
  'catalog.emptyEyebrow': '空 Catalog',
  'catalog.emptyTitle': '给模型一套可用的词汇。',
  'catalog.emptyBody':
    '从组件库中挑选组件。每个组件都会成为模型可以调用的 Zod 约束，其他内容无法穿透。',
  'catalog.browse': '浏览组件',
  'catalog.footerWith': '生成的 Catalog 就是护栏。Schema 里没有的东西，模型无法使用。',
  'catalog.footerEmpty': '从模板开始，或添加自己的组件。',

  'component.untitled': '未命名',
  'component.unnamed': '未命名组件',
  'component.descriptionFallback': '还没有描述，模型只能靠猜。',
  'component.removeAria': '从 Catalog 中移除 {name}',
  'component.removeTitle': '移除组件',
  'component.nameLabel': '组件名',
  'component.descriptionLabel': '描述',
  'component.descriptionPlaceholder': '这个组件用来做什么？',
  'component.acceptsChildren': '接受子组件',
  'component.defaultSlot': '添加 default slot',
  'component.propsHeading': 'Props',
  'component.requiredHelper': '默认必填',
  'component.noProps': '还没有 Props。添加一个，定义模型可以传入什么。',
  'component.addProp': '添加属性',
  'component.emptyPropsNote': '空 Props 会生成 z.object({})',
  'component.inContract': '位于此约束中',
  'component.fieldCount': '{fields}{inContract}',
  'component.modeGroupAria': '{name} 视图',
  'component.modeProps': 'Props',
  'component.modeCode': '代码',
  'component.copyAria': '复制 {name} 的 TypeScript 片段',
  'component.codeViewAria': '{name} 的 TypeScript 片段',
  'component.fragment': '组件片段',
  'component.codeHint': '粘贴到 catalog.ts 的 components 下。完整文件已包含 imports。',

  'prop.table.property': '属性',
  'prop.table.type': '类型',
  'prop.table.rules': '约束',
  'prop.table.flags': '标记',
  'prop.nameAria': '{component} 的属性名',
  'prop.typeAria': '{name} 的类型',
  'prop.length': '长度',
  'prop.range': '范围',
  'prop.values': '枚举值',
  'prop.noParams': '没有额外约束',
  'prop.escapeBypass': '绕过约束',
  'prop.minLen': '最小长度',
  'prop.maxLen': '最大长度',
  'prop.min': '最小',
  'prop.max': '最大',
  'prop.minLengthAria': '{name} 的最小长度',
  'prop.maxLengthAria': '{name} 的最大长度',
  'prop.minValueAria': '{name} 的最小值',
  'prop.maxValueAria': '{name} 的最大值',
  'prop.enumPlaceholder': '输入值后按 Enter',
  'prop.addValueAria': '为 {name} 添加枚举值',
  'prop.addValue': '添加值',
  'prop.removeEnumAria': '移除枚举值 {value}',
  'prop.escapeGroup': '逃逸类型',
  'prop.required': '必填',
  'prop.nullable': '可空',
  'prop.requiredTitle': '取消勾选后，生成的 schema 会追加 .optional()',
  'prop.nullableTitle': '勾选后，生成的 schema 会追加 .nullable()',
  'prop.removeAria': '移除属性 {name}',
  'prop.removeTitle': '移除属性',
  'prop.unnamed': '未命名',

  'code.checksTab': '检查',
  'code.panelAria': '生成的 Catalog 代码和检查',
  'code.tabsAria': '输出视图',
  'code.viewAria': '生成的 Catalog TypeScript 代码',
  'code.copyAria': '复制生成的 TypeScript',
  'code.copyShort': '复制',
  'code.status.blocking.one': '{count} 个阻塞问题待处理',
  'code.status.blocking.other': '{count} 个阻塞问题待处理',
  'code.status.suggestion.one': '{count} 条建议待检查',
  'code.status.suggestion.other': '{count} 条建议待检查',
  'code.status.clean': 'Catalog 已通过全部检查',
  'code.review': '查看',

  'checks.liveAudit': '实时检查',
  'checks.cleanTitle': 'Catalog 已通过质量门禁。',
  'checks.cleanBody': '没有逃逸类型，约束完整，组件范围保持聚焦。',
  'checks.errorTitle': '发布前需要修复。',
  'checks.warningTitle': '再收紧一下边界。',
  'checks.body.errors': '当前 Catalog 有 {errors}。',
  'checks.body.warnings': '当前 Catalog 有 {warnings}需要检查。',
  'checks.body.both': '当前 Catalog 有 {errors}，以及 {warnings}。',
  'checks.guardrails': '护栏',
  'checks.runsOnEveryKeystroke': '每次输入实时运行',
  'checks.pass': '通过',
  'checks.fix': '修复',
  'checks.footnote': '检查只在当前标签页本地运行。不会上传任何内容，最终产物只有生成的代码。',
  'checks.issueListAria': '校验结果',
  'checks.locationCatalog': 'Catalog',
  'checks.ruleFallback': '规则',
  'checks.openComponent': '打开组件',

  'guardrail.escapeHatches.label': '禁止逃逸类型',
  'guardrail.escapeHatches.detail': 'z.any() 和 z.unknown() 会削弱模型必须遵循的约束。',
  'guardrail.boundedProps.label': 'Props 必须有边界',
  'guardrail.boundedProps.detail': '字符串和数字需要明确限制，生成时才有可遵循的目标。',
  'guardrail.focusedCatalog.label': '保持 Catalog 聚焦',
  'guardrail.focusedCatalog.detail': '组件不超过八个，词表和提示词才能保持精确。',
  'guardrail.validShape.label': '结构有效',
  'guardrail.validShape.detail': '名称唯一、枚举完整、范围合理。',

  'copyFallback.eyebrow': '手动复制',
  'copyFallback.title': '手动复制代码。',
  'copyFallback.intro': '浏览器阻止了剪贴板访问。下方代码已选中，按 Ctrl+C 或 Cmd+C 复制。',
  'copyFallback.selectAll': '全选',
  'copyFallback.done': '完成',
  'copyFallback.local': '内容不会离开当前标签页。',
  'copyFallback.closeAria': '关闭复制弹窗',
  'copyFallback.codeAria': '生成的 Catalog TypeScript 代码',

  'toast.copiedCatalog': '已复制生成的 catalog.ts',
  'toast.copiedSnippet': '已复制 {name} 片段',
  'toast.clipboardBlocked': '剪贴板访问被阻止',
  'toast.loadedTemplate': '已加载 {name} 模板',
  'toast.blank': '已创建空白 Catalog',
  'toast.removedComponent': '已移除 {name}',
  'toast.removedProp': '已移除属性 {name}',
  'toast.downloaded': '已下载 {filename}',

  'validation.empty.message': 'Catalog 中还没有组件。',
  'validation.empty.hint': '生成 Catalog 前，请至少从组件库添加一个组件。',
  'validation.tooMany.message': '一个 Catalog 里有 {count} 个组件，偏多了。',
  'validation.tooMany.hint': '可以按界面拆分，例如一个 Catalog 放壳层组件，另一个放表单组件。',
  'validation.missingComponentName.message': '有一个组件缺少名称。',
  'validation.pascalCase.message': '“{name}” 不是 PascalCase。',
  'validation.pascalCase.hint': '组件名通常以大写字母开头，并且不包含空格。',
  'validation.missingDescription.message': '“{name}” 没有描述。',
  'validation.missingDescription.hint': '模型通过简短描述判断何时使用这个组件。',
  'validation.duplicateComponent.message': '组件名 “{name}” 重复了。',
  'validation.duplicateComponent.hint': '每个组件的 key 必须唯一。',
  'validation.missingPropName.message': '有一个属性缺少名称。',
  'validation.duplicateProp.message': '属性 “{name}” 在 {component} 中出现了两次。',
  'validation.duplicateProp.hint': '在 z.object() 中，两个属性不能使用相同的 key。',
  'validation.escapeHatch.message': '“{name}” 使用了 z.{type}()，会接受任意内容。',
  'validation.escapeHatch.hint':
    '把 z.{type}() 换成具体类型：string、number、boolean 或 enum。',
  'validation.emptyEnum.message': '“{name}” 是枚举，但没有任何值。',
  'validation.emptyEnum.hint': '至少添加两个允许值。',
  'validation.singleEnum.message': '“{name}” 只有一个允许值。',
  'validation.singleEnum.hint': '增加一个选项，或者把它改为 boolean。',
  'validation.duplicateEnum.message': '“{name}” 包含重复的枚举值。',
  'validation.duplicateEnum.hint': '移除重复项，保证生成的约束没有歧义。',
  'validation.unboundedString.message': '“{name}” 没有长度限制。',
  'validation.unboundedString.hint': '添加最小或最大长度，给模型一个明确范围。',
  'validation.unboundedNumber.message': '“{name}” 没有数值范围。',
  'validation.unboundedNumber.hint': '添加最小值或最大值，避免生成无意义的数字。',
  'validation.invalidIntegerBound.message': '“{name}” 的{bound}不是合法的非负整数。',
  'validation.invalidIntegerBound.hint': '使用整数个字符，或者留空。',
  'validation.invalidNumberBound.message': '“{name}” 的{bound}不是合法数字。',
  'validation.invalidNumberBound.hint': '使用有限数字，或者留空。',
  'validation.invertedBounds.message': '“{name}” 的最小值大于最大值。',
  'validation.invertedBounds.hint': '交换两个值，或者缩窄范围。',
  'validation.bound.min': '最小值',
  'validation.bound.max': '最大值',
  'validation.bound.minLength': '最小长度',
  'validation.bound.maxLength': '最大长度',
};

const dictionaries: Record<Locale, Record<MessageKey, string>> = { en, zh };

export function translate(locale: Locale, key: MessageKey, params: MessageParams = {}): string {
  const template = dictionaries[locale][key] ?? dictionaries.en[key];
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

export interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, params?: MessageParams) => string;
  tn: (oneKey: MessageKey, otherKey: MessageKey, count: number, params?: MessageParams) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

const LOCALE_KEY = 'zodcat:locale';

export function getInitialLocale(): Locale {
  try {
    const saved = window.localStorage.getItem(LOCALE_KEY);
    if (saved === 'en' || saved === 'zh') return saved;
  } catch {
    // Use the browser language when local storage is unavailable.
  }

  return typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('zh')
    ? 'zh'
    : 'en';
}

export function saveLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_KEY, locale);
  } catch {
    // Locale persistence is optional.
  }
}

export function I18nProvider({
  locale,
  setLocale,
  children,
}: {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  children: ReactNode;
}) {
  const value = useMemo<I18nValue>(() => {
    const t = (key: MessageKey, params?: MessageParams) => translate(locale, key, params);
    return {
      locale,
      setLocale,
      t,
      tn: (oneKey, otherKey, count, params = {}) =>
        t(count === 1 ? oneKey : otherKey, { ...params, count }),
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
}
