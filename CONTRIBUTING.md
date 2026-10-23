# Contributing to zodcat

Thanks for helping improve zodcat. This project is a focused tool for authoring json-render catalogs, so small, well-tested changes are preferred over broad rewrites.

## Setup

Requirements:

- Node.js 20.19 or newer. The CI baseline is Node 22.
- npm.

```bash
git clone https://github.com/Jianwen-Xu/zodcat.git
cd zodcat
npm install
npm run dev
```

Before opening a pull request:

```bash
npm test
npm run build
```

## Where things live

- `src/components/`: the three-pane interface.
- `src/data/library.ts`: built-in components and their localized descriptions.
- `src/data/templates.ts`: starter catalogs.
- `src/lib/codegen.ts`: catalog IR to `defineCatalog` code.
- `src/lib/validation.ts`: the guardrails.
- `src/lib/contentLocalization.ts`: keeps built-in copy in sync with the active language.
- `src/i18n.tsx`: English and Chinese UI strings.

## Rules for changes

- Keep code generation and validation as pure functions where possible, and add unit tests for behavior changes.
- Any new user-facing string must be added to both language dictionaries in `src/i18n.tsx`.
- Do not translate component identifiers, prop names, or TypeScript syntax. Those are code.
- User-edited content should not be rewritten by the language switch. Only built-in template and library copy may follow the active language.
- The tool has no backend and no accounts. Do not add network calls that send catalog content anywhere.
- Keep the generated output compatible with the current json-render `defineCatalog` API.

## Issues and pull requests

- Use the issue forms for bugs and feature requests.
- Keep pull requests focused. Include a short description, screenshots for visual changes, and the verification you ran.
- For security reports, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.

## License

By contributing, you agree that your contribution is licensed under the MIT License in [LICENSE](LICENSE).
